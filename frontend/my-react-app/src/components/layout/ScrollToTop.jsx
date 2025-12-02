// src/components/layout/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls to top on route change
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
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

  return null;
}

export default ScrollToTop;
