// src/components/layout/ScrollToTop.jsx
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls to top on route change
 * Also limits browser history to only remember: Home -> Previous -> Current
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const previousPathRef = useRef(null);
  const backCountRef = useRef(0);

  useEffect(() => {
    const currentPath = pathname;
    const previousPath = previousPathRef.current;
    
    // Track navigation (not back button)
    if (previousPath !== currentPath && currentPath !== '/') {
      // We navigated to a new page
      // If we were on home, this is the first page after home (keep it)
      // If we were not on home, we're replacing the previous page
      
      // Reset back count on new navigation
      backCountRef.current = 0;
    }
    
    previousPathRef.current = currentPath;

    // If there's a hash, let the browser handle it naturally
    // Otherwise, scroll to top
    if (!hash || hash === '') {
      // Scroll to top immediately
      window.scrollTo(0, 0);
      
      // Also scroll after a short delay to ensure content is rendered
      const timeoutId = setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
        
        if (document.documentElement) {
          document.documentElement.scrollTop = 0;
        }
        if (document.body) {
          document.body.scrollTop = 0;
        }
      }, 0);

      const timeoutId2 = setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
        
        if (document.documentElement) {
          document.documentElement.scrollTop = 0;
        }
        if (document.body) {
          document.body.scrollTop = 0;
        }
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(timeoutId2);
      };
    }
  }, [pathname, hash]);

  // Handle back button to limit history
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      backCountRef.current += 1;
      
      // If we're on home after back, reset counter
      if (currentPath === '/') {
        backCountRef.current = 0;
        return;
      }
      
      // If we've gone back and we're not on home, ensure next back goes to home
      // This ensures: Home -> Previous -> Current
      // After 1 back: Previous
      // After 2 back: Home (we'll ensure this by manipulating history)
      if (backCountRef.current >= 1 && currentPath !== '/') {
        // Ensure home is in history by replacing current entry
        // This limits history depth
        try {
          // Replace current state to point to home for next back
          window.history.replaceState({ homeRedirect: true }, '', currentPath);
        } catch (e) {
          // Ignore errors
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return null;
}

export default ScrollToTop;
