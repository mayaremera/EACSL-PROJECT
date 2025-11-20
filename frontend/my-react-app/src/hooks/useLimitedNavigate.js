// src/hooks/useLimitedNavigate.js
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Custom hook that limits browser history to only remember:
 * - Home page (always available)
 * - Previous page (1 back)
 * - Current page
 * 
 * Usage: const navigate = useLimitedNavigate();
 * Then use navigate(path) instead of the regular navigate
 */
export const useLimitedNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const limitedNavigate = useCallback((path, options = {}) => {
    const currentPath = location.pathname;
    
    // If navigating to home, always replace
    if (path === '/') {
      navigate(path, { replace: true, ...options });
      return;
    }
    
    // If we're on home, navigate normally (this allows going back to home)
    if (currentPath === '/') {
      navigate(path, { replace: false, ...options });
      return;
    }
    
    // If we're not on home, replace current entry
    // This keeps history as: Home -> Previous -> Current (replacing Previous)
    navigate(path, { replace: true, ...options });
  }, [navigate, location.pathname]);

  return limitedNavigate;
};

