import { useEffect } from 'react';
import {
  coursesManager,
  membersManager,
  eventsManager,
  articlesManager,
  therapyProgramsManager,
  forParentsManager,
} from '../utils/dataManager';

/**
 * App-wide Supabase realtime subscriptions.
 * On DB changes, each manager refetches and dispatches *Updated window events
 * so open tabs and public pages stay in sync without full page reloads.
 */
export default function RealtimeSync() {
  useEffect(() => {
    const unsubscribers = [
      coursesManager.subscribe(() => {}),
      membersManager.subscribe(() => {}),
      eventsManager.subscribe(() => {}),
      articlesManager.subscribe(() => {}),
      therapyProgramsManager.subscribe(() => {}),
      forParentsManager.subscribe(() => {}),
    ];

    return () => {
      unsubscribers.forEach((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
      coursesManager.unsubscribe();
      membersManager.unsubscribe();
      eventsManager.unsubscribe();
      articlesManager.unsubscribe();
      therapyProgramsManager.unsubscribe();
      forParentsManager.unsubscribe();
    };
  }, []);

  return null;
}
