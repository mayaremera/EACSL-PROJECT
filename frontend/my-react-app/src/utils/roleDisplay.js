/**
 * Utility functions for displaying member roles
 * Maps internal roles (like "Admin") to public-facing display roles
 */

/**
 * Get the display role for a member
 * Priority: 1) displayRole field (if set and not empty), 2) Map Admin to default, 3) Use role as-is
 * @param {string} role - The actual role from database
 * @param {string} displayRole - The display_role field from database (if set)
 * @param {string} defaultAdminDisplay - Default role for Admin (defaults to 'Founder')
 * @returns {string} - The role to display on the website
 */
export const getDisplayRole = (role, displayRole = null, defaultAdminDisplay = 'Founder') => {
  // If displayRole is explicitly set and not empty, use it
  if (displayRole && String(displayRole).trim() !== '') {
    return String(displayRole).trim();
  }
  
  if (!role) return 'Member';
  
  // Map Admin role to a public-facing role
  if (role === 'Admin' || role === 'admin') {
    return defaultAdminDisplay;
  }
  
  // Return the role as-is for all other roles
  return role;
};

/**
 * Check if a role is an admin role (for internal use only)
 * @param {string} role - The role to check
 * @returns {boolean} - True if the role is Admin
 */
export const isAdminRole = (role) => {
  return role === 'Admin' || role === 'admin';
};

