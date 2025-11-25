// Data management utilities for CRUD operations
import { membersService } from "../services/membersService";
import { eventsService } from "../services/eventsService";
import { articlesService } from "../services/articlesService";
import { therapyProgramsService } from "../services/therapyProgramsService";
import { forParentsService } from "../services/forParentsService";
import { supabase } from "../lib/supabase";

// Shared throttling state for expensive Supabase syncs
const MEMBERS_SYNC_COOLDOWN_MS = 60 * 1000; // 1 minute
let membersSyncPromise = null;
let lastMembersSyncTime = 0;

// Courses Management
export const coursesManager = {
  // Get all courses (from localStorage)
  getAll: () => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("eacsl_courses");
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  },

  // Save courses to localStorage
  saveAll: (courses) => {
    localStorage.setItem("eacsl_courses", JSON.stringify(courses));
    // Also update the module (for immediate reflection)
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("coursesUpdated", { detail: courses })
      );
    }
  },

  // Add new course
  add: (course) => {
    const courses = coursesManager.getAll();
    const newCourse = {
      ...course,
      id: courses.length > 0 ? Math.max(...courses.map((c) => c.id)) + 1 : 1,
    };
    const updated = [...courses, newCourse];
    coursesManager.saveAll(updated);
    return newCourse;
  },

  // Update course
  update: (id, updatedCourse) => {
    const courses = coursesManager.getAll();
    const index = courses.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const updated = [...courses];
    updated[index] = { ...updatedCourse, id };
    coursesManager.saveAll(updated);
    return updated[index];
  },

  // Delete course
  delete: (id) => {
    const courses = coursesManager.getAll();
    const filtered = courses.filter((c) => c.id !== id);
    coursesManager.saveAll(filtered);
    return true;
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
        alert('Storage quota exceeded. Please clear some browser data or contact support.');
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
      
      // Update localStorage cache
      const index = localMembers.findIndex(m => m.id === id);
      if (index >= 0) {
        localMembers[index] = data;
        membersManager.saveAll(localMembers);
        console.log("✅ Member updated in localStorage cache");
      }
      
      return data;
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

  // Get all events (from cache or Supabase, fallback to localStorage)
  getAll: () => {
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

  // Get only upcoming events
  getUpcoming: () => {
    const all = eventsManager.getAll();
    return all.upcoming || [];
  },

  // Get only past events
  getPast: () => {
    const all = eventsManager.getAll();
    return all.past || [];
  },

  // Get event by ID (searches both upcoming and past)
  getById: (id) => {
    const all = eventsManager.getAll();
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

  // Add new event (syncs with Supabase)
  add: async (event) => {
    const all = eventsManager.getAll();
    const upcoming = all.upcoming || [];
    const tempId = upcoming.length > 0 ? Math.max(...upcoming.map((e) => e.id)) + 1 : 1;
    const newEvent = {
      ...event,
      id: tempId,
      status: event.status || "upcoming",
      createdAt: new Date().toISOString(),
    };

    // Save to local storage first for immediate UI update
    const updated = {
      upcoming: event.status === "past" ? upcoming : [...upcoming, newEvent],
      past: event.status === "past" ? [...(all.past || []), newEvent] : all.past || [],
    };
    eventsManager.saveAll(updated);

    // Sync with Supabase
    try {
      const { data, error } = await eventsService.add(newEvent);
      if (data && !error) {
        // Update local event with Supabase ID if different
        const localEvents = eventsManager.getAll();
        if (data.status === "upcoming") {
          const index = localEvents.upcoming.findIndex((e) => e.id === tempId);
          if (index !== -1) {
            localEvents.upcoming[index] = { ...data, id: data.id || tempId };
            eventsManager.saveAll(localEvents);
          }
        } else {
          const index = localEvents.past.findIndex((e) => e.id === tempId);
          if (index !== -1) {
            localEvents.past[index] = { ...data, id: data.id || tempId };
            eventsManager.saveAll(localEvents);
          }
        }
        return data;
      } else if (error && error.code !== "TABLE_NOT_FOUND") {
        console.warn("Failed to sync event to Supabase:", error);
      }
    } catch (err) {
      console.error("Exception syncing event to Supabase:", err);
    }

    return newEvent;
  },

  // Update event (syncs with Supabase)
  update: async (id, updatedEvent) => {
    const all = eventsManager.getAll();
    const upcoming = all.upcoming || [];
    const past = all.past || [];

    // Check in upcoming events
    let index = upcoming.findIndex((e) => e.id === id);
    let isUpcoming = true;
    if (index === -1) {
      // Check in past events
      index = past.findIndex((e) => e.id === id);
      isUpcoming = false;
    }

    if (index === -1) return null;

    const updated = isUpcoming ? [...upcoming] : [...past];
    updated[index] = { ...updatedEvent, id };

    // Handle status change (upcoming <-> past)
    const oldStatus = isUpcoming ? "upcoming" : "past";
    const newStatus = updatedEvent.status || oldStatus;

    let finalUpcoming = upcoming;
    let finalPast = past;

    if (oldStatus !== newStatus) {
      // Status changed - move event between arrays
      if (newStatus === "past") {
        finalUpcoming = upcoming.filter((e) => e.id !== id);
        finalPast = [...past, updated[index]];
      } else {
        finalPast = past.filter((e) => e.id !== id);
        finalUpcoming = [...upcoming, updated[index]];
      }
    } else {
      // Status unchanged - just update in place
      if (isUpcoming) {
        finalUpcoming = updated;
      } else {
        finalPast = updated;
      }
    }

    eventsManager.saveAll({
      upcoming: finalUpcoming,
      past: finalPast,
    });

    // Sync with Supabase
    eventsService
      .update(id, updated[index])
      .then(({ error }) => {
        if (error && error.code !== "TABLE_NOT_FOUND") {
          console.warn("Failed to sync event update to Supabase:", error);
        }
      })
      .catch((err) => {
        console.warn("Exception syncing event update to Supabase:", err);
      });

    return updated[index];
  },

  // Delete event (syncs with Supabase)
  delete: async (id) => {
    const all = eventsManager.getAll();
    const upcoming = (all.upcoming || []).filter((e) => e.id !== id);
    const past = (all.past || []).filter((e) => e.id !== id);

    // Save to local storage first for immediate UI update
    eventsManager.saveAll({ upcoming, past });

    // Sync with Supabase
    eventsService
      .delete(id)
      .then(({ error }) => {
        if (error && error.code !== "TABLE_NOT_FOUND") {
          console.warn("Failed to sync event deletion to Supabase:", error);
        }
      })
      .catch((err) => {
        console.warn("Exception syncing event deletion to Supabase:", err);
      });

    return true;
  },

  // Move event from upcoming to past
  moveToPast: async (id) => {
    const all = eventsManager.getAll();
    const upcoming = all.upcoming || [];
    const past = all.past || [];

    const eventIndex = upcoming.findIndex((e) => e.id === id);
    if (eventIndex === -1) return null;

    const event = upcoming[eventIndex];
    const updatedEvent = {
      ...event,
      status: "past",
      movedToPastAt: new Date().toISOString(),
    };

    const updatedUpcoming = upcoming.filter((e) => e.id !== id);
    const updatedPast = [...past, updatedEvent];

    eventsManager.saveAll({
      upcoming: updatedUpcoming,
      past: updatedPast,
    });

    // Sync with Supabase
    eventsService
      .update(id, updatedEvent)
      .then(({ error }) => {
        if (error && error.code !== "TABLE_NOT_FOUND") {
          console.warn("Failed to sync event move to Supabase:", error);
        }
      })
      .catch((err) => {
        console.warn("Exception syncing event move to Supabase:", err);
      });

    return updatedEvent;
  },

  // Move event from past to upcoming
  moveToUpcoming: async (id) => {
    const all = eventsManager.getAll();
    const upcoming = all.upcoming || [];
    const past = all.past || [];

    const eventIndex = past.findIndex((e) => e.id === id);
    if (eventIndex === -1) return null;

    const event = past[eventIndex];
    const updatedEvent = {
      ...event,
      status: "upcoming",
      movedToUpcomingAt: new Date().toISOString(),
    };

    const updatedPast = past.filter((e) => e.id !== id);
    const updatedUpcoming = [...upcoming, updatedEvent];

    eventsManager.saveAll({
      upcoming: updatedUpcoming,
      past: updatedPast,
    });

    // Sync with Supabase
    eventsService
      .update(id, updatedEvent)
      .then(({ error }) => {
        if (error && error.code !== "TABLE_NOT_FOUND") {
          console.warn("Failed to sync event move to Supabase:", error);
        }
      })
      .catch((err) => {
        console.warn("Exception syncing event move to Supabase:", err);
      });

    return updatedEvent;
  },

  // Fetch events from Supabase and sync with local storage
  syncFromSupabase: async () => {
    try {
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

      // Get existing local events
      const localEvents = eventsManager.getAll();

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
      const localEvents = eventsManager.getAll();
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

  // Get all articles (from cache or Supabase, fallback to localStorage)
  getAll: () => {
    if (typeof window === "undefined") return [];
    
    // Check cache first
    if (articlesManager._cache && articlesManager._cacheTimestamp) {
      const cacheAge = Date.now() - articlesManager._cacheTimestamp;
      if (cacheAge < articlesManager._cacheTimeout) {
        return articlesManager._cache;
      }
    }

    // Check localStorage
    const stored = localStorage.getItem("eacsl_articles");
    if (stored) {
      const articles = JSON.parse(stored);
      // Update cache
      articlesManager._cache = articles;
      articlesManager._cacheTimestamp = Date.now();
      return articles;
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

  // Get all articles (from cache or Supabase, fallback to localStorage)
  getAll: () => {
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

  // Add new article (syncs with Supabase)
  add: async (article) => {
    const articles = articlesManager.getAll();
    const tempId = articles.length > 0 ? Math.max(...articles.map((a) => a.id)) + 1 : 1;
    const newArticle = {
      ...article,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    // Save to local storage first for immediate UI update
    const updated = [...articles, newArticle];
    articlesManager.saveAll(updated);

    // Sync with Supabase
    try {
      const { data, error } = await articlesService.add(newArticle);
      if (data && !error) {
        // Update local article with Supabase ID if different
        const localArticles = articlesManager.getAll();
        const index = localArticles.findIndex((a) => a.id === tempId);
        if (index !== -1) {
          localArticles[index] = { ...data, id: data.id || tempId };
          articlesManager.saveAll(localArticles);
        }
        return data;
      } else if (error && error.code !== "TABLE_NOT_FOUND") {
        console.warn("Failed to sync article to Supabase:", error);
      }
    } catch (err) {
      console.error("Exception syncing article to Supabase:", err);
    }

    return newArticle;
  },

  // Update article (syncs with Supabase)
  update: async (id, updatedArticle) => {
    const articles = articlesManager.getAll();
    const index = articles.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const updated = [...articles];
    updated[index] = {
      ...updatedArticle,
      id,
      updatedAt: new Date().toISOString(),
    };

    // Save to local storage first for immediate UI update
    articlesManager.saveAll(updated);

    // Sync with Supabase
    articlesService
      .update(id, updated[index])
      .then(({ error }) => {
        if (error && error.code !== "TABLE_NOT_FOUND") {
          console.warn("Failed to sync article update to Supabase:", error);
        }
      })
      .catch((err) => {
        console.warn("Exception syncing article update to Supabase:", err);
      });

    return updated[index];
  },

  // Delete article (syncs with Supabase)
  delete: async (id) => {
    const articles = articlesManager.getAll();
    
    // Get article to delete image if needed
    const article = articles.find((a) => a.id === id);
    if (article && article.imagePath) {
      // Delete image from storage
      articlesService.deleteImage(article.imagePath).catch((err) => {
        console.warn("Failed to delete article image from storage:", err);
      });
    }

    const filtered = articles.filter((a) => a.id !== id);

    // Save to local storage first for immediate UI update
    articlesManager.saveAll(filtered);

    // Sync with Supabase
    articlesService
      .delete(id)
      .then(({ error }) => {
        if (error && error.code !== "TABLE_NOT_FOUND") {
          console.warn("Failed to sync article deletion to Supabase:", error);
        }
      })
      .catch((err) => {
        console.warn("Exception syncing article deletion to Supabase:", err);
      });

    return true;
  },

  // Get article by ID
  getById: (id) => {
    const articles = articlesManager.getAll();
    return articles.find((a) => a.id === id) || null;
  },

  // Fetch articles from Supabase and sync with local storage
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

      // Get existing local articles
      const localArticles = articlesManager.getAll();

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

      articlesManager.saveAll(uniqueArticles);

      // Dispatch event to notify UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("articlesUpdated", { detail: uniqueArticles })
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

  // Push local articles to Supabase (for initial sync)
  syncToSupabase: async () => {
    try {
      const localArticles = articlesManager.getAll();
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
            const { data } = await articlesService.getById(article.id);
            existingArticle = data;
          }

          if (existingArticle) {
            // Update existing article
            const { error } = await articlesService.update(article.id, articleData);
            if (!error) {
              syncedCount++;
              console.log(`✅ Synced article: ${article.titleEn}`);
            } else if (error.code !== "TABLE_NOT_FOUND") {
              errorCount++;
              const errorMsg = `Failed to update article ${article.titleEn}: ${error.message}`;
              console.warn(errorMsg);
              errors.push(errorMsg);
            }
          } else {
            // Add new article (don't pass the local ID, let Supabase generate one)
            const articleToAdd = { ...articleData };
            delete articleToAdd.id; // Remove local ID so Supabase generates a new one
            
            const { data, error } = await articlesService.add(articleToAdd);
            if (!error && data) {
              syncedCount++;
              console.log(`✅ Added article to Supabase: ${article.titleEn}`);
              
              // Update local article with Supabase ID
              const localArticles = articlesManager.getAll();
              const index = localArticles.findIndex((a) => a.id === article.id);
              if (index !== -1) {
                localArticles[index] = { ...data, id: data.id };
                articlesManager.saveAll(localArticles);
              }
            } else if (error && error.code !== "TABLE_NOT_FOUND") {
              errorCount++;
              const errorMsg = `Failed to add article ${article.titleEn}: ${error.message}`;
              console.warn(errorMsg);
              errors.push(errorMsg);
            }
          }
        } catch (err) {
          errorCount++;
          const errorMsg = `Exception processing article ${article.titleEn}: ${err.message}`;
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
            ? { message: `${errorCount} articles failed to sync`, details: errors }
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

  // Get all therapy programs (from cache or Supabase, fallback to localStorage)
  getAll: () => {
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

  // Add new therapy program (syncs with Supabase)
  add: async (program) => {
    const programs = therapyProgramsManager.getAll();
    const tempId = programs.length > 0 ? Math.max(...programs.map((p) => p.id)) + 1 : 1;
    const newProgram = {
      ...program,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    // Save to local storage first for immediate UI update
    const updated = [...programs, newProgram];
    therapyProgramsManager.saveAll(updated);

    // Sync with Supabase
    try {
      const { data, error } = await therapyProgramsService.add(newProgram);
      if (data && !error) {
        // Update local program with Supabase ID if different
        const localPrograms = therapyProgramsManager.getAll();
        const index = localPrograms.findIndex((p) => p.id === tempId);
        if (index !== -1) {
          localPrograms[index] = { ...data, id: data.id || tempId };
          therapyProgramsManager.saveAll(localPrograms);
        }
        return data;
      } else if (error && error.code !== "TABLE_NOT_FOUND") {
        console.warn("Failed to sync therapy program to Supabase:", error);
      }
    } catch (err) {
      console.error("Exception syncing therapy program to Supabase:", err);
    }

    return newProgram;
  },

  // Update therapy program (syncs with Supabase)
  update: async (id, updatedProgram) => {
    const programs = therapyProgramsManager.getAll();
    const index = programs.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updated = [...programs];
    updated[index] = {
      ...updatedProgram,
      id,
      updatedAt: new Date().toISOString(),
    };

    // Save to local storage first for immediate UI update
    therapyProgramsManager.saveAll(updated);

    // Sync with Supabase
    therapyProgramsService
      .update(id, updated[index])
      .then(({ error }) => {
        if (error && error.code !== "TABLE_NOT_FOUND") {
          console.warn("Failed to sync therapy program update to Supabase:", error);
        }
      })
      .catch((err) => {
        console.warn("Exception syncing therapy program update to Supabase:", err);
      });

    return updated[index];
  },

  // Delete therapy program (syncs with Supabase)
  delete: async (id) => {
    const programs = therapyProgramsManager.getAll();
    
    // Get program to delete image if needed
    const program = programs.find((p) => p.id === id);
    if (program && program.imagePath) {
      // Delete image from storage
      therapyProgramsService.deleteImage(program.imagePath).catch((err) => {
        console.warn("Failed to delete therapy program image from storage:", err);
      });
    }

    const filtered = programs.filter((p) => p.id !== id);

    // Save to local storage first for immediate UI update
    therapyProgramsManager.saveAll(filtered);

    // Sync with Supabase
    therapyProgramsService
      .delete(id)
      .then(({ error }) => {
        if (error && error.code !== "TABLE_NOT_FOUND") {
          console.warn("Failed to sync therapy program deletion to Supabase:", error);
        }
      })
      .catch((err) => {
        console.warn("Exception syncing therapy program deletion to Supabase:", err);
      });

    return true;
  },

  // Get therapy program by ID
  getById: (id) => {
    const programs = therapyProgramsManager.getAll();
    return programs.find((p) => p.id === id) || null;
  },

  // Fetch therapy programs from Supabase and sync with local storage
  syncFromSupabase: async () => {
    try {
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

      // Get existing local programs
      const localPrograms = therapyProgramsManager.getAll();

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
  syncToSupabase: async () => {
    try {
      const localPrograms = therapyProgramsManager.getAll();
      let syncedCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const program of localPrograms) {
        try {
          // Prepare program data - ensure imageUrl is set from image if needed
          const programData = {
            ...program,
            imageUrl: program.imageUrl || (program.image && !program.imagePath ? program.image : program.imageUrl),
          };

          // Check if program already exists in Supabase
          let existingProgram = null;
          if (program.id) {
            const { data } = await therapyProgramsService.getById(program.id);
            existingProgram = data;
          }

          if (existingProgram) {
            // Update existing program
            const { error } = await therapyProgramsService.update(program.id, programData);
            if (!error) {
              syncedCount++;
              console.log(`✅ Synced therapy program: ${program.title}`);
            } else if (error.code !== "TABLE_NOT_FOUND") {
              errorCount++;
              const errorMsg = `Failed to update therapy program ${program.title}: ${error.message}`;
              console.warn(errorMsg);
              errors.push(errorMsg);
            }
          } else {
            // Add new program (don't pass the local ID, let Supabase generate one)
            const programToAdd = { ...programData };
            delete programToAdd.id; // Remove local ID so Supabase generates a new one
            
            const { data, error } = await therapyProgramsService.add(programToAdd);
            if (!error && data) {
              syncedCount++;
              console.log(`✅ Added therapy program to Supabase: ${program.title}`);
              
              // Update local program with Supabase ID
              const localPrograms = therapyProgramsManager.getAll();
              const index = localPrograms.findIndex((p) => p.id === program.id);
              if (index !== -1) {
                localPrograms[index] = { ...data, id: data.id };
                therapyProgramsManager.saveAll(localPrograms);
              }
            } else if (error && error.code !== "TABLE_NOT_FOUND") {
              errorCount++;
              const errorMsg = `Failed to add therapy program ${program.title}: ${error.message}`;
              console.warn(errorMsg);
              errors.push(errorMsg);
            }
          }
        } catch (err) {
          errorCount++;
          const errorMsg = `Exception processing therapy program ${program.title}: ${err.message}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      return {
        synced: true,
        syncedCount,
        errorCount,
        total: localPrograms.length,
        errors: errors.length > 0 ? errors : undefined,
        error:
          errorCount > 0
            ? { message: `${errorCount} therapy programs failed to sync`, details: errors }
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

  // Get all parent articles (from cache or Supabase, fallback to localStorage)
  getAll: () => {
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

  // Add new parent article (syncs with Supabase)
  add: async (article) => {
    const articles = forParentsManager.getAll();
    const tempId = articles.length > 0 ? Math.max(...articles.map((a) => a.id)) + 1 : 1;
    const newArticle = {
      ...article,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    // Save to local storage first for immediate UI update
    const updated = [...articles, newArticle];
    forParentsManager.saveAll(updated);

    // Sync with Supabase
    try {
      const { data, error } = await forParentsService.add(newArticle);
      if (data && !error) {
        // Update local article with Supabase ID if different
        const localArticles = forParentsManager.getAll();
        const index = localArticles.findIndex((a) => a.id === tempId);
        if (index !== -1) {
          localArticles[index] = { ...data, id: data.id || tempId };
          forParentsManager.saveAll(localArticles);
        }
        return data;
      } else if (error && error.code !== "TABLE_NOT_FOUND") {
        console.warn("Failed to sync parent article to Supabase:", error);
      }
    } catch (err) {
      console.error("Exception syncing parent article to Supabase:", err);
    }

    return newArticle;
  },

  // Update parent article (syncs with Supabase)
  update: async (id, updatedArticle) => {
    const articles = forParentsManager.getAll();
    const index = articles.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const updated = [...articles];
    updated[index] = {
      ...updatedArticle,
      id,
      updatedAt: new Date().toISOString(),
    };

    // Save to local storage first for immediate UI update
    forParentsManager.saveAll(updated);

    // Sync with Supabase
    forParentsService
      .update(id, updated[index])
      .then(({ error }) => {
        if (error && error.code !== "TABLE_NOT_FOUND") {
          console.warn("Failed to sync parent article update to Supabase:", error);
        }
      })
      .catch((err) => {
        console.warn("Exception syncing parent article update to Supabase:", err);
      });

    return updated[index];
  },

  // Delete parent article (syncs with Supabase)
  delete: async (id) => {
    const articles = forParentsManager.getAll();
    
    // Get article to delete image if needed
    const article = articles.find((a) => a.id === id);
    if (article && article.imagePath) {
      // Delete image from storage
      forParentsService.deleteImage(article.imagePath).catch((err) => {
        console.warn("Failed to delete parent article image from storage:", err);
      });
    }

    const filtered = articles.filter((a) => a.id !== id);

    // Save to local storage first for immediate UI update
    forParentsManager.saveAll(filtered);

    // Sync with Supabase
    forParentsService
      .delete(id)
      .then(({ error }) => {
        if (error && error.code !== "TABLE_NOT_FOUND") {
          console.warn("Failed to sync parent article deletion to Supabase:", error);
        }
      })
      .catch((err) => {
        console.warn("Exception syncing parent article deletion to Supabase:", err);
      });

    return true;
  },

  // Get parent article by ID
  getById: (id) => {
    const articles = forParentsManager.getAll();
    return articles.find((a) => a.id === id) || null;
  },

  // Fetch parent articles from Supabase and sync with local storage
  syncFromSupabase: async () => {
    try {
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

      // Get existing local articles
      const localArticles = forParentsManager.getAll();

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
      const localArticles = forParentsManager.getAll();
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
              const localArticles = forParentsManager.getAll();
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
