import { useState, useEffect } from 'react';
import { membersManager } from '../utils/dataManager';

export const useActiveMembersCount = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const updateCount = () => {
    const members = membersManager.getAll();
    const activeCount = members.filter(m => m.isActive === true).length;
    setCount(activeCount);
    setLoading(false);
  };

  useEffect(() => {
    updateCount();

    // Listen for member updates
    const handleMembersUpdate = () => {
      updateCount();
    };

    window.addEventListener('membersUpdated', handleMembersUpdate);

    return () => {
      window.removeEventListener('membersUpdated', handleMembersUpdate);
    };
  }, []);

  return { count, loading, refresh: updateCount };
};

