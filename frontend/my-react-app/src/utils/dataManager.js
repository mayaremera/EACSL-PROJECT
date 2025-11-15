// Data management utilities for CRUD operations
// This can be easily replaced with API calls later
import { courses as defaultCourses } from '../data/courses';
import { members as defaultMembers } from '../data/members';
import { membersService } from '../services/membersService';

// Courses Management
export const coursesManager = {
  // Get all courses (from localStorage or default data)
  getAll: () => {
    if (typeof window === 'undefined') return defaultCourses;
    const stored = localStorage.getItem('eacsl_courses');
    if (stored) {
      return JSON.parse(stored);
    }
    return defaultCourses;
  },

  // Save courses to localStorage
  saveAll: (courses) => {
    localStorage.setItem('eacsl_courses', JSON.stringify(courses));
    // Also update the module (for immediate reflection)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('coursesUpdated', { detail: courses }));
    }
  },

  // Add new course
  add: (course) => {
    const courses = coursesManager.getAll();
    const newCourse = {
      ...course,
      id: courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1
    };
    const updated = [...courses, newCourse];
    coursesManager.saveAll(updated);
    return newCourse;
  },

  // Update course
  update: (id, updatedCourse) => {
    const courses = coursesManager.getAll();
    const index = courses.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    const updated = [...courses];
    updated[index] = { ...updatedCourse, id };
    coursesManager.saveAll(updated);
    return updated[index];
  },

  // Delete course
  delete: (id) => {
    const courses = coursesManager.getAll();
    const filtered = courses.filter(c => c.id !== id);
    coursesManager.saveAll(filtered);
    return true;
  }
};

// Members Management
export const membersManager = {
  // Get all members (from localStorage or default data)
  getAll: () => {
    if (typeof window === 'undefined') return defaultMembers;
    const stored = localStorage.getItem('eacsl_members');
    if (stored) {
      const members = JSON.parse(stored);
      // Ensure all members have isActive field (migrate old data)
      // IMPORTANT: Preserve false values - only add isActive if it doesn't exist
      const normalizedMembers = members.map(m => {
        if (m.hasOwnProperty('isActive')) {
          // Property exists, preserve its value (false stays false, true stays true)
          return {
            ...m,
            isActive: Boolean(m.isActive)
          };
        } else {
          // Property doesn't exist, default to true (migration for old data)
          return {
            ...m,
            isActive: true
          };
        }
      });
      
      // Check if any member was missing isActive and save normalized data back
      const needsMigration = members.some(m => !m.hasOwnProperty('isActive'));
      if (needsMigration) {
        membersManager.saveAll(normalizedMembers);
      }
      
      return normalizedMembers;
    }
    return defaultMembers;
  },

  // Save members to localStorage
  saveAll: (members) => {
    localStorage.setItem('eacsl_members', JSON.stringify(members));
    // Also update the module (for immediate reflection)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('membersUpdated', { detail: members }));
    }
  },

  // Add new member (syncs with Supabase)
  add: async (member) => {
    console.log('membersManager.add() called with member:', member);
    const members = membersManager.getAll();
    const tempId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
    const newMember = {
      ...member,
      id: tempId,
      isActive: member.isActive !== undefined ? member.isActive : true
    };
    
    console.log('Creating member with tempId:', tempId, 'Member data:', newMember);
    
    // Save to local storage first for immediate UI update
    const updated = [...members, newMember];
    membersManager.saveAll(updated);
    console.log('Member saved to localStorage. Total members now:', updated.length);
    
    // Verify it was saved
    const verifySave = membersManager.getAll();
    const foundMember = verifySave.find(m => m.id === tempId);
    if (foundMember) {
      console.log('Member verified in localStorage after save:', foundMember);
    } else {
      console.error('ERROR: Member not found in localStorage immediately after save!');
    }
    
    // Sync with Supabase (await to ensure it completes)
    try {
      console.log('Attempting to sync member to Supabase...');
      const { data, error } = await membersService.add(newMember);
      if (data && !error) {
        console.log('Member successfully synced to Supabase:', data);
        // Update local member with Supabase ID if different
        const localMembers = membersManager.getAll();
        const index = localMembers.findIndex(m => m.id === tempId);
        if (index !== -1) {
          localMembers[index] = { ...data, id: data.id || tempId };
          membersManager.saveAll(localMembers);
          console.log('Local member updated with Supabase ID');
        }
        return data;
      } else if (error) {
        console.warn('Failed to sync member to Supabase:', error);
        console.log('Returning local member despite Supabase sync failure');
        // Still return the local member even if Supabase sync fails
        return newMember;
      }
    } catch (err) {
      console.error('Exception syncing member to Supabase:', err);
      console.log('Returning local member despite exception');
      // Still return the local member even if Supabase sync fails
      return newMember;
    }
    
    console.log('Returning new member:', newMember);
    return newMember;
  },

  // Update member (syncs with Supabase)
  update: async (id, updatedMember) => {
    const members = membersManager.getAll();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return null;
    
    const updated = [...members];
    // IMPORTANT: Preserve exact isActive value from updatedMember if provided
    // If not provided, keep existing value (don't default to true)
    const isActiveValue = updatedMember.hasOwnProperty('isActive')
      ? Boolean(updatedMember.isActive) // Use the value from form (can be false or true)
      : (members[index].hasOwnProperty('isActive') 
          ? Boolean(members[index].isActive) 
          : true); // Only default to true if never set
    
    // Explicitly set all fields to ensure nothing is lost
    updated[index] = { 
      id, // Preserve ID
      supabaseUserId: members[index].supabaseUserId || updatedMember.supabaseUserId || undefined, // Preserve Supabase user ID link
      name: updatedMember.name || '',
      role: updatedMember.role || 'Member',
      nationality: updatedMember.nationality || 'Egyptian',
      flagCode: updatedMember.flagCode || 'eg',
      description: updatedMember.description || '',
      fullDescription: updatedMember.fullDescription || '',
      email: updatedMember.email || '',
      membershipDate: updatedMember.membershipDate || '',
      isActive: isActiveValue, // Use the preserved value
      activeTill: updatedMember.activeTill || '',
      certificates: updatedMember.certificates || [],
      phone: updatedMember.phone || '',
      location: updatedMember.location || '',
      website: updatedMember.website || '',
      linkedin: updatedMember.linkedin || '',
      image: updatedMember.image || ''
    };
    
    // Save to local storage first for immediate UI update
    membersManager.saveAll(updated);
    
    // Sync with Supabase (async, don't block)
    membersService.update(id, updated[index]).then(({ error }) => {
      if (error) {
        console.warn('Failed to sync member update to Supabase:', error);
      }
    }).catch(err => {
      console.warn('Exception syncing member update to Supabase:', err);
    });
    
    return updated[index];
  },

  // Delete member (syncs with Supabase)
  delete: async (id) => {
    const members = membersManager.getAll();
    const filtered = members.filter(m => m.id !== id);
    
    // Save to local storage first for immediate UI update
    membersManager.saveAll(filtered);
    
    // Sync with Supabase (async, don't block)
    membersService.delete(id).then(({ error }) => {
      if (error) {
        console.warn('Failed to sync member deletion to Supabase:', error);
        // If Supabase delete fails, we could restore from local storage
        // But for now, we'll keep the local deletion
      }
    }).catch(err => {
      console.warn('Exception syncing member deletion to Supabase:', err);
    });
    
    return true;
  },

  // Fetch members from Supabase and sync with local storage
  syncFromSupabase: async () => {
    try {
      const { data, error } = await membersService.getAll();
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'TABLE_NOT_FOUND' || error.message?.includes('Table does not exist')) {
          console.warn('Members table does not exist in Supabase. Please create it using the SQL script from SUPABASE_SETUP.md');
          return { 
            synced: false, 
            error: {
              ...error,
              userMessage: 'Members table does not exist. Please create it in Supabase first. Check SUPABASE_SETUP.md for instructions.'
            }
          };
        }
        console.warn('Failed to fetch members from Supabase:', error);
        return { synced: false, error };
      }
      
      if (data && data.length > 0) {
        // Map Supabase members to local format
        const supabaseMembers = data.map(m => membersService.mapSupabaseToLocal(m));
        
        // Get existing local members
        const localMembers = membersManager.getAll();
        
        // Merge: Keep local members that aren't in Supabase (by supabaseUserId or email)
        // and update/add Supabase members
        const mergedMembers = [...localMembers];
        
        supabaseMembers.forEach(supabaseMember => {
          // Find existing member by supabaseUserId or email
          const existingIndex = mergedMembers.findIndex(
            m => (m.supabaseUserId && m.supabaseUserId === supabaseMember.supabaseUserId) ||
                 (m.email && m.email === supabaseMember.email && supabaseMember.email)
          );
          
          if (existingIndex >= 0) {
            // Update existing member with Supabase data (prefer Supabase data)
            mergedMembers[existingIndex] = supabaseMember;
          } else {
            // Add new member from Supabase
            mergedMembers.push(supabaseMember);
          }
        });
        
        // Remove duplicates (keep the one with supabaseUserId if both exist)
        const uniqueMembers = [];
        const seen = new Set();
        mergedMembers.forEach(member => {
          const key = member.supabaseUserId || member.email;
          if (key && !seen.has(key)) {
            seen.add(key);
            uniqueMembers.push(member);
          } else if (!key) {
            // Members without supabaseUserId or email are kept (shouldn't happen, but safe)
            uniqueMembers.push(member);
          }
        });
        
        membersManager.saveAll(uniqueMembers);
        return { synced: true, count: supabaseMembers.length, error: null };
      }
      
      // If Supabase has no members, keep local members (don't clear them)
      return { synced: true, count: 0, error: null };
    } catch (err) {
      console.error('Exception syncing from Supabase:', err);
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
          const { data } = await membersService.getByUserId(member.supabaseUserId);
          existingMember = data;
        }
        
        if (!existingMember && member.email) {
          // Try to find by email (we'd need to add this method to membersService)
          // For now, we'll just try to add and handle duplicates
        }

        if (existingMember) {
          // Update existing member
          const { error } = await membersService.update(existingMember.id, member);
          if (!error) {
            syncedCount++;
          } else if (error.code !== 'TABLE_NOT_FOUND') {
            errorCount++;
            console.warn(`Failed to update member ${member.name}:`, error);
          }
        } else {
          // Add new member
          const { error } = await membersService.add(member);
          if (!error) {
            syncedCount++;
          } else if (error.code !== 'TABLE_NOT_FOUND') {
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
        error: errorCount > 0 ? { message: `${errorCount} members failed to sync` } : null 
      };
    } catch (err) {
      console.error('Exception syncing to Supabase:', err);
      return { synced: false, error: err };
    }
  }
};

// Initialize localStorage with default data if empty
export const initializeData = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem('eacsl_courses')) {
    localStorage.setItem('eacsl_courses', JSON.stringify(defaultCourses));
  }
  
  if (!localStorage.getItem('eacsl_members')) {
    localStorage.setItem('eacsl_members', JSON.stringify(defaultMembers));
  }
};

