import { useState, useEffect } from 'react';
import { membersManager } from '../utils/dataManager';

export const useActiveMembersCount = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const updateCount = async () => {
    try {
      setLoading(true);
      // getAll() is now async - fetch from Supabase first
      const members = await membersManager.getAll();
      
      // Ensure members is an array
      if (Array.isArray(members)) {
        const activeCount = members.filter(m => m.isActive === true).length;
        setCount(activeCount);
      } else {
        console.warn('Members is not an array:', members);
        setCount(0);
      }
    } catch (error) {
      console.error('Error updating active members count:', error);
      // Fallback to cached data
      try {
        const cachedMembers = membersManager._getAllFromLocalStorage();
        if (Array.isArray(cachedMembers)) {
          const activeCount = cachedMembers.filter(m => m.isActive === true).length;
          setCount(activeCount);
        } else {
          setCount(0);
        }
      } catch (fallbackError) {
        console.error('Error getting cached members:', fallbackError);
        setCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateCount();

    // Listen for member updates
    const handleMembersUpdate = (e) => {
      // If event has detail (members array), use it directly
      if (e.detail && Array.isArray(e.detail)) {
        const activeCount = e.detail.filter(m => m.isActive === true).length;
        setCount(activeCount);
      } else {
        // Otherwise, refresh from source
        updateCount();
      }
    };

    window.addEventListener('membersUpdated', handleMembersUpdate);

    return () => {
      window.removeEventListener('membersUpdated', handleMembersUpdate);
    };
  }, []);

  return { count, loading, refresh: updateCount };
};

