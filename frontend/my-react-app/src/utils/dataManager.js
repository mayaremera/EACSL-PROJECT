// Data management utilities for CRUD operations
// This can be easily replaced with API calls later
import { courses as defaultCourses } from "../data/courses";
import { members as defaultMembers } from "../data/members";
import { membersService } from "../services/membersService";
import { eventsService } from "../services/eventsService";
import { articlesService } from "../services/articlesService";
import { therapyProgramsService } from "../services/therapyProgramsService";
import { forParentsService } from "../services/forParentsService";

// Courses Management
export const coursesManager = {
  // Get all courses (from localStorage or default data)
  getAll: () => {
    if (typeof window === "undefined") return defaultCourses;
    const stored = localStorage.getItem("eacsl_courses");
    if (stored) {
      return JSON.parse(stored);
    }
    return defaultCourses;
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
  // Get all members (from localStorage or default data)
  getAll: () => {
    if (typeof window === "undefined") return defaultMembers;
    const stored = localStorage.getItem("eacsl_members");
    if (stored) {
      const members = JSON.parse(stored);
      // Ensure all members have isActive field (migrate old data)
      // IMPORTANT: Preserve false values - only add isActive if it doesn't exist
      const normalizedMembers = members.map((m) => {
        if (m.hasOwnProperty("isActive")) {
          // Property exists, preserve its value (false stays false, true stays true)
          return {
            ...m,
            isActive: Boolean(m.isActive),
          };
        } else {
          // Property doesn't exist, default to true (migration for old data)
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
    }
    return defaultMembers;
  },

  // Save members to localStorage
  saveAll: (members) => {
    localStorage.setItem("eacsl_members", JSON.stringify(members));
    // Also update the module (for immediate reflection)
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("membersUpdated", { detail: members })
      );
    }
  },

  // Add new member (syncs with Supabase)
  add: async (member) => {
    console.log("membersManager.add() called with member:", member);
    const members = membersManager.getAll();
    const tempId =
      members.length > 0 ? Math.max(...members.map((m) => m.id)) + 1 : 1;
    const newMember = {
      ...member,
      id: tempId,
      isActive: member.isActive !== undefined ? member.isActive : true,
    };

    console.log(
      "Creating member with tempId:",
      tempId,
      "Member data:",
      newMember
    );

    // Save to local storage first for immediate UI update
    const updated = [...members, newMember];
    membersManager.saveAll(updated);
    console.log(
      "Member saved to localStorage. Total members now:",
      updated.length
    );

    // Verify it was saved
    const verifySave = membersManager.getAll();
    const foundMember = verifySave.find((m) => m.id === tempId);
    if (foundMember) {
      console.log("Member verified in localStorage after save:", foundMember);
    } else {
      console.error(
        "ERROR: Member not found in localStorage immediately after save!"
      );
    }

    // Sync with Supabase (await to ensure it completes)
    try {
      console.log("Attempting to sync member to Supabase...");
      const { data, error } = await membersService.add(newMember);
      if (data && !error) {
        console.log("Member successfully synced to Supabase:", data);
        // Update local member with Supabase ID if different
        const localMembers = membersManager.getAll();
        const index = localMembers.findIndex((m) => m.id === tempId);
        if (index !== -1) {
          localMembers[index] = { ...data, id: data.id || tempId };
          membersManager.saveAll(localMembers);
          console.log("Local member updated with Supabase ID");
        }
        return data;
      } else if (error) {
        console.warn("Failed to sync member to Supabase:", error);
        console.log("Returning local member despite Supabase sync failure");
        // Still return the local member even if Supabase sync fails
        return newMember;
      }
    } catch (err) {
      console.error("Exception syncing member to Supabase:", err);
      console.log("Returning local member despite exception");
      // Still return the local member even if Supabase sync fails
      return newMember;
    }

    console.log("Returning new member:", newMember);
    return newMember;
  },

  // Update member (syncs with Supabase)
  update: async (id, updatedMember) => {
    const members = membersManager.getAll();
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const updated = [...members];
    // IMPORTANT: Preserve exact isActive value from updatedMember if provided
    // If not provided, keep existing value (don't default to true)
    const isActiveValue = updatedMember.hasOwnProperty("isActive")
      ? Boolean(updatedMember.isActive) // Use the value from form (can be false or true)
      : members[index].hasOwnProperty("isActive")
      ? Boolean(members[index].isActive)
      : true; // Only default to true if never set

    // Explicitly set all fields to ensure nothing is lost
    updated[index] = {
      id, // Preserve ID
      supabaseUserId:
        members[index].supabaseUserId ||
        updatedMember.supabaseUserId ||
        undefined, // Preserve Supabase user ID link
      name: updatedMember.name || "",
      role: updatedMember.role || "Member",
      nationality: updatedMember.nationality || "Egyptian",
      flagCode: updatedMember.flagCode || "eg",
      description: updatedMember.description || "",
      fullDescription: updatedMember.fullDescription || "",
      email: updatedMember.email || "",
      membershipDate: updatedMember.membershipDate || "",
      isActive: isActiveValue, // Use the preserved value
      activeTill: updatedMember.activeTill || "",
      certificates: updatedMember.certificates || [],
      phone: updatedMember.phone || "",
      location: updatedMember.location || "",
      website: updatedMember.website || "",
      linkedin: updatedMember.linkedin || "",
      image: updatedMember.image || "",
      totalMoneySpent: updatedMember.totalMoneySpent !== undefined ? updatedMember.totalMoneySpent : (members[index].totalMoneySpent || '0 EGP'),
      coursesEnrolled: updatedMember.coursesEnrolled !== undefined ? updatedMember.coursesEnrolled : (members[index].coursesEnrolled || 0),
      totalHoursLearned: updatedMember.totalHoursLearned !== undefined ? updatedMember.totalHoursLearned : (members[index].totalHoursLearned || 0),
      activeCourses: updatedMember.activeCourses !== undefined ? updatedMember.activeCourses : (members[index].activeCourses || []),
      completedCourses: updatedMember.completedCourses !== undefined ? updatedMember.completedCourses : (members[index].completedCourses || []),
    };

    // Save to local storage first for immediate UI update
    membersManager.saveAll(updated);

    // Sync with Supabase (async, don't block)
    membersService
      .update(id, updated[index])
      .then(({ error }) => {
        if (error) {
          console.warn("Failed to sync member update to Supabase:", error);
        }
      })
      .catch((err) => {
        console.warn("Exception syncing member update to Supabase:", err);
      });

    return updated[index];
  },

  // Delete member (syncs with Supabase)
  delete: async (id) => {
    const members = membersManager.getAll();
    const filtered = members.filter((m) => m.id !== id);

    // Save to local storage first for immediate UI update
    membersManager.saveAll(filtered);

    // Sync with Supabase (async, don't block)
    membersService
      .delete(id)
      .then(({ error }) => {
        if (error) {
          console.warn("Failed to sync member deletion to Supabase:", error);
          // If Supabase delete fails, we could restore from local storage
          // But for now, we'll keep the local deletion
        }
      })
      .catch((err) => {
        console.warn("Exception syncing member deletion to Supabase:", err);
      });

    return true;
  },

  // Fetch members from Supabase and sync with local storage
  syncFromSupabase: async () => {
    try {
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
        console.warn("Failed to fetch members from Supabase:", error);
        return { synced: false, error };
      }

      // Map Supabase members to local format
      const supabaseMembers = data
        ? data.map((m) => membersService.mapSupabaseToLocal(m))
        : [];

      // Get existing local members
      const localMembers = membersManager.getAll();

      // Start with Supabase members as the source of truth
      const uniqueMembers = [...supabaseMembers];

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

      // Get all Supabase member IDs for quick lookup (convert to numbers for comparison)
      const supabaseIds = new Set(
        supabaseMembers
          .map((m) => m.id)
          .filter((id) => id != null)
          .map((id) => Number(id))
      );

      // Add local-only members (those that don't exist in Supabase)
      // Only keep local members that were NEVER synced to Supabase
      localMembers.forEach((localMember) => {
        // Check if this member exists in Supabase (by ID, userId, or email)
        const existsInSupabase = memberExists(localMember, supabaseMembers);

        if (!existsInSupabase) {
          // Member doesn't exist in Supabase
          // Check if it was previously synced (has a Supabase ID that's not in current Supabase)
          const localId = localMember.id ? Number(localMember.id) : null;

          // If local member has a numeric ID that's NOT in Supabase IDs, it was deleted
          // Exception: If the ID is in supabaseIds, it exists (but memberExists should have caught it)
          // Exception: If ID is null/NaN, it was never synced
          const wasSyncedBefore =
            localId !== null && !isNaN(localId) && !supabaseIds.has(localId);

          if (!wasSyncedBefore) {
            // This is a truly local-only member that was never synced
            // (has no ID, non-numeric ID, or ID that exists in Supabase)
            uniqueMembers.push(localMember);
          }
          // Otherwise, it was synced before but deleted from Supabase - don't keep it
        }
      });

      // Calculate which members were removed
      const removedMembers = localMembers.filter((localMember) => {
        const existsInSupabase = memberExists(localMember, supabaseMembers);
        if (existsInSupabase) return false;

        const localId = localMember.id ? Number(localMember.id) : null;
        const wasSyncedBefore =
          localId !== null && !isNaN(localId) && !supabaseIds.has(localId);

        return wasSyncedBefore;
      });

      console.log("Sync result:", {
        supabaseCount: supabaseMembers.length,
        localCount: localMembers.length,
        finalCount: uniqueMembers.length,
        removed: removedMembers.length,
        removedMemberIds: removedMembers.map((m) => m.id),
        removedMemberNames: removedMembers.map((m) => m.name || m.email),
      });

      membersManager.saveAll(uniqueMembers);

      // Dispatch event to notify UI of the update
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("membersUpdated", { detail: uniqueMembers })
        );
      }

      return {
        synced: true,
        count: supabaseMembers.length,
        localCount: localMembers.length,
        removed: removedMembers.length,
        error: null,
      };
    } catch (err) {
      console.error("Exception syncing from Supabase:", err);
      return { synced: false, error: err };
    }
  },

  // Push local members to Supabase (for initial sync)
  syncToSupabase: async () => {
    try {
      const localMembers = membersManager.getAll();
      let syncedCount = 0;
      let errorCount = 0;

      for (const member of localMembers) {
        // Check if member already exists in Supabase (by email or supabaseUserId)
        let existingMember = null;

        if (member.supabaseUserId) {
          const { data } = await membersService.getByUserId(
            member.supabaseUserId
          );
          existingMember = data;
        }

        if (!existingMember && member.email) {
          // Try to find by email (we'd need to add this method to membersService)
          // For now, we'll just try to add and handle duplicates
        }

        if (existingMember) {
          // Update existing member
          const { error } = await membersService.update(
            existingMember.id,
            member
          );
          if (!error) {
            syncedCount++;
          } else if (error.code !== "TABLE_NOT_FOUND") {
            errorCount++;
            console.warn(`Failed to update member ${member.name}:`, error);
          }
        } else {
          // Add new member
          const { error } = await membersService.add(member);
          if (!error) {
            syncedCount++;
          } else if (error.code !== "TABLE_NOT_FOUND") {
            errorCount++;
            console.warn(`Failed to add member ${member.name}:`, error);
          }
        }
      }

      return {
        synced: true,
        syncedCount,
        errorCount,
        total: localMembers.length,
        error:
          errorCount > 0
            ? { message: `${errorCount} members failed to sync` }
            : null,
      };
    } catch (err) {
      console.error("Exception syncing to Supabase:", err);
      return { synced: false, error: err };
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

// Initialize default event data (used when no events exist)
const getDefaultEvent = () => ({
  title: "Conference Schedule",
  subtitle:
    "Advancing Practice and Research in Speech-Language Pathology: Bridging Science and Clinical Impact",
  memberFee: 500,
  guestFee: 800,
  tracks: [
    "Track A: Speech & Swallowing",
    "Track B: Language Disorders",
    "Track C: Audiology",
  ],
  scheduleDay1: [
    {
      time: "4:00 - 5:00 PM",
      trackA: "Opening Ceremony & Welcome Address - Conference Chair",
      trackB: "All Attendees",
      trackC: "All Attendees",
    },
    {
      time: "5:00 - 7:00 PM",
      trackA: "Session 1A: Advances in Aphasia Rehabilitation",
      trackB: "Session 1B: Translating Research into Practice",
      trackC: "Session 1C: Digital Tools in SLP Education",
    },
    {
      time: "7:00 - 7:30 PM",
      trackA: "Break / Networking / Exhibits",
      trackB: "Break / Networking / Exhibits",
      trackC: "Break / Networking / Exhibits",
    },
    {
      time: "7:30 - 9:30 PM",
      trackA: "Session 2A: Pediatric Speech Disorders",
      trackB: "Session 2B: Motor Speech Disorders Symposium",
      trackC: "Session 2C: Clinical Education Innovations",
    },
  ],
  scheduleDay2: [
    {
      time: "4:00 - 6:00 PM",
      trackA: "Session 3A: Leadership in SLP Practice",
      trackB: "Session 3B: Voice and Fluency Disorders",
      trackC: "Session 3C: Advocacy & Ethical Practice",
    },
    {
      time: "6:00 - 6:30 PM",
      trackA: "Break / Networking",
      trackB: "Break / Networking",
      trackC: "Break / Networking",
    },
    {
      time: "6:30 - 8:30 PM",
      trackA: "Session 4A: Excellence in Clinical Documentation",
      trackB: "Session 4B: Best Practices in Research Forum",
      trackC: "Session 4C: The Future of Public Health in Telepractice",
    },
    {
      time: "8:30 PM",
      trackA: "Closing Ceremony & Conference Summary",
      trackB: "All Attendees",
      trackC: "All Attendees",
    },
  ],
  day1Title: "Day One - Knowledge and Innovation",
  day2Title: "Day Two - Collaboration and Future Directions",
  heroImageUrl: "",
  status: "upcoming",
  createdAt: new Date().toISOString(),
});

// Default articles data
const defaultArticles = [
  {
    id: 1,
    titleAr: "تطوير مهارات التواصل لدى الأطفال المصابين بالتوحد",
    titleEn: "Developing Communication Skills in Children with Autism",
    category: "Autism",
    categoryAr: "التوحد",
    date: "2024-10-15",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=500&fit=crop",
    excerptAr:
      "استراتيجيات فعالة لتحسين مهارات التواصل الاجتماعي واللغوي للأطفال ذوي اضطراب طيف التوحد.",
    excerptEn:
      "Effective strategies to improve social and linguistic communication skills in children with autism spectrum disorder.",
    url: "https://www.autismspeaks.org/tool-kit/atnair-p-guide-communication",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    titleAr: "الحبسة الكلامية: الأسباب والعلاج",
    titleEn: "Aphasia: Causes and Treatment",
    category: "Aphasia",
    categoryAr: "الحبسة الكلامية",
    date: "2024-09-28",
    image:
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=500&fit=crop",
    excerptAr:
      "فهم شامل للحبسة الكلامية، أنواعها المختلفة، وأحدث طرق العلاج المستخدمة.",
    excerptEn:
      "Comprehensive understanding of aphasia, its types, and the latest treatment methods used.",
    url: "https://www.asha.org/public/speech/disorders/aphasia/",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    titleAr: "أهمية التدخل المبكر في علاج اضطرابات النطق",
    titleEn: "The Importance of Early Intervention in Speech Disorders",
    category: "Speech Therapy",
    categoryAr: "علاج النطق",
    date: "2024-11-01",
    image:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=500&fit=crop",
    excerptAr:
      "دراسة شاملة تبرز أهمية الكشف المبكر والتدخل العلاجي المبكر في علاج اضطرابات النطق.",
    excerptEn:
      "Comprehensive study highlighting the importance of early detection and intervention in speech disorders.",
    url: "https://www.asha.org/public/speech/development/early-intervention/",
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    titleAr: "اضطرابات البلع: التشخيص والعلاج",
    titleEn: "Swallowing Disorders: Diagnosis and Treatment",
    category: "Dysphagia",
    categoryAr: "عسر البلع",
    date: "2024-08-20",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop",
    excerptAr:
      "نظرة متعمقة على اضطرابات البلع، أسبابها المختلفة، وطرق التشخيص والعلاج الحديثة.",
    excerptEn:
      "In-depth look at swallowing disorders, their causes, and modern diagnosis and treatment methods.",
    url: "https://www.asha.org/public/speech/swallowing/swallowing-disorders-in-adults/",
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    titleAr: "علاج التلعثم عند الأطفال والبالغين",
    titleEn: "Stuttering Treatment in Children and Adults",
    category: "Fluency Disorders",
    categoryAr: "اضطرابات الطلاقة",
    date: "2024-10-05",
    image:
      "https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?w=800&h=500&fit=crop",
    excerptAr:
      "دليل شامل لفهم التلعثم، أسبابه، والتقنيات العلاجية الحديثة المثبتة علمياً.",
    excerptEn:
      "Comprehensive guide to understanding stuttering, its causes, and scientifically proven modern treatment techniques.",
    url: "https://www.stutteringhelp.org/what-stuttering",
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    titleAr: "تطوير اللغة عند الأطفال ثنائيي اللغة",
    titleEn: "Language Development in Bilingual Children",
    category: "Language Development",
    categoryAr: "تطور اللغة",
    date: "2024-09-10",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop",
    excerptAr:
      "استكشاف فوائد وتحديات تربية الأطفال ثنائيي اللغة ودعم التطور اللغوي الصحي.",
    excerptEn:
      "Exploring the benefits and challenges of raising bilingual children and supporting healthy language development.",
    url: "https://www.asha.org/public/speech/development/learning-two-languages/",
    createdAt: new Date().toISOString(),
  },
  {
    id: 7,
    titleAr: "اضطرابات الصوت: الأسباب والوقاية",
    titleEn: "Voice Disorders: Causes and Prevention",
    category: "Voice Disorders",
    categoryAr: "اضطرابات الصوت",
    date: "2024-07-18",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=500&fit=crop",
    excerptAr:
      "معلومات حول أسباب اضطرابات الصوت وطرق الوقاية منها والحفاظ على صحة الحنجرة.",
    excerptEn:
      "Information about causes of voice disorders, prevention methods, and maintaining vocal health.",
    url: "https://www.asha.org/public/speech/disorders/voice/",
    createdAt: new Date().toISOString(),
  },
  {
    id: 8,
    titleAr: "تأخر الكلام واللغة عند الأطفال",
    titleEn: "Speech and Language Delays in Children",
    category: "Language Development",
    categoryAr: "تطور اللغة",
    date: "2024-08-05",
    image:
      "https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=800&h=500&fit=crop",
    excerptAr:
      "دليل الأهل لفهم علامات تأخر الكلام واللغة ومتى يجب طلب المساعدة المتخصصة.",
    excerptEn:
      "Parent's guide to understanding signs of speech and language delays and when to seek professional help.",
    url: "https://www.asha.org/public/speech/development/late-bloomer/",
    createdAt: new Date().toISOString(),
  },
];

// Articles Management
export const articlesManager = {
  // Cache for articles (loaded from Supabase)
  _cache: null,
  _cacheTimestamp: null,
  _cacheTimeout: 5 * 60 * 1000, // 5 minutes

  // Get all articles (from cache or Supabase, fallback to localStorage)
  getAll: () => {
    if (typeof window === "undefined") return defaultArticles;
    
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
        return parsed;
      } catch (e) {
        console.error("Error parsing articles from localStorage:", e);
        // If parsing fails, save defaults and return them
        localStorage.setItem("eacsl_articles", JSON.stringify(defaultArticles));
        return defaultArticles;
      }
    }
    // If no stored data, save defaults and return them
    localStorage.setItem("eacsl_articles", JSON.stringify(defaultArticles));
    return defaultArticles;
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
              console.log(`✅ Synced article: ${article.titleEn || article.titleAr}`);
            } else if (error.code !== "TABLE_NOT_FOUND") {
              errorCount++;
              const errorMsg = `Failed to update article ${article.titleEn || article.titleAr}: ${error.message}`;
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
              console.log(`✅ Added article to Supabase: ${article.titleEn || article.titleAr}`);
              
              // Update local article with Supabase ID
              const localArticles = articlesManager.getAll();
              const index = localArticles.findIndex((a) => a.id === article.id);
              if (index !== -1) {
                localArticles[index] = { ...data, id: data.id };
                articlesManager.saveAll(localArticles);
              }
            } else if (error && error.code !== "TABLE_NOT_FOUND") {
              errorCount++;
              const errorMsg = `Failed to add article ${article.titleEn || article.titleAr}: ${error.message}`;
              console.warn(errorMsg);
              errors.push(errorMsg);
            }
          }
        } catch (err) {
          errorCount++;
          const errorMsg = `Exception processing article ${article.titleEn || article.titleAr}: ${err.message}`;
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

// Default therapy programs data
const defaultTherapyPrograms = [
  {
    id: 1,
    title: "جلسات علاج النطق للأطفال",
    description: "توفير جلسات للأطفال لعلاج مجموعة متنوعة من الاضطرابات والإعاقات باستخدام تقنيات حديثة مثل التوحد واضطرابات السمع والشلل الدماغي ومتلازمة داون",
    icon: "MessageCircle",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80",
    imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80",
    imagePath: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "جلسات علاج النطق للبالغين",
    description: "توفير جلسات علاج النطق للبالغين الذين يعانون من اضطرابات النطق والطلاقة",
    icon: "Users",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80",
    imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80",
    imagePath: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "تنمية المهارات",
    description: "العمل مع الأطفال لتعزيز الذاكرة والانتباه والمهارات البصرية ومهارات الحياة والمهارات الأكاديمية",
    icon: "Brain",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    imagePath: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: "التدخل المبكر",
    description: "توفير التدخل المبكر لتحسين إنتاج الكلام والمهارات العامة للأطفال",
    icon: "Baby",
    image: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80",
    imageUrl: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80",
    imagePath: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    title: "الدعم النفسي والأسري",
    description: "نحن نقدم لك الدعم الذي تحتاجه لتحسين حياتك وحياة طفلك خاصة من يعانون من تحديات سلوكية",
    icon: "Users",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
    imagePath: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    title: "الاختبارات والتقييمات",
    description: "نحن نجري أنواعًا مختلفة من التقييمات والاختبارات مثل اختبار الذكاء واختبار CARS والمزيد",
    icon: "ClipboardList",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80",
    imagePath: null,
    createdAt: new Date().toISOString(),
  },
];

// Therapy Programs Management
export const therapyProgramsManager = {
  // Cache for therapy programs (loaded from Supabase)
  _cache: null,
  _cacheTimestamp: null,
  _cacheTimeout: 5 * 60 * 1000, // 5 minutes

  // Get all therapy programs (from cache or Supabase, fallback to localStorage)
  getAll: () => {
    if (typeof window === "undefined") return defaultTherapyPrograms;
    
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
        return parsed;
      } catch (e) {
        console.error("Error parsing therapy programs from localStorage:", e);
        // If parsing fails, save defaults and return them
        localStorage.setItem("eacsl_therapy_programs", JSON.stringify(defaultTherapyPrograms));
        return defaultTherapyPrograms;
      }
    }
    // If no stored data, save defaults and return them
    localStorage.setItem("eacsl_therapy_programs", JSON.stringify(defaultTherapyPrograms));
    return defaultTherapyPrograms;
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

// Default for parents articles data
const defaultForParentsArticles = [
  {
    id: 1,
    title: "كيفية تعزيز الثقة بالنفس لدى الأطفال",
    excerpt: "نصائح عملية لبناء ثقة طفلك بنفسه منذ الصغر",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80",
    imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80",
    imagePath: null,
    date: "15 أكتوبر 2024",
    author: "د. سارة أحمد",
    articleUrl: "https://www.example.com/article1",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "التواصل الفعال مع الأطفال",
    excerpt: "أساليب التواصل الصحيحة التي تبني علاقة قوية مع طفلك",
    image: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80",
    imageUrl: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80",
    imagePath: null,
    date: "10 أكتوبر 2024",
    author: "د. محمد حسن",
    articleUrl: "https://www.example.com/article2",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "التعامل مع نوبات الغضب عند الأطفال",
    excerpt: "استراتيجيات فعالة للتعامل مع الغضب والانفعالات",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    imagePath: null,
    date: "5 أكتوبر 2024",
    author: "د. ليلى إبراهيم",
    articleUrl: "https://www.example.com/article3",
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: "أهمية اللعب في نمو الطفل",
    excerpt: "كيف يساهم اللعب في التطور المعرفي والاجتماعي للطفل",
    image: "https://images.unsplash.com/photo-1587616211892-c1c8c6b76d4c?w=600&q=80",
    imageUrl: "https://images.unsplash.com/photo-1587616211892-c1c8c6b76d4c?w=600&q=80",
    imagePath: null,
    date: "1 أكتوبر 2024",
    author: "د. فاطمة علي",
    articleUrl: "https://www.example.com/article4",
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    title: "تنمية المهارات اللغوية للطفل",
    excerpt: "طرق فعالة لتطوير مهارات النطق واللغة عند الأطفال",
    image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&q=80",
    imageUrl: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&q=80",
    imagePath: null,
    date: "28 سبتمبر 2024",
    author: "د. خالد محمود",
    articleUrl: "https://www.example.com/article5",
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    title: "التربية الإيجابية وأثرها على الطفل",
    excerpt: "مبادئ التربية الإيجابية وكيفية تطبيقها في حياتك اليومية",
    image: "https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=600&q=80",
    imageUrl: "https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=600&q=80",
    imagePath: null,
    date: "25 سبتمبر 2024",
    author: "د. منى سالم",
    articleUrl: "https://www.example.com/article6",
    createdAt: new Date().toISOString(),
  },
  {
    id: 7,
    title: "كيفية بناء روتين يومي صحي للأطفال",
    excerpt: "أهمية الروتين اليومي وكيفية إنشائه بطريقة فعالة",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
    imagePath: null,
    date: "20 سبتمبر 2024",
    author: "د. أحمد يوسف",
    articleUrl: "https://www.example.com/article7",
    createdAt: new Date().toISOString(),
  },
  {
    id: 8,
    title: "التعامل مع التنمر والتحديات الاجتماعية",
    excerpt: "كيف تحمي طفلك من التنمر وتعزز مهاراته الاجتماعية",
    image: "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=600&q=80",
    imageUrl: "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=600&q=80",
    imagePath: null,
    date: "15 سبتمبر 2024",
    author: "د. نادية فريد",
    articleUrl: "https://www.example.com/article8",
    createdAt: new Date().toISOString(),
  },
  {
    id: 9,
    title: "تطوير الذكاء العاطفي عند الأطفال",
    excerpt: "طرق لمساعدة طفلك على فهم وإدارة مشاعره بشكل صحي",
    image: "https://images.unsplash.com/photo-1571442463800-1337d7af9d2f?w=600&q=80",
    imageUrl: "https://images.unsplash.com/photo-1571442463800-1337d7af9d2f?w=600&q=80",
    imagePath: null,
    date: "10 سبتمبر 2024",
    author: "د. طارق سمير",
    articleUrl: "https://www.example.com/article9",
    createdAt: new Date().toISOString(),
  },
];

// For Parents Management
export const forParentsManager = {
  // Cache for parent articles (loaded from Supabase)
  _cache: null,
  _cacheTimestamp: null,
  _cacheTimeout: 5 * 60 * 1000, // 5 minutes

  // Get all parent articles (from cache or Supabase, fallback to localStorage)
  getAll: () => {
    if (typeof window === "undefined") return defaultForParentsArticles;
    
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
        return parsed;
      } catch (e) {
        console.error("Error parsing for parents articles from localStorage:", e);
        // If parsing fails, save defaults and return them
        localStorage.setItem("eacsl_for_parents", JSON.stringify(defaultForParentsArticles));
        return defaultForParentsArticles;
      }
    }
    // If no stored data, save defaults and return them
    localStorage.setItem("eacsl_for_parents", JSON.stringify(defaultForParentsArticles));
    return defaultForParentsArticles;
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

// Initialize localStorage with default data if empty
export const initializeData = () => {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem("eacsl_courses")) {
    localStorage.setItem("eacsl_courses", JSON.stringify(defaultCourses));
  }

  if (!localStorage.getItem("eacsl_members")) {
    localStorage.setItem("eacsl_members", JSON.stringify(defaultMembers));
  }

  // Initialize events - create default upcoming event if none exists
  const existingEvents = eventsManager.getAll();
  if (
    existingEvents.upcoming.length === 0 &&
    existingEvents.past.length === 0
  ) {
    // No events exist, create default upcoming event
    const defaultEvent = getDefaultEvent();
    defaultEvent.id = 1;
    eventsManager.saveAll({
      upcoming: [defaultEvent],
      past: [],
    });
    console.log("Initialized default upcoming event");
  }

  // Initialize articles - create default articles if none exist
  if (!localStorage.getItem("eacsl_articles")) {
    localStorage.setItem("eacsl_articles", JSON.stringify(defaultArticles));
    console.log("Initialized default articles");
  }

  // Initialize therapy programs - create default programs if none exist
  if (!localStorage.getItem("eacsl_therapy_programs")) {
    localStorage.setItem("eacsl_therapy_programs", JSON.stringify(defaultTherapyPrograms));
    console.log("Initialized default therapy programs");
  }

  // Initialize for parents articles - create default articles if none exist
  if (!localStorage.getItem("eacsl_for_parents")) {
    localStorage.setItem("eacsl_for_parents", JSON.stringify(defaultForParentsArticles));
    console.log("Initialized default for parents articles");
  }
};
