// Data management utilities for CRUD operations
// This can be easily replaced with API calls later
import { courses as defaultCourses } from '../data/courses';
import { members as defaultMembers } from '../data/members';

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

  // Add new member
  add: (member) => {
    const members = membersManager.getAll();
    const newMember = {
      ...member,
      id: members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1,
      isActive: member.isActive !== undefined ? member.isActive : true
    };
    const updated = [...members, newMember];
    membersManager.saveAll(updated);
    return newMember;
  },

  // Update member
  update: (id, updatedMember) => {
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
    membersManager.saveAll(updated);
    return updated[index];
  },

  // Delete member
  delete: (id) => {
    const members = membersManager.getAll();
    const filtered = members.filter(m => m.id !== id);
    membersManager.saveAll(filtered);
    return true;
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

