// Data management utilities for CRUD operations
import { membersService } from "../services/membersService";
import { eventsService } from "../services/eventsService";
import { articlesService } from "../services/articlesService";
import { therapyProgramsService } from "../services/therapyProgramsService";
import { forParentsService } from "../services/forParentsService";
import { coursesService } from "../services/coursesService";
import { supabase } from "../lib/supabase";

// Shared throttling state for expensive Supabase syncs
const MEMBERS_SYNC_COOLDOWN_MS = 60 * 1000; // 1 minute
let membersSyncPromise = null;
let lastMembersSyncTime = 0;

// Courses Management
export const coursesManager = {
  // Real-time subscription channel
  _subscription: null,

  // Get all courses - Fetches from Supabase first (source of truth), falls back to localStorage
  getAll: async (options = {}) => {
    if (typeof window === "undefined") return [];
    
    const useCache = options.useCache !== false; // Default to true for performance
    const forceRefresh = options.forceRefresh === true;
    
    // If we have cached data and not forcing refresh, return it immediately
    // Then refresh in background
    if (useCache && !forceRefresh) {
      const cached = localStorage.getItem("eacsl_courses");
      if (cached) {
        try {
          const cachedCourses = JSON.parse(cached);
          // Return cached data immediately, then refresh in background
          coursesManager.getAll({ forceRefresh: true, useCache: false }).catch(err => {
            console.warn('Background refresh failed:', err);
          });
          return cachedCourses;
        } catch (e) {
          console.error('Error parsing cached courses:', e);
        }
      }
    }
    
    // Fetch from Supabase (source of truth)
    try {
      console.log("🔄 Fetching courses from Supabase...");
      const { data, error } = await coursesService.getAll();
      
      if (error) {
        // If table doesn't exist, fall back to localStorage
        if (error.code === "TABLE_NOT_FOUND") {
          console.warn("⚠️ Courses table not found in Supabase. Using localStorage fallback.");
          return coursesManager._getAllFromLocalStorage();
        }
        
        // Other errors - log and fall back to localStorage
        console.error("❌ Error fetching from Supabase:", error);
        return coursesManager._getAllFromLocalStorage();
      }
      
      // Map Supabase courses to local format
      const supabaseCourses = data
        ? data.map((c) => coursesService.mapSupabaseToLocal(c))
        : [];
      
      // Save to localStorage as cache
      coursesManager.saveAll(supabaseCourses);
      
      console.log(`✅ Fetched ${supabaseCourses.length} courses from Supabase`);
      return supabaseCourses;
    } catch (err) {
      console.error("❌ Exception fetching from Supabase:", err);
      return coursesManager._getAllFromLocalStorage();
    }
  },
  
  // Internal helper to get from localStorage (fallback)
  _getAllFromLocalStorage: () => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("eacsl_courses");
    if (stored) {
      try {
      return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing courses from localStorage:", e);
        return [];
      }
    }
    return [];
  },

  // Save courses to localStorage (lightweight version without large image data)
  saveAll: (courses) => {
    try {
      // Create a lightweight version without large data URLs to avoid quota issues
      const lightweightCourses = courses.map(course => {
        const { image, instructorImage, ...rest } = course;
        // Only keep image URLs/paths, not full data URLs
        return {
          ...rest,
          // Keep image path/URL if it's a URL, otherwise remove large data URLs
          image: typeof image === 'string' && image.length < 500 ? image : (image?.substring(0, 100) || ''),
          instructorImage: typeof instructorImage === 'string' && instructorImage.length < 500 ? instructorImage : (instructorImage?.substring(0, 100) || ''),
        };
      });
      
      localStorage.setItem("eacsl_courses", JSON.stringify(lightweightCourses));
      // Also update the module (for immediate reflection)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("coursesUpdated", { detail: courses })
        );
      }
    } catch (error) {
      // Handle quota exceeded or other localStorage errors gracefully
      if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
        console.warn("⚠️ localStorage quota exceeded. Skipping cache. Supabase is the source of truth.");
        // Try to clear old data and save a minimal version
        try {
          const minimalCourses = courses.map(course => ({
            id: course.id,
            title: course.title,
            category: course.category,
            // Remove all large fields
          }));
          localStorage.setItem("eacsl_courses", JSON.stringify(minimalCourses));
          console.log("✅ Saved minimal course data to localStorage");
        } catch (retryError) {
          console.warn("⚠️ Could not save even minimal data to localStorage. Using Supabase only.");
          // Remove the item entirely if it's causing issues
          try {
            localStorage.removeItem("eacsl_courses");
          } catch (e) {
            // Ignore errors when removing
          }
        }
      } else {
        console.error("❌ Error saving to localStorage:", error);
      }
    }
  },

  // Add new course - Saves to Supabase first (source of truth), then updates localStorage cache
  add: async (course) => {
    // Prepare course data for Supabase
    const supabaseCourse = coursesService.mapLocalToSupabase(course);
    console.log("📤 Course data to save:", { original: course, mapped: supabaseCourse });

    // Save to Supabase FIRST (source of truth)
    try {
      console.log("💾 Saving course to Supabase...");
      const { data, error } = await coursesService.add(supabaseCourse);
      
      if (error) {
        // Handle table not found error - allow local storage fallback for development
        if (error.code === 'TABLE_NOT_FOUND') {
          console.warn("⚠️ Courses table doesn't exist in Supabase. Saving to localStorage only.");
          // For development: save to localStorage as fallback
          const localCourses = coursesManager._getAllFromLocalStorage();
          const tempId = localCourses.length > 0 ? Math.max(...localCourses.map((c) => c.id)) + 1 : 1;
          const localCourse = { ...course, id: tempId };
          coursesManager.saveAll([...localCourses, localCourse]);
          return localCourse;
        }
        
        // Check for RLS policy errors
        if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          console.error("❌ RLS Policy Error - Permission denied:", error);
          throw new Error(
            `Permission denied: ${error.message || 'You may not have permission to add courses. ' +
            'Please check your Supabase RLS policies or contact an administrator.'}`
          );
        }
        
        // Check for column/field errors
        if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist')) {
          console.error("❌ Column Error - Field doesn't exist in table:", error);
          throw new Error(
            `Database schema error: ${error.message || 'One or more fields don\'t exist in the courses table. ' +
            'Please update your Supabase table schema to include all required fields.'}`
          );
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to save course to Supabase:", error);
        throw new Error(`Failed to save course: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data returned from Supabase');
      }
      
      console.log("✅ Course successfully saved to Supabase:", data);
      
      // Map back to local format and merge with original course data to preserve extra fields
      const localCourse = {
        ...coursesService.mapSupabaseToLocal(data),
        // Preserve extra fields that aren't in Supabase
        ...Object.fromEntries(
          Object.entries(course).filter(([key]) => 
            !['id', 'title', 'description', 'instructor', 'price', 'duration', 'level', 'image_url', 'image_path', 'category', 'createdAt', 'updatedAt'].includes(key)
          )
        )
      };
      
      // Update localStorage cache (lightweight version - Supabase is source of truth)
      // If this fails due to quota, it's okay - we'll fetch from Supabase next time
      try {
        const localCourses = coursesManager._getAllFromLocalStorage();
        const exists = localCourses.some(c => c.id === localCourse.id);
        
        if (!exists) {
          coursesManager.saveAll([...localCourses, localCourse]);
          console.log("✅ Course added to localStorage cache");
        } else {
          // Update existing course
          const index = localCourses.findIndex(c => c.id === localCourse.id);
          if (index >= 0) {
            localCourses[index] = localCourse;
            coursesManager.saveAll(localCourses);
            console.log("✅ Course updated in localStorage cache");
          }
        }
      } catch (cacheError) {
        // localStorage cache failed, but that's okay - Supabase is the source of truth
        console.warn("⚠️ Could not update localStorage cache (quota exceeded?), but course is saved to Supabase:", cacheError);
        // Dispatch event anyway so UI updates
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("coursesUpdated"));
        }
      }
      
      return localCourse;
    } catch (err) {
      console.error("❌ Exception saving course to Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Update course - Updates Supabase first (source of truth), then updates localStorage cache
  update: async (id, updatedCourse) => {
    // Get current course from cache to merge with updates
    const localCourses = coursesManager._getAllFromLocalStorage();
    const existingCourse = localCourses.find((c) => c.id === id);
    
    if (!existingCourse) {
      console.error('Course not found with id:', id);
      throw new Error(`Course with id ${id} not found`);
    }

    // Merge updated fields with existing course data
    const completeCourse = {
      ...existingCourse,
      ...updatedCourse,
      id, // Preserve ID
    };

    // Map to Supabase format
    const supabaseCourse = coursesService.mapLocalToSupabase(completeCourse);

    // Update in Supabase FIRST (source of truth)
    try {
      console.log("💾 Updating course in Supabase...");
      const { data, error } = await coursesService.update(id, supabaseCourse);
      
      if (error) {
        // If course doesn't exist in Supabase, try to add it
        if (error.code === 'PGRST116' || error.message?.includes('No rows found') || error.message?.includes('not found')) {
          console.log("Course not found in Supabase, attempting to add instead...");
          const addResult = await coursesService.add(supabaseCourse);
          if (addResult.data && !addResult.error) {
            console.log("✅ Successfully added course to Supabase (was missing)");
            // Update localStorage with the new data
            const localCourse = coursesService.mapSupabaseToLocal(addResult.data);
            const localCourses = coursesManager._getAllFromLocalStorage();
            const index = localCourses.findIndex(c => c.id === id);
            if (index >= 0) {
              localCourses[index] = localCourse;
            } else {
              localCourses.push(localCourse);
            }
            coursesManager.saveAll(localCourses);
            return localCourse;
          } else if (addResult.error) {
            if (addResult.error.code === 'TABLE_NOT_FOUND') {
              // Table doesn't exist - fallback to localStorage for development
              console.warn("⚠️ Courses table doesn't exist. Saving to localStorage only.");
              const localCourses = coursesManager._getAllFromLocalStorage();
              const index = localCourses.findIndex((c) => c.id === id);
              if (index >= 0) {
                localCourses[index] = completeCourse;
                coursesManager.saveAll(localCourses);
              }
              return completeCourse;
            }
            throw new Error(`Failed to add course: ${addResult.error.message || 'Unknown error'}`);
          }
        } else if (error.code === 'TABLE_NOT_FOUND') {
          // Table doesn't exist - fallback to localStorage for development
          console.warn("⚠️ Courses table doesn't exist. Saving to localStorage only.");
          const localCourses = coursesManager._getAllFromLocalStorage();
          const index = localCourses.findIndex((c) => c.id === id);
          if (index >= 0) {
            localCourses[index] = completeCourse;
            coursesManager.saveAll(localCourses);
          }
          return completeCourse;
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to update course in Supabase:", error);
        throw new Error(`Failed to update course: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data returned from Supabase');
      }
      
      console.log("✅ Course successfully updated in Supabase:", data);
      
      // Map back to local format
      const localCourse = coursesService.mapSupabaseToLocal(data);
      
      // Update localStorage cache (lightweight version - Supabase is source of truth)
      // If this fails due to quota, it's okay - we'll fetch from Supabase next time
      try {
        const localCourses = coursesManager._getAllFromLocalStorage();
        const index = localCourses.findIndex((c) => c.id === id);
        if (index >= 0) {
          localCourses[index] = localCourse;
          coursesManager.saveAll(localCourses);
          console.log("✅ Course updated in localStorage cache");
        } else {
          // Course was added (new ID from Supabase)
          coursesManager.saveAll([...localCourses, localCourse]);
          console.log("✅ Course added to localStorage cache");
        }
      } catch (cacheError) {
        // localStorage cache failed, but that's okay - Supabase is the source of truth
        console.warn("⚠️ Could not update localStorage cache (quota exceeded?), but course is updated in Supabase:", cacheError);
        // Dispatch event anyway so UI updates
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("coursesUpdated"));
        }
      }
      
      return localCourse;
    } catch (err) {
      console.error("❌ Exception updating course in Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Delete course - Deletes from Supabase first (source of truth), then updates localStorage cache
  delete: async (id) => {
    // Delete from Supabase FIRST (source of truth)
    try {
      console.log("🗑️ Deleting course from Supabase...");
      const { error } = await coursesService.delete(id);
      
      if (error) {
        if (error.code === 'TABLE_NOT_FOUND') {
          // Table doesn't exist - fallback to localStorage for development
          console.warn("⚠️ Courses table doesn't exist. Deleting from localStorage only.");
          const localCourses = coursesManager._getAllFromLocalStorage();
          const filtered = localCourses.filter((c) => c.id !== id);
    coursesManager.saveAll(filtered);
    return true;
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to delete course from Supabase:", error);
        throw new Error(`Failed to delete course: ${error.message || 'Unknown error'}`);
      }
      
      console.log("✅ Course successfully deleted from Supabase");
      
      // Update localStorage cache
      const localCourses = coursesManager._getAllFromLocalStorage();
      const filtered = localCourses.filter((c) => c.id !== id);
      coursesManager.saveAll(filtered);
      console.log("✅ Course removed from localStorage cache");
      
      return true;
    } catch (err) {
      console.error("❌ Exception deleting course from Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },
  
  // Subscribe to real-time changes from Supabase
  subscribe: (callback) => {
    // Unsubscribe from previous subscription if exists
    if (coursesManager._subscription) {
      coursesManager._subscription.unsubscribe();
    }

    console.log("🔔 Setting up real-time subscription for courses...");
    
    coursesManager._subscription = supabase
      .channel('courses-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'courses'
        },
        async (payload) => {
          console.log('🔔 Real-time course change detected:', payload.eventType, payload);
          
          try {
            // Refresh courses from Supabase
            const { data, error } = await coursesService.getAll();
            
            if (!error && data) {
              const supabaseCourses = data.map((c) => coursesService.mapSupabaseToLocal(c));
              
              // Update localStorage cache
              coursesManager.saveAll(supabaseCourses);
              
              // Call the callback to notify UI
              if (callback && typeof callback === 'function') {
                callback(supabaseCourses, payload);
              }
              
              console.log('✅ Real-time update applied:', payload.eventType);
            } else {
              console.warn('⚠️ Failed to refresh courses after real-time change:', error);
            }
          } catch (err) {
            console.error('❌ Exception handling real-time change:', err);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active for courses');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Real-time subscription error - table may not exist');
        }
      });

    // Return unsubscribe function
    return () => {
      if (coursesManager._subscription) {
        coursesManager._subscription.unsubscribe();
        coursesManager._subscription = null;
        console.log('🔕 Real-time subscription unsubscribed');
      }
    };
  },

  // Unsubscribe from real-time changes
  unsubscribe: () => {
    if (coursesManager._subscription) {
      coursesManager._subscription.unsubscribe();
      coursesManager._subscription = null;
      console.log('🔕 Real-time subscription unsubscribed');
    }
  },

  // Fetch courses from Supabase and sync with local storage
  syncFromSupabase: async () => {
    try {
      const { data, error } = await coursesService.getAll();

      if (error) {
        if (
          error.code === "TABLE_NOT_FOUND" ||
          error.message?.includes("Table does not exist")
        ) {
          console.warn(
            "Courses table does not exist in Supabase. Please create it first."
          );
          return {
            synced: false,
            error: {
              ...error,
              userMessage:
                "Courses table does not exist. Please create it in Supabase first.",
            },
          };
        }
        console.warn("Failed to fetch courses from Supabase:", error);
        return { synced: false, error };
      }

      // Map Supabase courses to local format
      const supabaseCourses = data
        ? data.map((c) => coursesService.mapSupabaseToLocal(c))
        : [];

      // Get existing local courses (use cached data for fast access)
      const localCourses = coursesManager._getAllFromLocalStorage();

      // Start with Supabase courses as the source of truth
      const uniqueCourses = [...supabaseCourses];

      // Helper function to check if a course exists
      const courseExists = (course, coursesArray) => {
        return coursesArray.some(
          (existing) =>
            course.id && existing.id && course.id === existing.id
        );
      };

      // Get all Supabase course IDs
      const supabaseIds = new Set(
        supabaseCourses
          .map((c) => c.id)
          .filter((id) => id != null)
          .map((id) => Number(id))
      );

      // Add local-only courses (those that don't exist in Supabase)
      localCourses.forEach((localCourse) => {
        const existsInSupabase = courseExists(localCourse, supabaseCourses);

        if (!existsInSupabase) {
          const localId = localCourse.id ? Number(localCourse.id) : null;
          const wasSyncedBefore =
            localId !== null && !isNaN(localId) && !supabaseIds.has(localId);

          if (!wasSyncedBefore) {
            // This is a truly local-only course
            uniqueCourses.push(localCourse);
          }
        }
      });

      coursesManager.saveAll(uniqueCourses);

      // Dispatch event to notify UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("coursesUpdated", { detail: uniqueCourses })
        );
      }

      return {
        synced: true,
        count: supabaseCourses.length,
        error: null,
      };
    } catch (err) {
      console.error("Exception syncing courses from Supabase:", err);
      return { synced: false, error: err };
    }
  },

  // Push local courses to Supabase (for initial sync)
  syncToSupabase: async () => {
    try {
      const localCourses = coursesManager._getAllFromLocalStorage();
      let syncedCount = 0;
      let errorCount = 0;
      const errors = [];

      if (localCourses.length === 0) {
        console.log("ℹ️ No local courses to sync");
        return {
          synced: true,
          syncedCount: 0,
          errorCount: 0,
          total: 0,
          error: null,
        };
      }

      console.log(`📤 Syncing ${localCourses.length} course(s) to Supabase...`);

      for (const course of localCourses) {
        try {
          // Check if course already exists in Supabase
          let existingCourse = null;

          if (course.id) {
            const { data, error } = await coursesService.getById(course.id);
            if (!error && data) {
              existingCourse = data;
            }
          }

          if (existingCourse) {
            // Update existing course
            const { error } = await coursesService.update(course.id, course);
            if (!error) {
              syncedCount++;
              console.log(`✅ Updated course: ${course.title || course.id}`);
            } else if (error.code !== "TABLE_NOT_FOUND") {
              errorCount++;
              errors.push({ course: course.title || course.id, error });
              console.warn(`❌ Failed to update course ${course.title || course.id}:`, error);
            }
          } else {
            // Add new course
            const { error } = await coursesService.add(course);
            if (!error) {
              syncedCount++;
              console.log(`✅ Added course: ${course.title || course.id}`);
            } else if (error.code !== "TABLE_NOT_FOUND") {
              errorCount++;
              errors.push({ course: course.title || course.id, error });
              console.warn(`❌ Failed to add course ${course.title || course.id}:`, error);
            }
          }
        } catch (courseErr) {
          errorCount++;
          errors.push({ course: course.title || course.id, error: courseErr });
          console.error(`❌ Exception syncing course ${course.title || course.id}:`, courseErr);
        }
      }

      console.log(`✅ Sync to Supabase completed: ${syncedCount} synced, ${errorCount} errors`);

      return {
        synced: true,
        syncedCount,
        errorCount,
        total: localCourses.length,
        errors: errors.length > 0 ? errors : undefined,
        error:
          errorCount > 0
            ? { message: `${errorCount} course(s) failed to sync`, details: errors }
            : null,
      };
    } catch (err) {
      console.error("❌ Exception syncing to Supabase:", err);
      return { 
        synced: false, 
        error: {
          message: err.message || 'Unknown error occurred during sync',
          originalError: err
        }
      };
    }
  },
};

// Members Management
export const membersManager = {
  // Real-time subscription channel
  _subscription: null,
  
  // Get all members - Fetches from Supabase first (source of truth), falls back to localStorage
  getAll: async (options = {}) => {
    if (typeof window === "undefined") return [];
    
    const useCache = options.useCache !== false; // Default to true for performance
    const forceRefresh = options.forceRefresh === true;
    
    // If we have cached data and not forcing refresh, return it immediately
    // Then refresh in background
    if (useCache && !forceRefresh) {
      const cached = localStorage.getItem("eacsl_members");
      if (cached) {
        try {
          const cachedMembers = JSON.parse(cached);
          // Return cached data immediately, then refresh in background
          membersManager.getAll({ forceRefresh: true, useCache: false }).catch(err => {
            console.warn('Background refresh failed:', err);
          });
          return cachedMembers;
        } catch (e) {
          console.error('Error parsing cached members:', e);
        }
      }
    }
    
    // Fetch from Supabase (source of truth)
    try {
      console.log("🔄 Fetching members from Supabase...");
      const { data, error } = await membersService.getAll();
      
      if (error) {
        // If table doesn't exist, fall back to localStorage
        if (error.code === "TABLE_NOT_FOUND") {
          console.warn("⚠️ Members table not found in Supabase. Using localStorage fallback.");
          return membersManager._getAllFromLocalStorage();
        }
        
        // Other errors - log and fall back to localStorage
        console.error("❌ Error fetching from Supabase:", error);
        return membersManager._getAllFromLocalStorage();
      }
      
      // Map Supabase data to local format
      const supabaseMembers = data
        ? data.map((m) => membersService.mapSupabaseToLocal(m))
        : [];
      
      // Normalize members (ensure isActive field exists)
      const normalizedMembers = supabaseMembers.map((m) => {
        if (m.hasOwnProperty("isActive")) {
          return {
            ...m,
            isActive: Boolean(m.isActive),
          };
        } else {
          return {
            ...m,
            isActive: true,
          };
        }
      });
      
      // Save to localStorage as cache
      membersManager.saveAll(normalizedMembers);
      
      console.log(`✅ Fetched ${normalizedMembers.length} members from Supabase`);
      return normalizedMembers;
    } catch (err) {
      console.error("❌ Exception fetching from Supabase:", err);
      return membersManager._getAllFromLocalStorage();
    }
  },
  
  // Internal helper to get from localStorage (fallback)
  _getAllFromLocalStorage: () => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("eacsl_members");
    if (stored) {
      try {
      const members = JSON.parse(stored);
      // Ensure all members have isActive field (migrate old data)
      const normalizedMembers = members.map((m) => {
        if (m.hasOwnProperty("isActive")) {
          return {
            ...m,
            isActive: Boolean(m.isActive),
          };
        } else {
          return {
            ...m,
            isActive: true,
          };
        }
      });

      // Check if any member was missing isActive and save normalized data back
      const needsMigration = members.some((m) => !m.hasOwnProperty("isActive"));
      if (needsMigration) {
        membersManager.saveAll(normalizedMembers);
      }

      return normalizedMembers;
      } catch (e) {
        console.error('Error parsing localStorage members:', e);
        return [];
      }
    }
    return [];
  },

  // Save members to localStorage
  saveAll: (members) => {
    try {
      localStorage.setItem("eacsl_members", JSON.stringify(members));
      console.log('✅ Successfully saved', members.length, 'members to localStorage');
      // Also update the module (for immediate reflection)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("membersUpdated", { detail: members })
        );
      }
    } catch (error) {
      console.error('❌ Failed to save members to localStorage:', error);
      // If localStorage is full, try to clear some space or show error
      if (error.name === 'QuotaExceededError') {
        // Storage quota exceeded - log error (toast will be shown by caller if needed)
        console.error('Storage quota exceeded. Please clear some browser data or contact support.');
      }
    }
  },

  // Add new member - Saves to Supabase first (source of truth), then updates localStorage
  add: async (member) => {
    console.log("membersManager.add() called with member:", member);
    
    // Prepare member data
    const newMember = {
      ...member,
      isActive: member.isActive !== undefined ? member.isActive : true,
    };

    // Save to Supabase FIRST (source of truth)
    try {
      console.log("💾 Saving member to Supabase...");
      const { data, error } = await membersService.add(newMember);
      
      if (error) {
        // Handle table not found error - allow local storage fallback for development
        if (error.code === 'TABLE_NOT_FOUND') {
          console.warn("⚠️ Members table doesn't exist in Supabase. Saving to localStorage only.");
          // For development: save to localStorage as fallback
          const localMembers = membersManager._getAllFromLocalStorage();
          const tempId = localMembers.length > 0 ? Math.max(...localMembers.map((m) => m.id)) + 1 : 1;
          const localMember = { ...newMember, id: tempId };
          const updated = [...localMembers, localMember];
    membersManager.saveAll(updated);
          return localMember;
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to save member to Supabase:", error);
        throw new Error(`Failed to save member: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data returned from Supabase');
      }
      
      console.log("✅ Member successfully saved to Supabase:", data);
      
      // Update localStorage cache with the new member
      const localMembers = membersManager._getAllFromLocalStorage();
      const exists = localMembers.some(m => 
        m.id === data.id || 
        (data.supabaseUserId && m.supabaseUserId === data.supabaseUserId) ||
        (data.email && m.email === data.email)
      );
      
      if (!exists) {
        localMembers.push(data);
        membersManager.saveAll(localMembers);
        console.log("✅ Member added to localStorage cache");
    } else {
        // Update existing member
        const index = localMembers.findIndex(m => 
          m.id === data.id || 
          (data.supabaseUserId && m.supabaseUserId === data.supabaseUserId) ||
          (data.email && m.email === data.email)
        );
        if (index >= 0) {
          localMembers[index] = data;
          membersManager.saveAll(localMembers);
          console.log("✅ Member updated in localStorage cache");
        }
      }
      
      return data;
    } catch (err) {
      console.error("❌ Exception saving member to Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Update member - Updates Supabase first (source of truth), then updates localStorage cache
  update: async (id, updatedMember) => {
    console.log('membersManager.update called with id:', id, 'data:', updatedMember);
    
    // Get current member from cache to merge with updates
    const localMembers = membersManager._getAllFromLocalStorage();
    const existingMember = localMembers.find((m) => m.id === id);
    
    if (!existingMember) {
      console.error('Member not found with id:', id);
      throw new Error(`Member with id ${id} not found`);
    }

    // Merge updated fields with existing member data
    // IMPORTANT: Preserve exact isActive value from updatedMember if provided
    const isActiveValue = updatedMember.hasOwnProperty("isActive")
      ? Boolean(updatedMember.isActive)
      : existingMember.hasOwnProperty("isActive")
      ? Boolean(existingMember.isActive)
      : true;

    // Build complete member object with all fields
    const completeMember = {
      id, // Preserve ID
      supabaseUserId: existingMember.supabaseUserId || updatedMember.supabaseUserId || undefined,
      name: updatedMember.name !== undefined && updatedMember.name !== null && String(updatedMember.name).trim() !== ""
        ? String(updatedMember.name).trim()
        : (existingMember.name || ""),
      role: updatedMember.role !== undefined && updatedMember.role !== null && String(updatedMember.role).trim() !== ""
        ? String(updatedMember.role).trim()
        : (existingMember.role || "Member"),
      nationality: updatedMember.nationality !== undefined && updatedMember.nationality !== null && String(updatedMember.nationality).trim() !== ""
        ? String(updatedMember.nationality).trim()
        : (existingMember.nationality || "Egyptian"),
      flagCode: updatedMember.flagCode !== undefined && updatedMember.flagCode !== null && String(updatedMember.flagCode).trim() !== ""
        ? String(updatedMember.flagCode).trim()
        : (existingMember.flagCode || "eg"),
      description: updatedMember.description !== undefined && updatedMember.description !== null && String(updatedMember.description).trim() !== ""
        ? String(updatedMember.description).trim()
        : (existingMember.description || ""),
      fullDescription: updatedMember.fullDescription !== undefined && updatedMember.fullDescription !== null && String(updatedMember.fullDescription).trim() !== ""
        ? String(updatedMember.fullDescription).trim()
        : (existingMember.fullDescription || ""),
      email: updatedMember.email !== undefined && updatedMember.email !== null && String(updatedMember.email).trim() !== ""
        ? String(updatedMember.email).trim()
        : (existingMember.email || ""),
      membershipDate: updatedMember.membershipDate !== undefined && updatedMember.membershipDate !== null && String(updatedMember.membershipDate).trim() !== ""
        ? String(updatedMember.membershipDate).trim()
        : (existingMember.membershipDate || ""),
      isActive: isActiveValue,
      activeTill: updatedMember.activeTill !== undefined && updatedMember.activeTill !== null && String(updatedMember.activeTill).trim() !== ""
        ? String(updatedMember.activeTill).trim()
        : (existingMember.activeTill || ""),
      certificates: Array.isArray(updatedMember.certificates) && updatedMember.certificates.length > 0
        ? updatedMember.certificates
        : (Array.isArray(existingMember.certificates) ? existingMember.certificates : []),
      phone: updatedMember.phone !== undefined && updatedMember.phone !== null && String(updatedMember.phone).trim() !== ""
        ? String(updatedMember.phone).trim()
        : (existingMember.phone || ""),
      location: updatedMember.location !== undefined && updatedMember.location !== null && String(updatedMember.location).trim() !== ""
        ? String(updatedMember.location).trim()
        : (existingMember.location || ""),
      website: updatedMember.website !== undefined && updatedMember.website !== null && String(updatedMember.website).trim() !== ""
        ? String(updatedMember.website).trim()
        : (existingMember.website || ""),
      linkedin: updatedMember.linkedin !== undefined && updatedMember.linkedin !== null && String(updatedMember.linkedin).trim() !== ""
        ? String(updatedMember.linkedin).trim()
        : (existingMember.linkedin || ""),
      image: updatedMember.hasOwnProperty("image")
        ? (updatedMember.image !== null && updatedMember.image !== "" && String(updatedMember.image).trim() !== ""
          ? String(updatedMember.image).trim()
          : "")
        : (existingMember.image || ""),
      totalMoneySpent: updatedMember.totalMoneySpent !== undefined ? updatedMember.totalMoneySpent : (existingMember.totalMoneySpent || '0 EGP'),
      coursesEnrolled: updatedMember.coursesEnrolled !== undefined ? updatedMember.coursesEnrolled : (existingMember.coursesEnrolled || 0),
      totalHoursLearned: updatedMember.totalHoursLearned !== undefined ? updatedMember.totalHoursLearned : (existingMember.totalHoursLearned || 0),
      activeCourses: updatedMember.activeCourses !== undefined ? updatedMember.activeCourses : (existingMember.activeCourses || []),
      completedCourses: updatedMember.completedCourses !== undefined ? updatedMember.completedCourses : (existingMember.completedCourses || []),
    };

    // Update in Supabase FIRST (source of truth)
    try {
      console.log("💾 Updating member in Supabase...");
      const { data, error } = await membersService.update(id, completeMember);
      
      if (error) {
        // If member doesn't exist in Supabase, try to add it
        if (error.code === 'PGRST116' || error.message?.includes('No rows found') || error.message?.includes('not found')) {
          console.log("Member not found in Supabase, attempting to add instead...");
          const addResult = await membersService.add(completeMember);
          if (addResult.data && !addResult.error) {
            console.log("✅ Successfully added member to Supabase (was missing)");
            // Update localStorage with the new data
            const index = localMembers.findIndex(m => m.id === id);
            if (index >= 0) {
              localMembers[index] = addResult.data;
              membersManager.saveAll(localMembers);
            }
            return addResult.data;
          } else if (addResult.error) {
            if (addResult.error.code === 'TABLE_NOT_FOUND') {
              // Table doesn't exist - fallback to localStorage for development
              console.warn("⚠️ Members table doesn't exist. Saving to localStorage only.");
              const index = localMembers.findIndex(m => m.id === id);
              if (index >= 0) {
                localMembers[index] = completeMember;
                membersManager.saveAll(localMembers);
              }
              return completeMember;
            }
            throw new Error(`Failed to add member: ${addResult.error.message || 'Unknown error'}`);
          }
        } else if (error.code === 'TABLE_NOT_FOUND') {
          // Table doesn't exist - fallback to localStorage for development
          console.warn("⚠️ Members table doesn't exist. Saving to localStorage only.");
          const index = localMembers.findIndex(m => m.id === id);
          if (index >= 0) {
            localMembers[index] = completeMember;
            membersManager.saveAll(localMembers);
          }
          return completeMember;
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to update member in Supabase:", error);
        throw new Error(`Failed to update member: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data returned from Supabase');
      }
      
      console.log("✅ Member successfully updated in Supabase:", data);
      
      // Map Supabase data back to local format
      const mappedMember = membersService.mapSupabaseToLocal(data);
      
      // Update localStorage cache
      const index = localMembers.findIndex(m => m.id === id);
      if (index >= 0) {
        localMembers[index] = mappedMember;
        membersManager.saveAll(localMembers);
        console.log("✅ Member updated in localStorage cache");
      }
      
      return mappedMember;
    } catch (err) {
      console.error("❌ Exception updating member in Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Delete member - Deletes from Supabase first (source of truth), then updates localStorage cache
  delete: async (id) => {
    // Get member from cache first (for image deletion)
    const localMembers = membersManager._getAllFromLocalStorage();
    const memberToDelete = localMembers.find((m) => m.id === id);
    
    if (!memberToDelete) {
      console.warn(`Member with id ${id} not found in cache`);
      // Still try to delete from Supabase in case it exists there
    }
    
    // Delete member's image from storage if it exists in Supabase Storage
    if (memberToDelete && memberToDelete.image && memberToDelete.image.includes('dashboardmemberimages')) {
      try {
        await membersService.deleteImage(memberToDelete.image);
        console.log('✅ Deleted member image from storage');
      } catch (deleteError) {
        console.warn('Could not delete member image from storage:', deleteError);
        // Continue with member deletion even if image deletion fails
      }
    }

    // Delete from Supabase FIRST (source of truth)
    try {
      console.log("🗑️ Deleting member from Supabase...");
      const { error } = await membersService.delete(id);
      
      if (error) {
        if (error.code === 'TABLE_NOT_FOUND') {
          // Table doesn't exist - fallback to localStorage for development
          console.warn("⚠️ Members table doesn't exist. Deleting from localStorage only.");
          const filtered = localMembers.filter((m) => m.id !== id);
    membersManager.saveAll(filtered);
          return true;
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to delete member from Supabase:", error);
        throw new Error(`Failed to delete member: ${error.message || 'Unknown error'}`);
      }
      
      console.log("✅ Member successfully deleted from Supabase");
      
      // Update localStorage cache
      const filtered = localMembers.filter((m) => m.id !== id);
      membersManager.saveAll(filtered);
      console.log("✅ Member removed from localStorage cache");

    return true;
    } catch (err) {
      console.error("❌ Exception deleting member from Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Subscribe to real-time changes from Supabase
  subscribe: (callback) => {
    // Unsubscribe from previous subscription if exists
    if (membersManager._subscription) {
      membersManager._subscription.unsubscribe();
    }

    console.log("🔔 Setting up real-time subscription for members...");
    
    membersManager._subscription = supabase
      .channel('members-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'members'
        },
        async (payload) => {
          console.log('🔔 Real-time member change detected:', payload.eventType, payload);
          
          try {
            // Refresh members from Supabase
            const { data, error } = await membersService.getAll();
            
            if (!error && data) {
              const supabaseMembers = data.map((m) => membersService.mapSupabaseToLocal(m));
              
              // Normalize members
              const normalizedMembers = supabaseMembers.map((m) => {
                if (m.hasOwnProperty("isActive")) {
                  return { ...m, isActive: Boolean(m.isActive) };
                } else {
                  return { ...m, isActive: true };
                }
              });
              
              // Update localStorage cache
              membersManager.saveAll(normalizedMembers);
              
              // Call the callback to notify UI
              if (callback && typeof callback === 'function') {
                callback(normalizedMembers, payload);
              }
              
              console.log('✅ Real-time update applied:', payload.eventType);
            } else {
              console.warn('⚠️ Failed to refresh members after real-time change:', error);
            }
          } catch (err) {
            console.error('❌ Exception handling real-time change:', err);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active for members');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Real-time subscription error - table may not exist');
        }
      });

    // Return unsubscribe function
    return () => {
      if (membersManager._subscription) {
        membersManager._subscription.unsubscribe();
        membersManager._subscription = null;
        console.log('🔕 Real-time subscription unsubscribed');
      }
    };
  },

  // Unsubscribe from real-time changes
  unsubscribe: () => {
    if (membersManager._subscription) {
      membersManager._subscription.unsubscribe();
      membersManager._subscription = null;
      console.log('🔕 Real-time subscription unsubscribed');
    }
  },

  // Fetch members from Supabase and sync with local storage
  syncFromSupabase: async (options = {}) => {
    const force = options.force === true;
    const now = Date.now();

    if (membersSyncPromise) {
      return membersSyncPromise;
    }

    if (!force && now - lastMembersSyncTime < MEMBERS_SYNC_COOLDOWN_MS) {
      return {
        synced: false,
        skipped: true,
        reason: "COOLDOWN",
        nextAllowedIn: MEMBERS_SYNC_COOLDOWN_MS - (now - lastMembersSyncTime),
      };
    }

    membersSyncPromise = (async () => {
      try {
        console.log("🔄 Starting member sync from Supabase...");
        const { data, error } = await membersService.getAll();

        if (error) {
          // Check if it's a table not found error
          if (
            error.code === "TABLE_NOT_FOUND" ||
            error.message?.includes("Table does not exist")
          ) {
            console.warn(
              "Members table does not exist in Supabase. Please create it using the SQL script from SUPABASE_SETUP.md"
            );
            return {
              synced: false,
              error: {
                ...error,
                userMessage:
                  "Members table does not exist. Please create it in Supabase first. Check SUPABASE_SETUP.md for instructions.",
              },
            };
          }
          console.error("❌ Failed to fetch members from Supabase:", error);
          return { synced: false, error };
        }

        // Map Supabase members to local format
        const supabaseMembers = data
          ? data.map((m) => membersService.mapSupabaseToLocal(m))
          : [];

        // Get existing local members
        const localMembers = membersManager._getAllFromLocalStorage();

        // Merge Supabase and local members intelligently
        // IMPORTANT: Prefer LOCAL data as source of truth when member exists in both
        // This prevents local changes from being overwritten by stale Supabase data
        // Start with LOCAL members as base (they're more recent)
        const uniqueMembers = [...localMembers];

        // Helper function to check if a member exists in the array
        const memberExists = (member, membersArray) => {
          return membersArray.some(
            (existing) =>
              // Match by Supabase database ID (most reliable)
              (member.id && existing.id && member.id === existing.id) ||
              // Match by supabaseUserId (links to auth.users)
              (member.supabaseUserId &&
                existing.supabaseUserId &&
                member.supabaseUserId === existing.supabaseUserId) ||
              // Match by email (fallback, case-insensitive)
              (member.email &&
                existing.email &&
                member.email.trim().toLowerCase() ===
                  existing.email.trim().toLowerCase() &&
                member.email.trim() !== "")
          );
        };

        // Get all local member IDs for quick lookup
        const localIds = new Set(
          localMembers
            .map((m) => m.id)
            .filter((id) => id != null)
            .map((id) => Number(id))
        );

        // Add Supabase members that don't exist locally (new members from other devices/sources)
        supabaseMembers.forEach((supabaseMember) => {
          const existsLocally = memberExists(supabaseMember, localMembers);
          
          if (!existsLocally) {
            // This is a new member from Supabase that doesn't exist locally
            // Add it to the list
            uniqueMembers.push(supabaseMember);
          } else {
            // Member exists in both - prefer LOCAL data (it's more recent)
            // But merge in any fields from Supabase that might be missing locally
            const localMember = localMembers.find(
              (m) =>
                (supabaseMember.id && m.id && supabaseMember.id === m.id) ||
                (supabaseMember.supabaseUserId &&
                  m.supabaseUserId &&
                  supabaseMember.supabaseUserId === m.supabaseUserId) ||
                (supabaseMember.email &&
                  m.email &&
                  supabaseMember.email.trim().toLowerCase() ===
                    m.email.trim().toLowerCase() &&
                  supabaseMember.email.trim() !== "")
            );

            if (localMember) {
              // Merge: Use LOCAL as base (source of truth), but fill in missing fields from Supabase
              const mergedMember = {
                ...localMember, // LOCAL is the base - preserves all local changes
                // Only use Supabase values if local values are missing/empty
                supabaseUserId: localMember.supabaseUserId || supabaseMember.supabaseUserId || undefined,
                id: localMember.id || supabaseMember.id, // Preserve ID
                // Keep all local fields as-is - they're the most recent
              };

              // Replace the local version with merged version (in case we added missing fields)
              const index = uniqueMembers.findIndex(
                (m) =>
                  (mergedMember.id && m.id && mergedMember.id === m.id) ||
                  (mergedMember.supabaseUserId &&
                    m.supabaseUserId &&
                    mergedMember.supabaseUserId === m.supabaseUserId) ||
                  (mergedMember.email &&
                    m.email &&
                    mergedMember.email.trim().toLowerCase() ===
                      m.email.trim().toLowerCase() &&
                    mergedMember.email.trim() !== "")
              );
              if (index !== -1) {
                uniqueMembers[index] = mergedMember;
              }
            }
          }
        });

        // Calculate which members were removed from Supabase (but still exist locally)
        // These are members that were synced to Supabase before but are now deleted there
        const removedMembers = localMembers.filter((localMember) => {
          const localId = localMember.id ? Number(localMember.id) : null;
          // Check if this local member has an ID that exists in Supabase IDs
          // If it has an ID but doesn't exist in Supabase, it was deleted
          const wasSyncedBefore = localId !== null && !isNaN(localId);
          const existsInSupabase = wasSyncedBefore && memberExists(localMember, supabaseMembers);
          
          // Member was synced before but doesn't exist in Supabase anymore = removed
          return wasSyncedBefore && !existsInSupabase;
        });

        console.log("✅ Sync result:", {
          supabaseCount: supabaseMembers.length,
          localCount: localMembers.length,
          finalCount: uniqueMembers.length,
          removed: removedMembers.length,
          removedMemberIds: removedMembers.map((m) => m.id),
          removedMemberNames: removedMembers.map((m) => m.name || m.email),
        });

        // Save all members to local storage
        membersManager.saveAll(uniqueMembers);

        // Dispatch event to notify UI of the update
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("membersUpdated", { detail: uniqueMembers })
          );
        }

        lastMembersSyncTime = Date.now();
        console.log("✅ Member sync completed successfully");

        return {
          synced: true,
          count: supabaseMembers.length,
          localCount: localMembers.length,
          removed: removedMembers.length,
          error: null,
        };
      } catch (err) {
        console.error("❌ Exception syncing from Supabase:", err);
        return { 
          synced: false, 
          error: {
            message: err.message || 'Unknown error occurred during sync',
            originalError: err
          }
        };
      } finally {
        // Always clear the promise, even if there was an error
        membersSyncPromise = null;
        console.log("🔄 Sync promise cleared");
      }
    })();

    return membersSyncPromise;
  },

  // Push local members to Supabase (for initial sync)
  syncToSupabase: async () => {
    try {
      console.log("🔄 Starting member sync to Supabase...");
      const localMembers = membersManager._getAllFromLocalStorage();
      let syncedCount = 0;
      let errorCount = 0;
      const errors = [];

      if (localMembers.length === 0) {
        console.log("ℹ️ No local members to sync");
        return {
          synced: true,
          syncedCount: 0,
          errorCount: 0,
          total: 0,
          error: null,
        };
      }

      console.log(`📤 Syncing ${localMembers.length} member(s) to Supabase...`);

      for (const member of localMembers) {
        try {
          // Check if member already exists in Supabase (by email or supabaseUserId)
          let existingMember = null;

          if (member.supabaseUserId) {
            const { data, error } = await membersService.getByUserId(
              member.supabaseUserId
            );
            if (error && error.code !== "PGRST116") {
              // PGRST116 is "not found", which is fine
              console.warn(`Error checking member by userId:`, error);
            } else {
              existingMember = data;
            }
          }

          // Also check by ID if member has one
          if (!existingMember && member.id) {
            const { data, error } = await membersService.getById(member.id);
            if (!error && data) {
              existingMember = data;
            }
          }

          if (existingMember) {
            // Update existing member
            const { error } = await membersService.update(
              existingMember.id,
              member
            );
            if (!error) {
              syncedCount++;
              console.log(`✅ Updated member: ${member.name || member.email}`);
            } else if (error.code !== "TABLE_NOT_FOUND") {
              errorCount++;
              errors.push({ member: member.name || member.email, error });
              console.warn(`❌ Failed to update member ${member.name || member.email}:`, error);
            }
          } else {
            // Add new member
            const { error } = await membersService.add(member);
            if (!error) {
              syncedCount++;
              console.log(`✅ Added member: ${member.name || member.email}`);
            } else if (error.code !== "TABLE_NOT_FOUND") {
              errorCount++;
              errors.push({ member: member.name || member.email, error });
              console.warn(`❌ Failed to add member ${member.name || member.email}:`, error);
            }
          }
        } catch (memberErr) {
          errorCount++;
          errors.push({ member: member.name || member.email, error: memberErr });
          console.error(`❌ Exception syncing member ${member.name || member.email}:`, memberErr);
        }
      }

      console.log(`✅ Sync to Supabase completed: ${syncedCount} synced, ${errorCount} errors`);

      return {
        synced: true,
        syncedCount,
        errorCount,
        total: localMembers.length,
        errors: errors.length > 0 ? errors : undefined,
        error:
          errorCount > 0
            ? { message: `${errorCount} member(s) failed to sync`, details: errors }
            : null,
      };
    } catch (err) {
      console.error("❌ Exception syncing to Supabase:", err);
      return { 
        synced: false, 
        error: {
          message: err.message || 'Unknown error occurred during sync',
          originalError: err
        }
      };
    }
  },
};

// Events Management
export const eventsManager = {
  // Cache for events (loaded from Supabase)
  _cache: null,
  _cacheTimestamp: null,
  _cacheTimeout: 5 * 60 * 1000, // 5 minutes
  
  // Track last sync time to prevent excessive syncs
  _lastSyncTime: 0,
  _syncCooldown: 10000, // 10 seconds cooldown between syncs
  
  // Track last fetch time to prevent excessive getAll() calls
  _lastFetchTime: 0,

  // Real-time subscription channel
  _subscription: null,

  // Get all events - Fetches from Supabase first (source of truth), falls back to localStorage
  getAll: async (options = {}) => {
    if (typeof window === "undefined") return { upcoming: [], past: [] };
    
    const useCache = options.useCache !== false; // Default to true for performance
    const forceRefresh = options.forceRefresh === true;
    
    // Track last fetch time to prevent excessive requests
    const now = Date.now();
    const timeSinceLastFetch = now - (eventsManager._lastFetchTime || 0);
    const minFetchInterval = 10000; // 10 seconds minimum between fetches
    
    // If we have cached data and not forcing refresh, return it immediately
    // Only refresh in background if enough time has passed
    if (useCache && !forceRefresh) {
      const cached = localStorage.getItem("eacsl_events");
      if (cached) {
        try {
          const cachedEvents = JSON.parse(cached);
          // Only do background refresh if enough time has passed (10 seconds)
          if (timeSinceLastFetch >= minFetchInterval) {
            eventsManager._lastFetchTime = now;
            // Return cached data immediately, then refresh in background
            eventsManager.getAll({ forceRefresh: true, useCache: false }).catch(err => {
              console.warn('Background refresh failed:', err);
            });
          }
          return {
            upcoming: Array.isArray(cachedEvents.upcoming) ? cachedEvents.upcoming : [],
            past: Array.isArray(cachedEvents.past) ? cachedEvents.past : [],
          };
        } catch (e) {
          console.error('Error parsing cached events:', e);
        }
      }
    }
    
    // If forcing refresh, check if we're within cooldown period
    if (forceRefresh && timeSinceLastFetch < minFetchInterval) {
      console.log(`⏱️ Events fetch cooldown active (${Math.ceil((minFetchInterval - timeSinceLastFetch) / 1000)}s remaining). Using cached data.`);
      return eventsManager._getAllFromLocalStorage();
    }
    
    // Update last fetch time
    eventsManager._lastFetchTime = now;
    
    // Fetch from Supabase (source of truth)
    try {
      console.log("🔄 Fetching events from Supabase...");
      const { data, error } = await eventsService.getAll();
      
      if (error) {
        // If table doesn't exist, fall back to localStorage
        if (error.code === "TABLE_NOT_FOUND") {
          console.warn("⚠️ Events table not found in Supabase. Using localStorage fallback.");
          return eventsManager._getAllFromLocalStorage();
        }
        
        // Other errors - log and fall back to localStorage
        console.error("❌ Error fetching from Supabase:", error);
        return eventsManager._getAllFromLocalStorage();
      }
      
      // Map Supabase events to local format and organize by status
      const supabaseEvents = data
        ? data.map((e) => eventsService.mapSupabaseToLocal(e))
        : [];
      
      const upcoming = supabaseEvents.filter((e) => e.status === "upcoming");
      const past = supabaseEvents.filter((e) => e.status === "past");
      
      const events = {
        upcoming,
        past,
      };
      
      // Save to localStorage as cache
      eventsManager.saveAll(events);
      
      console.log(`✅ Fetched ${supabaseEvents.length} events from Supabase (${upcoming.length} upcoming, ${past.length} past)`);
      return events;
    } catch (err) {
      console.error("❌ Exception fetching from Supabase:", err);
      return eventsManager._getAllFromLocalStorage();
    }
  },
  
  // Internal helper to get from localStorage (fallback)
  _getAllFromLocalStorage: () => {
    if (typeof window === "undefined") return { upcoming: [], past: [] };
    
    // Check cache first
    if (eventsManager._cache && eventsManager._cacheTimestamp) {
      const cacheAge = Date.now() - eventsManager._cacheTimestamp;
      if (cacheAge < eventsManager._cacheTimeout) {
        return eventsManager._cache;
      }
    }

    // Try localStorage as fallback
    const stored = localStorage.getItem("eacsl_events");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          upcoming: Array.isArray(parsed.upcoming) ? parsed.upcoming : [],
          past: Array.isArray(parsed.past) ? parsed.past : [],
        };
      } catch (e) {
        console.error("Error parsing events from localStorage:", e);
        return { upcoming: [], past: [] };
      }
    }
    return { upcoming: [], past: [] };
  },

  // Get only upcoming events (async - fetches from Supabase)
  getUpcoming: async () => {
    const all = await eventsManager.getAll();
    return all.upcoming || [];
  },

  // Get only upcoming events (synchronous - uses cache)
  getUpcomingSync: () => {
    const all = eventsManager._getAllFromLocalStorage();
    return all.upcoming || [];
  },

  // Get only past events (async - fetches from Supabase)
  getPast: async () => {
    const all = await eventsManager.getAll();
    return all.past || [];
  },

  // Get only past events (synchronous - uses cache)
  getPastSync: () => {
    const all = eventsManager._getAllFromLocalStorage();
    return all.past || [];
  },

  // Get event by ID (async - searches both upcoming and past)
  getById: async (id) => {
    const all = await eventsManager.getAll();
    const upcoming = all.upcoming || [];
    const past = all.past || [];
    const event =
      upcoming.find((e) => e.id === id) || past.find((e) => e.id === id);
    return event || null;
  },
  
  // Get event by ID (synchronous - uses cache)
  getByIdSync: (id) => {
    const all = eventsManager._getAllFromLocalStorage();
    const upcoming = all.upcoming || [];
    const past = all.past || [];
    const event =
      upcoming.find((e) => e.id === id) || past.find((e) => e.id === id);
    return event || null;
  },

  // Save events to cache and localStorage
  saveAll: (events) => {
    eventsManager._cache = events;
    eventsManager._cacheTimestamp = Date.now();
    localStorage.setItem("eacsl_events", JSON.stringify(events));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("eventsUpdated", { detail: events })
      );
    }
  },

  // Add new event - Saves to Supabase first (source of truth), then updates localStorage cache
  add: async (event) => {
    // Prepare event data
    const newEvent = {
      ...event,
      status: event.status || "upcoming",
      createdAt: new Date().toISOString(),
    };

    // Save to Supabase FIRST (source of truth)
    try {
      console.log("💾 Saving event to Supabase...");
      const { data, error } = await eventsService.add(newEvent);
      
      if (error) {
        // Handle table not found error - allow local storage fallback for development
        if (error.code === 'TABLE_NOT_FOUND') {
          console.warn("⚠️ Events table doesn't exist in Supabase. Saving to localStorage only.");
          // For development: save to localStorage as fallback
          const localEvents = eventsManager._getAllFromLocalStorage();
          const upcoming = localEvents.upcoming || [];
          const tempId = upcoming.length > 0 ? Math.max(...upcoming.map((e) => e.id)) + 1 : 1;
          const localEvent = { ...newEvent, id: tempId };
    const updated = {
            upcoming: localEvent.status === "past" ? upcoming : [...upcoming, localEvent],
            past: localEvent.status === "past" ? [...(localEvents.past || []), localEvent] : localEvents.past || [],
    };
    eventsManager.saveAll(updated);
          return localEvent;
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to save event to Supabase:", error);
        throw new Error(`Failed to save event: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data returned from Supabase');
      }
      
      console.log("✅ Event successfully saved to Supabase:", data);
      
      // Update localStorage cache with the new event
      const localEvents = eventsManager._getAllFromLocalStorage();
      const exists = (localEvents.upcoming || []).some(e => e.id === data.id) || 
                     (localEvents.past || []).some(e => e.id === data.id);
      
      if (!exists) {
        if (data.status === "upcoming") {
          localEvents.upcoming = [...(localEvents.upcoming || []), data];
        } else {
          localEvents.past = [...(localEvents.past || []), data];
        }
            eventsManager.saveAll(localEvents);
        console.log("✅ Event added to localStorage cache");
      } else {
        // Update existing event
        if (data.status === "upcoming") {
          const index = (localEvents.upcoming || []).findIndex(e => e.id === data.id);
          if (index >= 0) {
            localEvents.upcoming[index] = data;
          } else {
            // Move from past to upcoming
            localEvents.past = (localEvents.past || []).filter(e => e.id !== data.id);
            localEvents.upcoming = [...(localEvents.upcoming || []), data];
          }
        } else {
          const index = (localEvents.past || []).findIndex(e => e.id === data.id);
          if (index >= 0) {
            localEvents.past[index] = data;
          } else {
            // Move from upcoming to past
            localEvents.upcoming = (localEvents.upcoming || []).filter(e => e.id !== data.id);
            localEvents.past = [...(localEvents.past || []), data];
          }
        }
        eventsManager.saveAll(localEvents);
        console.log("✅ Event updated in localStorage cache");
      }
      
      return data;
    } catch (err) {
      console.error("❌ Exception saving event to Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Update event - Updates Supabase first (source of truth), then updates localStorage cache
  update: async (id, updatedEvent) => {
    // Get current event from cache to merge with updates
    const localEvents = eventsManager._getAllFromLocalStorage();
    const upcoming = localEvents.upcoming || [];
    const past = localEvents.past || [];

    // Check in upcoming events
    let existingEvent = upcoming.find((e) => e.id === id);
    let isUpcoming = true;
    if (!existingEvent) {
      // Check in past events
      existingEvent = past.find((e) => e.id === id);
      isUpcoming = false;
    }

    if (!existingEvent) {
      console.error('Event not found with id:', id);
      throw new Error(`Event with id ${id} not found`);
    }

    // Merge updated fields with existing event data
    const completeEvent = {
      ...existingEvent,
      ...updatedEvent,
      id, // Preserve ID
      status: updatedEvent.status || existingEvent.status || "upcoming",
    };

    // Update in Supabase FIRST (source of truth)
    try {
      console.log("💾 Updating event in Supabase...");
      const { data, error } = await eventsService.update(id, completeEvent);
      
      if (error) {
        // If event doesn't exist in Supabase, try to add it
        if (error.code === 'PGRST116' && error.details?.includes('0 rows')) {
          console.log("Event not found in Supabase, attempting to add instead...");
          const addResult = await eventsService.add(completeEvent);
          if (addResult.data && !addResult.error) {
            console.log("✅ Successfully added event to Supabase (was missing)");
            // Update localStorage with the new data
            const localEvents = eventsManager._getAllFromLocalStorage();
            if (addResult.data.status === "upcoming") {
              localEvents.upcoming = [...(localEvents.upcoming || []), addResult.data];
              localEvents.past = (localEvents.past || []).filter(e => e.id !== id);
            } else {
              localEvents.past = [...(localEvents.past || []), addResult.data];
              localEvents.upcoming = (localEvents.upcoming || []).filter(e => e.id !== id);
            }
            eventsManager.saveAll(localEvents);
            return addResult.data;
          } else if (addResult.error) {
            if (addResult.error.code === 'TABLE_NOT_FOUND') {
              // Table doesn't exist - fallback to localStorage for development
              console.warn("⚠️ Events table doesn't exist. Saving to localStorage only.");
              const localEvents = eventsManager._getAllFromLocalStorage();
              const upcoming = localEvents.upcoming || [];
              const past = localEvents.past || [];
              let index = upcoming.findIndex((e) => e.id === id);
              let isUpcoming = true;
              if (index === -1) {
                index = past.findIndex((e) => e.id === id);
                isUpcoming = false;
              }
              if (index >= 0) {
                if (isUpcoming) {
                  upcoming[index] = completeEvent;
                } else {
                  past[index] = completeEvent;
                }
                eventsManager.saveAll({ upcoming, past });
              }
              return completeEvent;
            }
            throw new Error(`Failed to add event: ${addResult.error.message || 'Unknown error'}`);
          }
        } else if (error.code === 'TABLE_NOT_FOUND') {
          // Table doesn't exist - fallback to localStorage for development
          console.warn("⚠️ Events table doesn't exist. Saving to localStorage only.");
          const localEvents = eventsManager._getAllFromLocalStorage();
          const upcoming = localEvents.upcoming || [];
          const past = localEvents.past || [];
          let index = upcoming.findIndex((e) => e.id === id);
          let isUpcoming = true;
          if (index === -1) {
            index = past.findIndex((e) => e.id === id);
            isUpcoming = false;
          }
          if (index >= 0) {
            if (isUpcoming) {
              upcoming[index] = completeEvent;
            } else {
              past[index] = completeEvent;
            }
            eventsManager.saveAll({ upcoming, past });
          }
          return completeEvent;
        }
        
        // Other errors (400, 406, etc.) - throw to show to user
        console.error("❌ Failed to update event in Supabase:", error);
        throw new Error(`Failed to update event: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data returned from Supabase');
      }
      
      console.log("✅ Event successfully updated in Supabase:", data);
      
      // Update localStorage cache
      const localEvents = eventsManager._getAllFromLocalStorage();
      const upcoming = localEvents.upcoming || [];
      const past = localEvents.past || [];

    // Handle status change (upcoming <-> past)
    const oldStatus = isUpcoming ? "upcoming" : "past";
      const newStatus = data.status || oldStatus;

    let finalUpcoming = upcoming;
    let finalPast = past;

    if (oldStatus !== newStatus) {
      // Status changed - move event between arrays
      if (newStatus === "past") {
        finalUpcoming = upcoming.filter((e) => e.id !== id);
          finalPast = [...past, data];
      } else {
        finalPast = past.filter((e) => e.id !== id);
          finalUpcoming = [...upcoming, data];
      }
    } else {
      // Status unchanged - just update in place
      if (isUpcoming) {
          const index = upcoming.findIndex((e) => e.id === id);
          if (index >= 0) {
            finalUpcoming = [...upcoming];
            finalUpcoming[index] = data;
          }
      } else {
          const index = past.findIndex((e) => e.id === id);
          if (index >= 0) {
            finalPast = [...past];
            finalPast[index] = data;
          }
      }
    }

    eventsManager.saveAll({
      upcoming: finalUpcoming,
      past: finalPast,
    });
      console.log("✅ Event updated in localStorage cache");
      
      return data;
    } catch (err) {
      console.error("❌ Exception updating event in Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Delete event - Deletes from Supabase first (source of truth), then updates localStorage cache
  delete: async (id) => {
    // Get event from cache first (for image deletion if needed)
    const localEvents = eventsManager._getAllFromLocalStorage();
    const eventToDelete = (localEvents.upcoming || []).find((e) => e.id === id) || 
                         (localEvents.past || []).find((e) => e.id === id);
    
    if (!eventToDelete) {
      console.warn(`Event with id ${id} not found in cache`);
      // Still try to delete from Supabase in case it exists there
    }
    
    // Delete event's image from storage if it exists in Supabase Storage
    if (eventToDelete && eventToDelete.heroImagePath) {
      try {
        await eventsService.deleteImage(eventToDelete.heroImagePath);
        console.log('✅ Deleted event image from storage');
      } catch (deleteError) {
        console.warn('Could not delete event image from storage:', deleteError);
        // Continue with event deletion even if image deletion fails
      }
    }

    // Delete from Supabase FIRST (source of truth)
    try {
      console.log("🗑️ Deleting event from Supabase...");
      const { error } = await eventsService.delete(id);
      
      if (error) {
        if (error.code === 'TABLE_NOT_FOUND') {
          // Table doesn't exist - fallback to localStorage for development
          console.warn("⚠️ Events table doesn't exist. Deleting from localStorage only.");
          const upcoming = (localEvents.upcoming || []).filter((e) => e.id !== id);
          const past = (localEvents.past || []).filter((e) => e.id !== id);
    eventsManager.saveAll({ upcoming, past });
          return true;
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to delete event from Supabase:", error);
        throw new Error(`Failed to delete event: ${error.message || 'Unknown error'}`);
      }
      
      console.log("✅ Event successfully deleted from Supabase");
      
      // Update localStorage cache
      const upcoming = (localEvents.upcoming || []).filter((e) => e.id !== id);
      const past = (localEvents.past || []).filter((e) => e.id !== id);
      eventsManager.saveAll({ upcoming, past });
      console.log("✅ Event removed from localStorage cache");

    return true;
    } catch (err) {
      console.error("❌ Exception deleting event from Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Move event from upcoming to past - Updates Supabase first, then updates cache
  moveToPast: async (id) => {
    // Get event from cache
    const localEvents = eventsManager._getAllFromLocalStorage();
    const upcoming = localEvents.upcoming || [];
    const past = localEvents.past || [];

    const event = upcoming.find((e) => e.id === id);
    if (!event) {
      throw new Error(`Event with id ${id} not found in upcoming events`);
    }

    const updatedEvent = {
      ...event,
      status: "past",
      movedToPastAt: new Date().toISOString(),
    };

    // Update in Supabase FIRST (source of truth)
    try {
      console.log("💾 Moving event to past in Supabase...");
      const { data, error } = await eventsService.update(id, updatedEvent);
      
      if (error) {
        if (error.code === 'TABLE_NOT_FOUND') {
          // Table doesn't exist - fallback to localStorage for development
          console.warn("⚠️ Events table doesn't exist. Moving to past in localStorage only.");
    const updatedUpcoming = upcoming.filter((e) => e.id !== id);
    const updatedPast = [...past, updatedEvent];
          eventsManager.saveAll({ upcoming: updatedUpcoming, past: updatedPast });
          return updatedEvent;
        }
        throw new Error(`Failed to move event to past: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data returned from Supabase');
      }
      
      console.log("✅ Event successfully moved to past in Supabase");
      
      // Update localStorage cache
      const updatedUpcoming = upcoming.filter((e) => e.id !== id);
      const updatedPast = [...past, data];
      eventsManager.saveAll({ upcoming: updatedUpcoming, past: updatedPast });
      console.log("✅ Event moved to past in localStorage cache");
      
      return data;
    } catch (err) {
      console.error("❌ Exception moving event to past:", err);
      throw err;
    }
  },

  // Move event from past to upcoming - Updates Supabase first, then updates cache
  moveToUpcoming: async (id) => {
    // Get event from cache
    const localEvents = eventsManager._getAllFromLocalStorage();
    const upcoming = localEvents.upcoming || [];
    const past = localEvents.past || [];

    const event = past.find((e) => e.id === id);
    if (!event) {
      throw new Error(`Event with id ${id} not found in past events`);
    }

    const updatedEvent = {
      ...event,
      status: "upcoming",
      movedToUpcomingAt: new Date().toISOString(),
    };

    // Update in Supabase FIRST (source of truth)
    try {
      console.log("💾 Moving event to upcoming in Supabase...");
      const { data, error } = await eventsService.update(id, updatedEvent);
      
      if (error) {
        if (error.code === 'TABLE_NOT_FOUND') {
          // Table doesn't exist - fallback to localStorage for development
          console.warn("⚠️ Events table doesn't exist. Moving to upcoming in localStorage only.");
    const updatedPast = past.filter((e) => e.id !== id);
    const updatedUpcoming = [...upcoming, updatedEvent];
          eventsManager.saveAll({ upcoming: updatedUpcoming, past: updatedPast });
          return updatedEvent;
        }
        throw new Error(`Failed to move event to upcoming: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data returned from Supabase');
      }
      
      console.log("✅ Event successfully moved to upcoming in Supabase");
      
      // Update localStorage cache
      const updatedPast = past.filter((e) => e.id !== id);
      const updatedUpcoming = [...upcoming, data];
      eventsManager.saveAll({ upcoming: updatedUpcoming, past: updatedPast });
      console.log("✅ Event moved to upcoming in localStorage cache");
      
      return data;
    } catch (err) {
      console.error("❌ Exception moving event to upcoming:", err);
      throw err;
    }
  },
  
  // Subscribe to real-time changes from Supabase
  subscribe: (callback) => {
    // Unsubscribe from previous subscription if exists
    if (eventsManager._subscription) {
      eventsManager._subscription.unsubscribe();
    }

    console.log("🔔 Setting up real-time subscription for events...");
    
    // Real-time subscription - just update state, don't fetch (periodic sync handles fetching)
    eventsManager._subscription = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'events'
        },
        async (payload) => {
          console.log('🔔 Real-time event change detected:', payload.eventType, payload);
          
          // Just notify the UI - don't fetch immediately
          // The periodic sync (every 10 seconds) will fetch the latest data
          // This prevents excessive requests while still being responsive
          if (callback && typeof callback === 'function') {
            // Get cached data to update UI immediately
            const cachedEvents = eventsManager._getAllFromLocalStorage();
            callback(cachedEvents, payload);
          }
          
          console.log('✅ Real-time notification sent (periodic sync will fetch latest data)');
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active for events (notifications only - periodic sync handles fetching)');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Real-time subscription error - table may not exist');
        }
      });

    // Return unsubscribe function
    return () => {
      if (eventsManager._subscription) {
        eventsManager._subscription.unsubscribe();
        eventsManager._subscription = null;
        console.log('🔕 Real-time subscription unsubscribed');
      }
    };
  },

  // Unsubscribe from real-time changes
  unsubscribe: () => {
    if (eventsManager._subscription) {
      eventsManager._subscription.unsubscribe();
      eventsManager._subscription = null;
      console.log('🔕 Real-time subscription unsubscribed');
    }
  },

  // Fetch events from Supabase and sync with local storage
  syncFromSupabase: async () => {
    const now = Date.now();
    const timeSinceLastSync = now - eventsManager._lastSyncTime;
    
    // If sync was called recently, skip it to prevent excessive requests
    if (timeSinceLastSync < eventsManager._syncCooldown) {
      const secondsLeft = Math.ceil((eventsManager._syncCooldown - timeSinceLastSync) / 1000);
      console.log(`⏱️ Events sync cooldown active (${secondsLeft}s remaining). Skipping sync.`);
      return {
        synced: false,
        skipped: true,
        nextAllowedIn: eventsManager._syncCooldown - timeSinceLastSync,
        error: null
      };
    }
    
    try {
      eventsManager._lastSyncTime = now;
      const { data, error } = await eventsService.getAll();

      if (error) {
        if (
          error.code === "TABLE_NOT_FOUND" ||
          error.message?.includes("Table does not exist")
        ) {
          console.warn(
            "Events table does not exist in Supabase. Please create it using the SQL script from EVENTS_SUPABASE_SETUP.md"
          );
          return {
            synced: false,
            error: {
              ...error,
              userMessage:
                "Events table does not exist. Please create it in Supabase first. Check EVENTS_SUPABASE_SETUP.md for instructions.",
            },
          };
        }
        console.warn("Failed to fetch events from Supabase:", error);
        return { synced: false, error };
      }

      // Map Supabase events to local format and organize by status
      const supabaseEvents = data
        ? data.map((e) => eventsService.mapSupabaseToLocal(e))
        : [];

      const upcoming = supabaseEvents.filter((e) => e.status === "upcoming");
      const past = supabaseEvents.filter((e) => e.status === "past");

      // Get existing local events (use cached data for fast access)
      const localEvents = eventsManager._getAllFromLocalStorage();

      // Start with Supabase events as the source of truth
      const uniqueUpcoming = [...upcoming];
      const uniquePast = [...past];

      // Helper function to check if an event exists
      const eventExists = (event, eventsArray) => {
        return eventsArray.some(
          (existing) =>
            event.id && existing.id && event.id === existing.id
        );
      };

      // Get all Supabase event IDs
      const supabaseIds = new Set(
        supabaseEvents
          .map((e) => e.id)
          .filter((id) => id != null)
          .map((id) => Number(id))
      );

      // Add local-only events (those that don't exist in Supabase)
      const allLocalEvents = [...(localEvents.upcoming || []), ...(localEvents.past || [])];
      allLocalEvents.forEach((localEvent) => {
        const existsInSupabase = eventExists(localEvent, supabaseEvents);

        if (!existsInSupabase) {
          const localId = localEvent.id ? Number(localEvent.id) : null;
          const wasSyncedBefore =
            localId !== null && !isNaN(localId) && !supabaseIds.has(localId);

          if (!wasSyncedBefore) {
            // This is a truly local-only event
            if (localEvent.status === "upcoming") {
              uniqueUpcoming.push(localEvent);
            } else {
              uniquePast.push(localEvent);
            }
          }
        }
      });

      const finalEvents = {
        upcoming: uniqueUpcoming,
        past: uniquePast,
      };

      eventsManager.saveAll(finalEvents);

      // Dispatch event to notify UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("eventsUpdated", { detail: finalEvents })
        );
      }

      return {
        synced: true,
        count: supabaseEvents.length,
        upcomingCount: upcoming.length,
        pastCount: past.length,
        error: null,
      };
    } catch (err) {
      console.error("Exception syncing from Supabase:", err);
      return { synced: false, error: err };
    }
  },

  // Push local events to Supabase (for initial sync)
  syncToSupabase: async () => {
    try {
      const localEvents = eventsManager._getAllFromLocalStorage();
      const allLocalEvents = [...(localEvents.upcoming || []), ...(localEvents.past || [])];
      let syncedCount = 0;
      let errorCount = 0;

      for (const event of allLocalEvents) {
        // Check if event already exists in Supabase
        let existingEvent = null;
        if (event.id) {
          const { data } = await eventsService.getById(event.id);
          existingEvent = data;
        }

        if (existingEvent) {
          // Update existing event
          const { error } = await eventsService.update(event.id, event);
          if (!error) {
            syncedCount++;
          } else if (error.code !== "TABLE_NOT_FOUND") {
            errorCount++;
            console.warn(`Failed to update event ${event.title}:`, error);
          }
        } else {
          // Add new event
          const { error } = await eventsService.add(event);
          if (!error) {
            syncedCount++;
          } else if (error.code !== "TABLE_NOT_FOUND") {
            errorCount++;
            console.warn(`Failed to add event ${event.title}:`, error);
          }
        }
      }

      return {
        synced: true,
        syncedCount,
        errorCount,
        total: allLocalEvents.length,
        error:
          errorCount > 0
            ? { message: `${errorCount} events failed to sync` }
            : null,
      };
    } catch (err) {
      console.error("Exception syncing to Supabase:", err);
      return { synced: false, error: err };
    }
  },
};

// Articles Management
export const articlesManager = {
  // Cache for articles (loaded from Supabase)
  _cache: null,
  _cacheTimestamp: null,
  _cacheTimeout: 5 * 60 * 1000, // 5 minutes
  
  // Track last fetch time to prevent excessive getAll() calls
  _lastFetchTime: 0,
  
  // Real-time subscription channel
  _subscription: null,

  // Get all articles - Fetches from Supabase first (source of truth), falls back to localStorage
  getAll: async (options = {}) => {
    if (typeof window === "undefined") return [];
    
    const useCache = options.useCache !== false; // Default to true for performance
    const forceRefresh = options.forceRefresh === true;
    
    // Track last fetch time to prevent excessive requests
    const now = Date.now();
    const timeSinceLastFetch = now - (articlesManager._lastFetchTime || 0);
    const minFetchInterval = 10000; // 10 seconds minimum between fetches
    
    // If we have cached data and not forcing refresh, return it immediately
    // Only refresh in background if enough time has passed
    if (useCache && !forceRefresh) {
      const cached = localStorage.getItem("eacsl_articles");
      if (cached) {
        try {
          const cachedArticles = JSON.parse(cached);
          // Only do background refresh if enough time has passed (10 seconds)
          if (timeSinceLastFetch >= minFetchInterval) {
            articlesManager._lastFetchTime = now;
            // Return cached data immediately, then refresh in background
            articlesManager.getAll({ forceRefresh: true, useCache: false }).catch(err => {
              console.warn('Background refresh failed:', err);
            });
          }
          return cachedArticles;
        } catch (e) {
          console.error('Error parsing cached articles:', e);
        }
      }
    }
    
    // If forcing refresh, check if we're within cooldown period
    if (forceRefresh && timeSinceLastFetch < minFetchInterval) {
      console.log(`⏱️ Articles fetch cooldown active (${Math.ceil((minFetchInterval - timeSinceLastFetch) / 1000)}s remaining). Using cached data.`);
      return articlesManager._getAllFromLocalStorage();
    }
    
    // Update last fetch time
    articlesManager._lastFetchTime = now;
    
    // Fetch from Supabase (source of truth)
    try {
      console.log("🔄 articlesManager.getAll() - Fetching from Supabase...");
      const { data, error } = await articlesService.getAll();
      
      if (error) {
        // If table doesn't exist, fall back to localStorage
        if (error.code === "TABLE_NOT_FOUND") {
          console.warn("⚠️ Articles table not found in Supabase. Using localStorage fallback.");
          const localArticles = articlesManager._getAllFromLocalStorage();
          console.log(`📦 Using ${localArticles.length} articles from localStorage`);
          return localArticles;
        }
        
        // Other errors - log and fall back to localStorage
        console.error("❌ Error fetching from Supabase:", error);
        console.error("Error details:", { code: error.code, message: error.message, details: error.details });
        const localArticles = articlesManager._getAllFromLocalStorage();
        console.log(`📦 Falling back to ${localArticles.length} articles from localStorage`);
        return localArticles;
      }
      
      // Map Supabase articles to local format
      const supabaseArticles = data && Array.isArray(data)
        ? data.map((a) => {
            try {
              return articlesService.mapSupabaseToLocal(a);
            } catch (mapErr) {
              console.error('Error mapping article:', a, mapErr);
              return null;
            }
          }).filter(a => a !== null)
        : [];
      
      // Save to localStorage as cache
      articlesManager.saveAll(supabaseArticles);
      
      console.log(`✅ Successfully fetched and mapped ${supabaseArticles.length} articles from Supabase`);
      if (supabaseArticles.length > 0) {
        console.log('Sample mapped article:', supabaseArticles[0]);
      }
      return supabaseArticles;
    } catch (err) {
      console.error("❌ Exception fetching from Supabase:", err);
      console.error("Exception stack:", err.stack);
      const localArticles = articlesManager._getAllFromLocalStorage();
      console.log(`📦 Exception fallback to ${localArticles.length} articles from localStorage`);
      return localArticles;
    }
  },
  
  // Internal helper to get from localStorage (fallback)
  _getAllFromLocalStorage: () => {
    if (typeof window === "undefined") return [];
    
    // Check cache first
    if (articlesManager._cache && articlesManager._cacheTimestamp) {
      const cacheAge = Date.now() - articlesManager._cacheTimestamp;
      if (cacheAge < articlesManager._cacheTimeout) {
        return articlesManager._cache;
      }
    }

    // Try localStorage as fallback
    const stored = localStorage.getItem("eacsl_articles");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Update cache
        articlesManager._cache = parsed;
        articlesManager._cacheTimestamp = Date.now();
        return parsed;
      } catch (e) {
        console.error("Error parsing articles from localStorage:", e);
        return [];
      }
    }
    return [];
  },

  // Save articles to cache and localStorage
  saveAll: (articles) => {
    articlesManager._cache = articles;
    articlesManager._cacheTimestamp = Date.now();
    localStorage.setItem("eacsl_articles", JSON.stringify(articles));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("articlesUpdated", { detail: articles })
      );
    }
  },

  // Add new article - Saves to Supabase first (source of truth), then updates localStorage cache
  add: async (article) => {
    // Prepare article data
    const newArticle = {
      ...article,
      createdAt: new Date().toISOString(),
    };

    // Save to Supabase FIRST (source of truth)
    try {
      console.log("💾 Saving article to Supabase...");
      const { data, error } = await articlesService.add(newArticle);
      
      if (error) {
        // Handle table not found error - allow local storage fallback for development
        if (error.code === 'TABLE_NOT_FOUND') {
          console.warn("⚠️ Articles table doesn't exist in Supabase. Saving to localStorage only.");
          // For development: save to localStorage as fallback
          const localArticles = articlesManager._getAllFromLocalStorage();
          const tempId = localArticles.length > 0 ? Math.max(...localArticles.map((a) => a.id)) + 1 : 1;
          const localArticle = { ...newArticle, id: tempId };
          articlesManager.saveAll([...localArticles, localArticle]);
          return localArticle;
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to save article to Supabase:", error);
        throw new Error(`Failed to save article: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data returned from Supabase');
      }
      
      console.log("✅ Article successfully saved to Supabase:", data);
      
      // Update localStorage cache with the new article
      const localArticles = articlesManager._getAllFromLocalStorage();
      const exists = localArticles.some(a => a.id === data.id);
      
      if (!exists) {
        articlesManager.saveAll([...localArticles, data]);
        console.log("✅ Article added to localStorage cache");
      } else {
        // Update existing article
        const index = localArticles.findIndex(a => a.id === data.id);
        if (index >= 0) {
          localArticles[index] = data;
          articlesManager.saveAll(localArticles);
          console.log("✅ Article updated in localStorage cache");
        }
      }
      
      return data;
    } catch (err) {
      console.error("❌ Exception saving article to Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Update article - Updates Supabase first (source of truth), then updates localStorage cache
  update: async (id, updatedArticle) => {
    // Get current article from cache to merge with updates
    const localArticles = articlesManager._getAllFromLocalStorage();
    // Handle both string and number ID comparison
    const existingArticle = localArticles.find((a) => {
      const localId = typeof a.id === 'string' ? parseInt(a.id, 10) : a.id;
      const targetId = typeof id === 'string' ? parseInt(id, 10) : id;
      return localId === targetId;
    });

    if (!existingArticle) {
      console.error('Article not found with id:', id, 'Available IDs:', localArticles.map(a => a.id));
      throw new Error(`Article with id ${id} not found`);
    }

    // Merge updated fields with existing article data
    const completeArticle = {
      ...existingArticle,
      ...updatedArticle,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };

    // Update in Supabase FIRST (source of truth)
    try {
      console.log("💾 Updating article in Supabase...");
      const { data, error } = await articlesService.update(id, completeArticle);
      
      if (error) {
        // If article doesn't exist in Supabase, try to add it
        if (error.code === 'PGRST116' || error.message?.includes('No rows found') || error.message?.includes('not found')) {
          console.log("Article not found in Supabase, attempting to add instead...");
          const addResult = await articlesService.add(completeArticle);
          if (addResult.data && !addResult.error) {
            console.log("✅ Successfully added article to Supabase (was missing)");
            // Update localStorage with the new data
            const localArticles = articlesManager._getAllFromLocalStorage();
            const index = localArticles.findIndex(a => a.id === id);
            if (index >= 0) {
              localArticles[index] = addResult.data;
            } else {
              localArticles.push(addResult.data);
            }
            articlesManager.saveAll(localArticles);
            return addResult.data;
          } else if (addResult.error) {
            if (addResult.error.code === 'TABLE_NOT_FOUND') {
              // Table doesn't exist - fallback to localStorage for development
              console.warn("⚠️ Articles table doesn't exist. Saving to localStorage only.");
              const localArticles = articlesManager._getAllFromLocalStorage();
              const index = localArticles.findIndex((a) => a.id === id);
              if (index >= 0) {
                localArticles[index] = completeArticle;
                articlesManager.saveAll(localArticles);
              }
              return completeArticle;
            }
            throw new Error(`Failed to add article: ${addResult.error.message || 'Unknown error'}`);
          }
        } else if (error.code === 'TABLE_NOT_FOUND') {
          // Table doesn't exist - fallback to localStorage for development
          console.warn("⚠️ Articles table doesn't exist. Saving to localStorage only.");
          const localArticles = articlesManager._getAllFromLocalStorage();
          const index = localArticles.findIndex((a) => a.id === id);
          if (index >= 0) {
            localArticles[index] = completeArticle;
            articlesManager.saveAll(localArticles);
          }
          return completeArticle;
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to update article in Supabase:", error);
        throw new Error(`Failed to update article: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data returned from Supabase');
      }
      
      console.log("✅ Article successfully updated in Supabase:", data);
      
      // Clear cache to force fresh fetch on next getAll()
      articlesManager._cache = null;
      articlesManager._cacheTimestamp = null;
      
      // Update localStorage cache
      const localArticles = articlesManager._getAllFromLocalStorage();
      const index = localArticles.findIndex((a) => {
        // Handle both string and number ID comparison
        const localId = typeof a.id === 'string' ? parseInt(a.id, 10) : a.id;
        const targetId = typeof id === 'string' ? parseInt(id, 10) : id;
        return localId === targetId;
      });
      if (index >= 0) {
        localArticles[index] = data;
        articlesManager.saveAll(localArticles);
        console.log("✅ Article updated in localStorage cache");
      } else {
        // Article was added (new ID from Supabase)
        articlesManager.saveAll([...localArticles, data]);
        console.log("✅ Article added to localStorage cache");
      }
      
      return data;
    } catch (err) {
      console.error("❌ Exception updating article in Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Delete article - Deletes from Supabase first (source of truth), then updates localStorage cache
  delete: async (id) => {
    // Get article from cache first (for image deletion if needed)
    const localArticles = articlesManager._getAllFromLocalStorage();
    const articleToDelete = localArticles.find((a) => a.id === id);
    
    if (!articleToDelete) {
      console.warn(`Article with id ${id} not found in cache`);
      // Still try to delete from Supabase in case it exists there
    }
    
    // Delete article's image from storage if it exists in Supabase Storage
    if (articleToDelete && articleToDelete.imagePath) {
      try {
        await articlesService.deleteImage(articleToDelete.imagePath);
        console.log('✅ Deleted article image from storage');
      } catch (deleteError) {
        console.warn('Could not delete article image from storage:', deleteError);
        // Continue with article deletion even if image deletion fails
      }
    }

    // Delete from Supabase FIRST (source of truth)
    try {
      console.log("🗑️ Deleting article from Supabase...");
      const { error } = await articlesService.delete(id);
      
      if (error) {
        if (error.code === 'TABLE_NOT_FOUND') {
          // Table doesn't exist - fallback to localStorage for development
          console.warn("⚠️ Articles table doesn't exist. Deleting from localStorage only.");
          const filtered = localArticles.filter((a) => a.id !== id);
          articlesManager.saveAll(filtered);
          return true;
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to delete article from Supabase:", error);
        throw new Error(`Failed to delete article: ${error.message || 'Unknown error'}`);
      }
      
      console.log("✅ Article successfully deleted from Supabase");
      
      // Update localStorage cache
      const filtered = localArticles.filter((a) => a.id !== id);
      articlesManager.saveAll(filtered);
      console.log("✅ Article removed from localStorage cache");
      
      return true;
    } catch (err) {
      console.error("❌ Exception deleting article from Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Get article by ID (async - fetches from Supabase)
  getById: async (id) => {
    const articles = await articlesManager.getAll();
    return articles.find((a) => a.id === id) || null;
  },
  
  // Get article by ID (synchronous - uses cache)
  getByIdSync: (id) => {
    const articles = articlesManager._getAllFromLocalStorage();
    return articles.find((a) => a.id === id) || null;
  },
  
  // Subscribe to real-time changes from Supabase
  subscribe: (callback) => {
    // Unsubscribe from previous subscription if exists
    if (articlesManager._subscription) {
      articlesManager._subscription.unsubscribe();
    }

    console.log("🔔 Setting up real-time subscription for articles...");
    
    articlesManager._subscription = supabase
      .channel('articles-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'articles'
        },
        async (payload) => {
          console.log('🔔 Real-time article change detected:', payload.eventType, payload);
          
          try {
            // Refresh articles from Supabase
            const { data, error } = await articlesService.getAll();
            
            if (!error && data) {
              const supabaseArticles = data.map((a) => articlesService.mapSupabaseToLocal(a));
              
              // Update localStorage cache
              articlesManager.saveAll(supabaseArticles);
              
              // Call the callback to notify UI
              if (callback && typeof callback === 'function') {
                callback(supabaseArticles, payload);
              }
              
              console.log('✅ Real-time update applied:', payload.eventType);
            } else {
              console.warn('⚠️ Failed to refresh articles after real-time change:', error);
            }
          } catch (err) {
            console.error('❌ Exception handling real-time change:', err);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active for articles');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Real-time subscription error - table may not exist');
        }
      });

    // Return unsubscribe function
    return () => {
      if (articlesManager._subscription) {
        articlesManager._subscription.unsubscribe();
        articlesManager._subscription = null;
        console.log('🔕 Real-time subscription unsubscribed');
      }
    };
  },

  // Unsubscribe from real-time changes
  unsubscribe: () => {
    if (articlesManager._subscription) {
      articlesManager._subscription.unsubscribe();
      articlesManager._subscription = null;
      console.log('🔕 Real-time subscription unsubscribed');
    }
  },

  // Fetch articles from Supabase and sync with local storage - same pattern as events
  syncFromSupabase: async () => {
    try {
      const { data, error } = await articlesService.getAll();

      if (error) {
        if (
          error.code === "TABLE_NOT_FOUND" ||
          error.message?.includes("Table does not exist")
        ) {
          console.warn(
            "Articles table does not exist in Supabase. Please create it using the SQL script from ARTICLES_SUPABASE_SETUP.md"
          );
          return {
            synced: false,
            error: {
              ...error,
              userMessage:
                "Articles table does not exist. Please create it in Supabase first. Check ARTICLES_SUPABASE_SETUP.md for instructions.",
            },
          };
        }
        console.warn("Failed to fetch articles from Supabase:", error);
        return { synced: false, error };
      }

      // Map Supabase articles to local format
      const supabaseArticles = data
        ? data.map((a) => articlesService.mapSupabaseToLocal(a))
        : [];

      // Save to localStorage (Supabase is source of truth)
      articlesManager.saveAll(supabaseArticles);

      // Dispatch event to notify UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("articlesUpdated", { detail: supabaseArticles })
        );
      }

      return {
        synced: true,
        count: supabaseArticles.length,
        error: null,
      };
    } catch (err) {
      console.error("Exception syncing from Supabase:", err);
      return { synced: false, error: err };
    }
  },

  // Push local articles to Supabase (for initial sync) - same pattern as events
  syncToSupabase: async () => {
    try {
      const localArticles = articlesManager._getAllFromLocalStorage();
      let syncedCount = 0;
      let errorCount = 0;

      for (const article of localArticles) {
        // Check if article already exists in Supabase
        let existingArticle = null;
        if (article.id) {
          const { data } = await articlesService.getById(article.id);
          existingArticle = data;
        }

        if (existingArticle) {
          // Update existing article
          const { error } = await articlesService.update(article.id, article);
          if (!error) {
            syncedCount++;
          } else if (error.code !== "TABLE_NOT_FOUND") {
            errorCount++;
            console.warn(`Failed to update article ${article.titleEn}:`, error);
          }
        } else {
          // Add new article
          const { error } = await articlesService.add(article);
          if (!error) {
            syncedCount++;
          } else if (error.code !== "TABLE_NOT_FOUND") {
            errorCount++;
            console.warn(`Failed to add article ${article.titleEn}:`, error);
          }
        }
      }

      return {
        synced: true,
        syncedCount,
        errorCount,
        total: localArticles.length,
        error:
          errorCount > 0
            ? { message: `${errorCount} articles failed to sync` }
            : null,
      };
    } catch (err) {
      console.error("Exception syncing to Supabase:", err);
      return { synced: false, error: err };
    }
  },
};

// Therapy Programs Management
export const therapyProgramsManager = {
  // Cache for therapy programs (loaded from Supabase)
  _cache: null,
  _cacheTimestamp: null,
  _cacheTimeout: 5 * 60 * 1000, // 5 minutes
  
  // Track last sync time to prevent excessive syncs
  _lastSyncTime: 0,
  _syncCooldown: 10000, // 10 seconds cooldown between syncs
  
  // Track last fetch time to prevent excessive getAll() calls
  _lastFetchTime: 0,
  
  // Real-time subscription channel
  _subscription: null,

  // Get all therapy programs - Fetches from Supabase first (source of truth), falls back to localStorage
  getAll: async (options = {}) => {
    if (typeof window === "undefined") return [];
    
    const useCache = options.useCache !== false; // Default to true for performance
    const forceRefresh = options.forceRefresh === true;
    
    // Track last fetch time to prevent excessive requests
    const now = Date.now();
    const timeSinceLastFetch = now - (therapyProgramsManager._lastFetchTime || 0);
    const minFetchInterval = 10000; // 10 seconds minimum between fetches
    
    // If we have cached data and not forcing refresh, return it immediately
    // Only refresh in background if enough time has passed
    if (useCache && !forceRefresh) {
      const cached = localStorage.getItem("eacsl_therapy_programs");
      if (cached) {
        try {
          const cachedPrograms = JSON.parse(cached);
          // Only do background refresh if enough time has passed (10 seconds)
          if (timeSinceLastFetch >= minFetchInterval) {
            therapyProgramsManager._lastFetchTime = now;
            // Return cached data immediately, then refresh in background
            therapyProgramsManager.getAll({ forceRefresh: true, useCache: false }).catch(err => {
              console.warn('Background refresh failed:', err);
            });
          }
          return cachedPrograms;
        } catch (e) {
          console.error('Error parsing cached therapy programs:', e);
        }
      }
    }
    
    // If forcing refresh, check if we're within cooldown period
    if (forceRefresh && timeSinceLastFetch < minFetchInterval) {
      console.log(`⏱️ Therapy programs fetch cooldown active (${Math.ceil((minFetchInterval - timeSinceLastFetch) / 1000)}s remaining). Using cached data.`);
      return therapyProgramsManager._getAllFromLocalStorage();
    }
    
    // Update last fetch time
    therapyProgramsManager._lastFetchTime = now;
    
    // Fetch from Supabase (source of truth)
    try {
      console.log("🔄 Fetching therapy programs from Supabase...");
      const { data, error } = await therapyProgramsService.getAll();
      
      if (error) {
        // If table doesn't exist, fall back to localStorage
        if (error.code === "TABLE_NOT_FOUND") {
          console.warn("⚠️ Therapy programs table not found in Supabase. Using localStorage fallback.");
          return therapyProgramsManager._getAllFromLocalStorage();
        }
        
        // Other errors - log and fall back to localStorage
        console.error("❌ Error fetching from Supabase:", error);
        return therapyProgramsManager._getAllFromLocalStorage();
      }
      
      // Map Supabase programs to local format
      const supabasePrograms = data
        ? data.map((p) => therapyProgramsService.mapSupabaseToLocal(p))
        : [];
      
      // Save to localStorage as cache
      therapyProgramsManager.saveAll(supabasePrograms);
      
      console.log(`✅ Fetched ${supabasePrograms.length} therapy programs from Supabase`);
      return supabasePrograms;
    } catch (err) {
      console.error("❌ Exception fetching from Supabase:", err);
      return therapyProgramsManager._getAllFromLocalStorage();
    }
  },
  
  // Internal helper to get from localStorage (fallback)
  _getAllFromLocalStorage: () => {
    if (typeof window === "undefined") return [];
    
    // Check cache first
    if (therapyProgramsManager._cache && therapyProgramsManager._cacheTimestamp) {
      const cacheAge = Date.now() - therapyProgramsManager._cacheTimestamp;
      if (cacheAge < therapyProgramsManager._cacheTimeout) {
        return therapyProgramsManager._cache;
      }
    }

    // Try localStorage as fallback
    const stored = localStorage.getItem("eacsl_therapy_programs");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Update cache
        therapyProgramsManager._cache = parsed;
        therapyProgramsManager._cacheTimestamp = Date.now();
        return parsed;
      } catch (e) {
        console.error("Error parsing therapy programs from localStorage:", e);
        return [];
      }
    }
    return [];
  },

  // Save therapy programs to cache and localStorage
  saveAll: (programs) => {
    therapyProgramsManager._cache = programs;
    therapyProgramsManager._cacheTimestamp = Date.now();
    localStorage.setItem("eacsl_therapy_programs", JSON.stringify(programs));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("therapyProgramsUpdated", { detail: programs })
      );
    }
  },

  // Add new therapy program - Saves to Supabase first (source of truth), then updates localStorage cache
  add: async (program) => {
    // Prepare program data
    const newProgram = {
      ...program,
      createdAt: new Date().toISOString(),
    };

    // Save to Supabase FIRST (source of truth)
    try {
      console.log("💾 Saving therapy program to Supabase...");
      const { data, error } = await therapyProgramsService.add(newProgram);
      
      if (error) {
        // Handle table not found error - allow local storage fallback for development
        if (error.code === 'TABLE_NOT_FOUND') {
          console.warn("⚠️ Therapy programs table doesn't exist in Supabase. Saving to localStorage only.");
          // For development: save to localStorage as fallback
          const localPrograms = therapyProgramsManager._getAllFromLocalStorage();
          const tempId = localPrograms.length > 0 ? Math.max(...localPrograms.map((p) => p.id)) + 1 : 1;
          const localProgram = { ...newProgram, id: tempId };
          therapyProgramsManager.saveAll([...localPrograms, localProgram]);
          return localProgram;
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to save therapy program to Supabase:", error);
        throw new Error(`Failed to save therapy program: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data returned from Supabase');
      }
      
      console.log("✅ Therapy program successfully saved to Supabase:", data);
      
      // Update localStorage cache with the new program
      const localPrograms = therapyProgramsManager._getAllFromLocalStorage();
      const exists = localPrograms.some(p => p.id === data.id);
      
      if (!exists) {
        therapyProgramsManager.saveAll([...localPrograms, data]);
        console.log("✅ Therapy program added to localStorage cache");
      } else {
        // Update existing program
        const index = localPrograms.findIndex(p => p.id === data.id);
        if (index >= 0) {
          localPrograms[index] = data;
          therapyProgramsManager.saveAll(localPrograms);
          console.log("✅ Therapy program updated in localStorage cache");
        }
      }
      
      return data;
    } catch (err) {
      console.error("❌ Exception saving therapy program to Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Update therapy program - Updates Supabase first (source of truth), then updates localStorage cache
  update: async (id, updatedProgram) => {
    // Get current program from cache to merge with updates
    const localPrograms = therapyProgramsManager._getAllFromLocalStorage();
    const existingProgram = localPrograms.find((p) => p.id === id);

    if (!existingProgram) {
      console.error('Therapy program not found with id:', id);
      throw new Error(`Therapy program with id ${id} not found`);
    }

    // Merge updated fields with existing program data
    const completeProgram = {
      ...existingProgram,
      ...updatedProgram,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };

    // Update in Supabase FIRST (source of truth)
    try {
      console.log("💾 Updating therapy program in Supabase...");
      const { data, error } = await therapyProgramsService.update(id, completeProgram);
      
      if (error) {
        // If program doesn't exist in Supabase, try to add it
        if (error.code === 'PGRST116' && error.details?.includes('0 rows')) {
          console.log("Therapy program not found in Supabase, attempting to add instead...");
          const addResult = await therapyProgramsService.add(completeProgram);
          if (addResult.data && !addResult.error) {
            console.log("✅ Successfully added therapy program to Supabase (was missing)");
            // Update localStorage with the new data
            const localPrograms = therapyProgramsManager._getAllFromLocalStorage();
            const index = localPrograms.findIndex(p => p.id === id);
            if (index >= 0) {
              localPrograms[index] = addResult.data;
            } else {
              localPrograms.push(addResult.data);
            }
            therapyProgramsManager.saveAll(localPrograms);
            return addResult.data;
          } else if (addResult.error) {
            if (addResult.error.code === 'TABLE_NOT_FOUND') {
              // Table doesn't exist - fallback to localStorage for development
              console.warn("⚠️ Therapy programs table doesn't exist. Saving to localStorage only.");
              const localPrograms = therapyProgramsManager._getAllFromLocalStorage();
              const index = localPrograms.findIndex((p) => p.id === id);
              if (index >= 0) {
                localPrograms[index] = completeProgram;
                therapyProgramsManager.saveAll(localPrograms);
              }
              return completeProgram;
            }
            throw new Error(`Failed to add therapy program: ${addResult.error.message || 'Unknown error'}`);
          }
        } else if (error.code === 'TABLE_NOT_FOUND') {
          // Table doesn't exist - fallback to localStorage for development
          console.warn("⚠️ Therapy programs table doesn't exist. Saving to localStorage only.");
          const localPrograms = therapyProgramsManager._getAllFromLocalStorage();
          const index = localPrograms.findIndex((p) => p.id === id);
          if (index >= 0) {
            localPrograms[index] = completeProgram;
            therapyProgramsManager.saveAll(localPrograms);
          }
          return completeProgram;
        }
        
        // Other errors (400, 406, etc.) - throw to show to user
        console.error("❌ Failed to update therapy program in Supabase:", error);
        throw new Error(`Failed to update therapy program: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data returned from Supabase');
      }
      
      console.log("✅ Therapy program successfully updated in Supabase:", data);
      
      // Update localStorage cache
      const localPrograms = therapyProgramsManager._getAllFromLocalStorage();
      const index = localPrograms.findIndex((p) => p.id === id);
      if (index >= 0) {
        localPrograms[index] = data;
        therapyProgramsManager.saveAll(localPrograms);
        console.log("✅ Therapy program updated in localStorage cache");
      } else {
        // Program was added (new ID from Supabase)
        therapyProgramsManager.saveAll([...localPrograms, data]);
        console.log("✅ Therapy program added to localStorage cache");
      }
      
      return data;
    } catch (err) {
      console.error("❌ Exception updating therapy program in Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Delete therapy program - Deletes from Supabase first (source of truth), then updates localStorage cache
  delete: async (id) => {
    // Get program from cache first (for image deletion if needed)
    const localPrograms = therapyProgramsManager._getAllFromLocalStorage();
    const programToDelete = localPrograms.find((p) => p.id === id);
    
    if (!programToDelete) {
      console.warn(`Therapy program with id ${id} not found in cache`);
      // Still try to delete from Supabase in case it exists there
    }
    
    // Delete program's image from storage if it exists in Supabase Storage
    if (programToDelete && programToDelete.imagePath) {
      try {
        await therapyProgramsService.deleteImage(programToDelete.imagePath);
        console.log('✅ Deleted therapy program image from storage');
      } catch (deleteError) {
        console.warn('Could not delete therapy program image from storage:', deleteError);
        // Continue with program deletion even if image deletion fails
      }
    }

    // Delete from Supabase FIRST (source of truth)
    try {
      console.log("🗑️ Deleting therapy program from Supabase...");
      const { error } = await therapyProgramsService.delete(id);
      
      if (error) {
        if (error.code === 'TABLE_NOT_FOUND') {
          // Table doesn't exist - fallback to localStorage for development
          console.warn("⚠️ Therapy programs table doesn't exist. Deleting from localStorage only.");
          const filtered = localPrograms.filter((p) => p.id !== id);
          therapyProgramsManager.saveAll(filtered);
          return true;
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to delete therapy program from Supabase:", error);
        throw new Error(`Failed to delete therapy program: ${error.message || 'Unknown error'}`);
      }
      
      console.log("✅ Therapy program successfully deleted from Supabase");
      
      // Update localStorage cache
      const filtered = localPrograms.filter((p) => p.id !== id);
      therapyProgramsManager.saveAll(filtered);
      console.log("✅ Therapy program removed from localStorage cache");
      
      return true;
    } catch (err) {
      console.error("❌ Exception deleting therapy program from Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Get therapy program by ID (async - fetches from Supabase)
  getById: async (id) => {
    const programs = await therapyProgramsManager.getAll();
    return programs.find((p) => p.id === id) || null;
  },
  
  // Get therapy program by ID (synchronous - uses cache)
  getByIdSync: (id) => {
    const programs = therapyProgramsManager._getAllFromLocalStorage();
    return programs.find((p) => p.id === id) || null;
  },
  
  // Subscribe to real-time changes from Supabase
  subscribe: (callback) => {
    // Unsubscribe from previous subscription if exists
    if (therapyProgramsManager._subscription) {
      therapyProgramsManager._subscription.unsubscribe();
    }

    console.log("🔔 Setting up real-time subscription for therapy programs...");
    
    // Real-time subscription - just update state, don't fetch (periodic sync handles fetching)
    therapyProgramsManager._subscription = supabase
      .channel('therapy-programs-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'therapy_programs'
        },
        async (payload) => {
          console.log('🔔 Real-time therapy program change detected:', payload.eventType, payload);
          
          // Just notify the UI - don't fetch immediately
          // The periodic sync (every 10 seconds) will fetch the latest data
          // This prevents excessive requests while still being responsive
          if (callback && typeof callback === 'function') {
            // Get cached data to update UI immediately
            const cachedPrograms = therapyProgramsManager._getAllFromLocalStorage();
            callback(cachedPrograms, payload);
          }
          
          console.log('✅ Real-time notification sent (periodic sync will fetch latest data)');
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active for therapy programs (notifications only - periodic sync handles fetching)');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Real-time subscription error - table may not exist');
        }
      });

    // Return unsubscribe function
    return () => {
      if (therapyProgramsManager._subscription) {
        therapyProgramsManager._subscription.unsubscribe();
        therapyProgramsManager._subscription = null;
        console.log('🔕 Real-time subscription unsubscribed');
      }
    };
  },

  // Unsubscribe from real-time changes
  unsubscribe: () => {
    if (therapyProgramsManager._subscription) {
      therapyProgramsManager._subscription.unsubscribe();
      therapyProgramsManager._subscription = null;
      console.log('🔕 Real-time subscription unsubscribed');
    }
  },

  // Fetch therapy programs from Supabase and sync with local storage
  syncFromSupabase: async () => {
    const now = Date.now();
    const timeSinceLastSync = now - therapyProgramsManager._lastSyncTime;
    
    // If sync was called recently, skip it to prevent excessive requests
    if (timeSinceLastSync < therapyProgramsManager._syncCooldown) {
      const secondsLeft = Math.ceil((therapyProgramsManager._syncCooldown - timeSinceLastSync) / 1000);
      console.log(`⏱️ Therapy programs sync cooldown active (${secondsLeft}s remaining). Skipping sync.`);
      return {
        synced: false,
        skipped: true,
        nextAllowedIn: therapyProgramsManager._syncCooldown - timeSinceLastSync,
        error: null
      };
    }
    
    try {
      therapyProgramsManager._lastSyncTime = now;
      const { data, error } = await therapyProgramsService.getAll();

      if (error) {
        if (
          error.code === "TABLE_NOT_FOUND" ||
          error.message?.includes("Table does not exist")
        ) {
          console.warn(
            "Therapy programs table does not exist in Supabase. Please create it using the SQL script from THERAPY_PROGRAMS_SUPABASE_SETUP.md"
          );
          return {
            synced: false,
            error: {
              ...error,
              userMessage:
                "Therapy programs table does not exist. Please create it in Supabase first. Check THERAPY_PROGRAMS_SUPABASE_SETUP.md for instructions.",
            },
          };
        }
        console.warn("Failed to fetch therapy programs from Supabase:", error);
        return { synced: false, error };
      }

      // Map Supabase programs to local format
      const supabasePrograms = data
        ? data.map((p) => therapyProgramsService.mapSupabaseToLocal(p))
        : [];

      // Get existing local programs (use cached data for fast access)
      const localPrograms = therapyProgramsManager._getAllFromLocalStorage();

      // Start with Supabase programs as the source of truth
      const uniquePrograms = [...supabasePrograms];

      // Helper function to check if a program exists
      const programExists = (program, programsArray) => {
        return programsArray.some(
          (existing) =>
            program.id && existing.id && program.id === existing.id
        );
      };

      // Get all Supabase program IDs
      const supabaseIds = new Set(
        supabasePrograms
          .map((p) => p.id)
          .filter((id) => id != null)
          .map((id) => Number(id))
      );

      // Add local-only programs (those that don't exist in Supabase)
      localPrograms.forEach((localProgram) => {
        const existsInSupabase = programExists(localProgram, supabasePrograms);

        if (!existsInSupabase) {
          const localId = localProgram.id ? Number(localProgram.id) : null;
          const wasSyncedBefore =
            localId !== null && !isNaN(localId) && !supabaseIds.has(localId);

          if (!wasSyncedBefore) {
            // This is a truly local-only program
            uniquePrograms.push(localProgram);
          }
        }
      });

      therapyProgramsManager.saveAll(uniquePrograms);

      // Dispatch event to notify UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("therapyProgramsUpdated", { detail: uniquePrograms })
        );
      }

      return {
        synced: true,
        count: supabasePrograms.length,
        error: null,
      };
    } catch (err) {
      console.error("Exception syncing from Supabase:", err);
      return { synced: false, error: err };
    }
  },

  // Push local therapy programs to Supabase (for initial sync)
  // Push local therapy programs to Supabase (for initial sync) - same pattern as events
  syncToSupabase: async () => {
    try {
      const localPrograms = therapyProgramsManager._getAllFromLocalStorage();
      let syncedCount = 0;
      let errorCount = 0;

      for (const program of localPrograms) {
        // Check if program already exists in Supabase
        let existingProgram = null;
        if (program.id) {
          const { data } = await therapyProgramsService.getById(program.id);
          existingProgram = data;
        }

        if (existingProgram) {
          // Update existing program
          const { error } = await therapyProgramsService.update(program.id, program);
          if (!error) {
            syncedCount++;
          } else if (error.code !== "TABLE_NOT_FOUND") {
            errorCount++;
            console.warn(`Failed to update therapy program ${program.title}:`, error);
          }
        } else {
          // Add new program
          const { error } = await therapyProgramsService.add(program);
          if (!error) {
            syncedCount++;
          } else if (error.code !== "TABLE_NOT_FOUND") {
            errorCount++;
            console.warn(`Failed to add therapy program ${program.title}:`, error);
          }
        }
      }

      return {
        synced: true,
        syncedCount,
        errorCount,
        total: localPrograms.length,
        error:
          errorCount > 0
            ? { message: `${errorCount} therapy programs failed to sync` }
            : null,
      };
    } catch (err) {
      console.error("Exception syncing to Supabase:", err);
      return { synced: false, error: err };
    }
  },
};

// For Parents Management
export const forParentsManager = {
  // Cache for parent articles (loaded from Supabase)
  _cache: null,
  _cacheTimestamp: null,
  _cacheTimeout: 5 * 60 * 1000, // 5 minutes
  
  // Track last sync time to prevent excessive syncs
  _lastSyncTime: 0,
  _syncCooldown: 10000, // 10 seconds cooldown between syncs
  
  // Track last fetch time to prevent excessive getAll() calls
  _lastFetchTime: 0,
  
  // Real-time subscription channel
  _subscription: null,

  // Get all parent articles - Fetches from Supabase first (source of truth), falls back to localStorage
  getAll: async (options = {}) => {
    if (typeof window === "undefined") return [];
    
    const useCache = options.useCache !== false; // Default to true for performance
    const forceRefresh = options.forceRefresh === true;
    
    // Track last fetch time to prevent excessive requests
    const now = Date.now();
    const timeSinceLastFetch = now - (forParentsManager._lastFetchTime || 0);
    const minFetchInterval = 10000; // 10 seconds minimum between fetches
    
    // If we have cached data and not forcing refresh, return it immediately
    // Only refresh in background if enough time has passed
    if (useCache && !forceRefresh) {
      const cached = localStorage.getItem("eacsl_for_parents");
      if (cached) {
        try {
          const cachedArticles = JSON.parse(cached);
          // Only do background refresh if enough time has passed (10 seconds)
          if (timeSinceLastFetch >= minFetchInterval) {
            forParentsManager._lastFetchTime = now;
            // Return cached data immediately, then refresh in background
            forParentsManager.getAll({ forceRefresh: true, useCache: false }).catch(err => {
              console.warn('Background refresh failed:', err);
            });
          }
          return cachedArticles;
        } catch (e) {
          console.error('Error parsing cached for parents articles:', e);
        }
      }
    }
    
    // If forcing refresh, check if we're within cooldown period
    if (forceRefresh && timeSinceLastFetch < minFetchInterval) {
      console.log(`⏱️ For parents articles fetch cooldown active (${Math.ceil((minFetchInterval - timeSinceLastFetch) / 1000)}s remaining). Using cached data.`);
      return forParentsManager._getAllFromLocalStorage();
    }
    
    // Update last fetch time
    forParentsManager._lastFetchTime = now;
    
    // Fetch from Supabase (source of truth)
    try {
      console.log("🔄 Fetching for parents articles from Supabase...");
      const { data, error } = await forParentsService.getAll();
      
      if (error) {
        // If table doesn't exist, fall back to localStorage
        if (error.code === "TABLE_NOT_FOUND") {
          console.warn("⚠️ For parents table not found in Supabase. Using localStorage fallback.");
          return forParentsManager._getAllFromLocalStorage();
        }
        
        // Other errors - log and fall back to localStorage
        console.error("❌ Error fetching from Supabase:", error);
        return forParentsManager._getAllFromLocalStorage();
      }
      
      // Map Supabase articles to local format
      const supabaseArticles = data
        ? data.map((a) => forParentsService.mapSupabaseToLocal(a))
        : [];
      
      // Save to localStorage as cache
      forParentsManager.saveAll(supabaseArticles);
      
      console.log(`✅ Fetched ${supabaseArticles.length} for parents articles from Supabase`);
      return supabaseArticles;
    } catch (err) {
      console.error("❌ Exception fetching from Supabase:", err);
      return forParentsManager._getAllFromLocalStorage();
    }
  },
  
  // Internal helper to get from localStorage (fallback)
  _getAllFromLocalStorage: () => {
    if (typeof window === "undefined") return [];
    
    // Check cache first
    if (forParentsManager._cache && forParentsManager._cacheTimestamp) {
      const cacheAge = Date.now() - forParentsManager._cacheTimestamp;
      if (cacheAge < forParentsManager._cacheTimeout) {
        return forParentsManager._cache;
      }
    }

    // Try localStorage as fallback
    const stored = localStorage.getItem("eacsl_for_parents");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Update cache
        forParentsManager._cache = parsed;
        forParentsManager._cacheTimestamp = Date.now();
        return parsed;
      } catch (e) {
        console.error("Error parsing for parents articles from localStorage:", e);
        return [];
      }
    }
    return [];
  },

  // Save parent articles to cache and localStorage
  saveAll: (articles) => {
    forParentsManager._cache = articles;
    forParentsManager._cacheTimestamp = Date.now();
    localStorage.setItem("eacsl_for_parents", JSON.stringify(articles));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("forParentsUpdated", { detail: articles })
      );
    }
  },

  // Add new parent article - Saves to Supabase first (source of truth), then updates localStorage cache
  add: async (article) => {
    // Prepare article data
    const newArticle = {
      ...article,
      createdAt: new Date().toISOString(),
    };

    // Save to Supabase FIRST (source of truth)
    try {
      console.log("💾 Saving for parents article to Supabase...");
      const { data, error } = await forParentsService.add(newArticle);
      
      if (error) {
        // Handle table not found error - allow local storage fallback for development
        if (error.code === 'TABLE_NOT_FOUND') {
          console.warn("⚠️ For parents table doesn't exist in Supabase. Saving to localStorage only.");
          // For development: save to localStorage as fallback
          const localArticles = forParentsManager._getAllFromLocalStorage();
          const tempId = localArticles.length > 0 ? Math.max(...localArticles.map((a) => a.id)) + 1 : 1;
          const localArticle = { ...newArticle, id: tempId };
          forParentsManager.saveAll([...localArticles, localArticle]);
          return localArticle;
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to save for parents article to Supabase:", error);
        throw new Error(`Failed to save article: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data returned from Supabase');
      }
      
      console.log("✅ For parents article successfully saved to Supabase:", data);
      
      // Update localStorage cache with the new article
      const localArticles = forParentsManager._getAllFromLocalStorage();
      const exists = localArticles.some(a => a.id === data.id);
      
      if (!exists) {
        forParentsManager.saveAll([...localArticles, data]);
        console.log("✅ For parents article added to localStorage cache");
      } else {
        // Update existing article
        const index = localArticles.findIndex(a => a.id === data.id);
        if (index >= 0) {
          localArticles[index] = data;
          forParentsManager.saveAll(localArticles);
          console.log("✅ For parents article updated in localStorage cache");
        }
      }
      
      return data;
    } catch (err) {
      console.error("❌ Exception saving for parents article to Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Update parent article - Updates Supabase first (source of truth), then updates localStorage cache
  update: async (id, updatedArticle) => {
    // Get current article from cache to merge with updates
    const localArticles = forParentsManager._getAllFromLocalStorage();
    const existingArticle = localArticles.find((a) => a.id === id);

    if (!existingArticle) {
      console.error('For parents article not found with id:', id);
      throw new Error(`Article with id ${id} not found`);
    }

    // Merge updated fields with existing article data
    const completeArticle = {
      ...existingArticle,
      ...updatedArticle,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };

    // Update in Supabase FIRST (source of truth)
    try {
      console.log("💾 Updating for parents article in Supabase...");
      const { data, error } = await forParentsService.update(id, completeArticle);
      
      if (error) {
        // If article doesn't exist in Supabase, try to add it
        if (error.code === 'PGRST116' && error.details?.includes('0 rows')) {
          console.log("For parents article not found in Supabase, attempting to add instead...");
          const addResult = await forParentsService.add(completeArticle);
          if (addResult.data && !addResult.error) {
            console.log("✅ Successfully added for parents article to Supabase (was missing)");
            // Update localStorage with the new data
            const localArticles = forParentsManager._getAllFromLocalStorage();
            const index = localArticles.findIndex(a => a.id === id);
            if (index >= 0) {
              localArticles[index] = addResult.data;
            } else {
              localArticles.push(addResult.data);
            }
            forParentsManager.saveAll(localArticles);
            return addResult.data;
          } else if (addResult.error) {
            if (addResult.error.code === 'TABLE_NOT_FOUND') {
              // Table doesn't exist - fallback to localStorage for development
              console.warn("⚠️ For parents table doesn't exist. Saving to localStorage only.");
              const localArticles = forParentsManager._getAllFromLocalStorage();
              const index = localArticles.findIndex((a) => a.id === id);
              if (index >= 0) {
                localArticles[index] = completeArticle;
                forParentsManager.saveAll(localArticles);
              }
              return completeArticle;
            }
            throw new Error(`Failed to add article: ${addResult.error.message || 'Unknown error'}`);
          }
        } else if (error.code === 'TABLE_NOT_FOUND') {
          // Table doesn't exist - fallback to localStorage for development
          console.warn("⚠️ For parents table doesn't exist. Saving to localStorage only.");
          const localArticles = forParentsManager._getAllFromLocalStorage();
          const index = localArticles.findIndex((a) => a.id === id);
          if (index >= 0) {
            localArticles[index] = completeArticle;
            forParentsManager.saveAll(localArticles);
          }
          return completeArticle;
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to update for parents article in Supabase:", error);
        throw new Error(`Failed to update article: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data returned from Supabase');
      }
      
      console.log("✅ For parents article successfully updated in Supabase:", data);
      
      // Update localStorage cache
      const localArticles = forParentsManager._getAllFromLocalStorage();
      const index = localArticles.findIndex((a) => a.id === id);
      if (index >= 0) {
        localArticles[index] = data;
        forParentsManager.saveAll(localArticles);
        console.log("✅ For parents article updated in localStorage cache");
      } else {
        // Article was added (new ID from Supabase)
        forParentsManager.saveAll([...localArticles, data]);
        console.log("✅ For parents article added to localStorage cache");
      }
      
      return data;
    } catch (err) {
      console.error("❌ Exception updating for parents article in Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Delete parent article - Deletes from Supabase first (source of truth), then updates localStorage cache
  delete: async (id) => {
    // Get article from cache first (for image deletion if needed)
    const localArticles = forParentsManager._getAllFromLocalStorage();
    const articleToDelete = localArticles.find((a) => a.id === id);
    
    if (!articleToDelete) {
      console.warn(`For parents article with id ${id} not found in cache`);
      // Still try to delete from Supabase in case it exists there
    }
    
    // Delete article's image from storage if it exists in Supabase Storage
    if (articleToDelete && articleToDelete.imagePath) {
      try {
        await forParentsService.deleteImage(articleToDelete.imagePath);
        console.log('✅ Deleted for parents article image from storage');
      } catch (deleteError) {
        console.warn('Could not delete for parents article image from storage:', deleteError);
        // Continue with article deletion even if image deletion fails
      }
    }

    // Delete from Supabase FIRST (source of truth)
    try {
      console.log("🗑️ Deleting for parents article from Supabase...");
      const { error } = await forParentsService.delete(id);
      
      if (error) {
        if (error.code === 'TABLE_NOT_FOUND') {
          // Table doesn't exist - fallback to localStorage for development
          console.warn("⚠️ For parents table doesn't exist. Deleting from localStorage only.");
          const filtered = localArticles.filter((a) => a.id !== id);
          forParentsManager.saveAll(filtered);
          return true;
        }
        
        // Other errors - throw to show to user
        console.error("❌ Failed to delete for parents article from Supabase:", error);
        throw new Error(`Failed to delete article: ${error.message || 'Unknown error'}`);
      }
      
      console.log("✅ For parents article successfully deleted from Supabase");
      
      // Update localStorage cache
      const filtered = localArticles.filter((a) => a.id !== id);
      forParentsManager.saveAll(filtered);
      console.log("✅ For parents article removed from localStorage cache");
      
      return true;
    } catch (err) {
      console.error("❌ Exception deleting for parents article from Supabase:", err);
      // Re-throw to let caller handle the error
      throw err;
    }
  },

  // Get parent article by ID (async - fetches from Supabase)
  getById: async (id) => {
    const articles = await forParentsManager.getAll();
    return articles.find((a) => a.id === id) || null;
  },
  
  // Get parent article by ID (synchronous - uses cache)
  getByIdSync: (id) => {
    const articles = forParentsManager._getAllFromLocalStorage();
    return articles.find((a) => a.id === id) || null;
  },
  
  // Subscribe to real-time changes from Supabase
  subscribe: (callback) => {
    // Unsubscribe from previous subscription if exists
    if (forParentsManager._subscription) {
      forParentsManager._subscription.unsubscribe();
    }

    console.log("🔔 Setting up real-time subscription for for parents articles...");
    
    // Real-time subscription - just update state, don't fetch (periodic sync handles fetching)
    forParentsManager._subscription = supabase
      .channel('for-parents-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'for_parents'
        },
        async (payload) => {
          console.log('🔔 Real-time for parents article change detected:', payload.eventType, payload);
          
          // Just notify the UI - don't fetch immediately
          // The periodic sync (every 10 seconds) will fetch the latest data
          // This prevents excessive requests while still being responsive
          if (callback && typeof callback === 'function') {
            // Get cached data to update UI immediately
            const cachedArticles = forParentsManager._getAllFromLocalStorage();
            callback(cachedArticles, payload);
          }
          
          console.log('✅ Real-time notification sent (periodic sync will fetch latest data)');
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active for for parents articles (notifications only - periodic sync handles fetching)');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Real-time subscription error - table may not exist');
        }
      });

    // Return unsubscribe function
    return () => {
      if (forParentsManager._subscription) {
        forParentsManager._subscription.unsubscribe();
        forParentsManager._subscription = null;
        console.log('🔕 Real-time subscription unsubscribed');
      }
    };
  },

  // Unsubscribe from real-time changes
  unsubscribe: () => {
    if (forParentsManager._subscription) {
      forParentsManager._subscription.unsubscribe();
      forParentsManager._subscription = null;
      console.log('🔕 Real-time subscription unsubscribed');
    }
  },

  // Fetch parent articles from Supabase and sync with local storage
  syncFromSupabase: async () => {
    const now = Date.now();
    const timeSinceLastSync = now - forParentsManager._lastSyncTime;
    
    // If sync was called recently, skip it to prevent excessive requests
    if (timeSinceLastSync < forParentsManager._syncCooldown) {
      const secondsLeft = Math.ceil((forParentsManager._syncCooldown - timeSinceLastSync) / 1000);
      console.log(`⏱️ For parents articles sync cooldown active (${secondsLeft}s remaining). Skipping sync.`);
      return {
        synced: false,
        skipped: true,
        nextAllowedIn: forParentsManager._syncCooldown - timeSinceLastSync,
        error: null
      };
    }
    
    try {
      forParentsManager._lastSyncTime = now;
      const { data, error } = await forParentsService.getAll();

      if (error) {
        if (
          error.code === "TABLE_NOT_FOUND" ||
          error.message?.includes("Table does not exist")
        ) {
          console.warn(
            "For parents table does not exist in Supabase. Please create it using the SQL script from FOR_PARENTS_SUPABASE_SETUP.md"
          );
          return {
            synced: false,
            error: {
              ...error,
              userMessage:
                "For parents table does not exist. Please create it in Supabase first. Check FOR_PARENTS_SUPABASE_SETUP.md for instructions.",
            },
          };
        }
        console.warn("Failed to fetch parent articles from Supabase:", error);
        return { synced: false, error };
      }

      // Map Supabase articles to local format
      const supabaseArticles = data
        ? data.map((a) => forParentsService.mapSupabaseToLocal(a))
        : [];

      // Get existing local articles (use cached data for fast access)
      const localArticles = forParentsManager._getAllFromLocalStorage();

      // Start with Supabase articles as the source of truth
      const uniqueArticles = [...supabaseArticles];

      // Helper function to check if an article exists
      const articleExists = (article, articlesArray) => {
        return articlesArray.some(
          (existing) =>
            article.id && existing.id && article.id === existing.id
        );
      };

      // Get all Supabase article IDs
      const supabaseIds = new Set(
        supabaseArticles
          .map((a) => a.id)
          .filter((id) => id != null)
          .map((id) => Number(id))
      );

      // Add local-only articles (those that don't exist in Supabase)
      localArticles.forEach((localArticle) => {
        const existsInSupabase = articleExists(localArticle, supabaseArticles);

        if (!existsInSupabase) {
          const localId = localArticle.id ? Number(localArticle.id) : null;
          const wasSyncedBefore =
            localId !== null && !isNaN(localId) && !supabaseIds.has(localId);

          if (!wasSyncedBefore) {
            // This is a truly local-only article
            uniqueArticles.push(localArticle);
          }
        }
      });

      forParentsManager.saveAll(uniqueArticles);

      // Dispatch event to notify UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("forParentsUpdated", { detail: uniqueArticles })
        );
      }

      return {
        synced: true,
        count: supabaseArticles.length,
        error: null,
      };
    } catch (err) {
      console.error("Exception syncing from Supabase:", err);
      return { synced: false, error: err };
    }
  },

  // Push local parent articles to Supabase (for initial sync)
  syncToSupabase: async () => {
    try {
      const localArticles = forParentsManager._getAllFromLocalStorage();
      let syncedCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const article of localArticles) {
        try {
          // Prepare article data - ensure imageUrl is set from image if needed
          const articleData = {
            ...article,
            imageUrl: article.imageUrl || (article.image && !article.imagePath ? article.image : article.imageUrl),
          };

          // Check if article already exists in Supabase
          let existingArticle = null;
          if (article.id) {
            const { data } = await forParentsService.getById(article.id);
            existingArticle = data;
          }

          if (existingArticle) {
            // Update existing article
            const { error } = await forParentsService.update(article.id, articleData);
            if (!error) {
              syncedCount++;
              console.log(`✅ Synced parent article: ${article.title}`);
            } else if (error.code !== "TABLE_NOT_FOUND") {
              errorCount++;
              const errorMsg = `Failed to update parent article ${article.title}: ${error.message}`;
              console.warn(errorMsg);
              errors.push(errorMsg);
            }
          } else {
            // Add new article (don't pass the local ID, let Supabase generate one)
            const articleToAdd = { ...articleData };
            delete articleToAdd.id; // Remove local ID so Supabase generates a new one
            
            const { data, error } = await forParentsService.add(articleToAdd);
            if (!error && data) {
              syncedCount++;
              console.log(`✅ Added parent article to Supabase: ${article.title}`);
              
              // Update local article with Supabase ID
              const localArticles = forParentsManager._getAllFromLocalStorage();
              const index = localArticles.findIndex((a) => a.id === article.id);
              if (index !== -1) {
                localArticles[index] = { ...data, id: data.id };
                forParentsManager.saveAll(localArticles);
              }
            } else if (error && error.code !== "TABLE_NOT_FOUND") {
              errorCount++;
              const errorMsg = `Failed to add parent article ${article.title}: ${error.message}`;
              console.warn(errorMsg);
              errors.push(errorMsg);
            }
          }
        } catch (err) {
          errorCount++;
          const errorMsg = `Exception processing parent article ${article.title}: ${err.message}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      return {
        synced: true,
        syncedCount,
        errorCount,
        total: localArticles.length,
        errors: errors.length > 0 ? errors : undefined,
        error:
          errorCount > 0
            ? { message: `${errorCount} parent articles failed to sync`, details: errors }
            : null,
      };
    } catch (err) {
      console.error("Exception syncing to Supabase:", err);
      return { synced: false, error: err };
    }
  },
};

// Initialize localStorage (no default data - data comes from Supabase)
export const initializeData = () => {
  if (typeof window === "undefined") return;
  // Data will be loaded from Supabase or localStorage if it exists
  // No default data initialization needed
};
