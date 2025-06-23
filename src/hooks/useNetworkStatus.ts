import { useEffect } from 'react';
import { useCache } from './useRedux';

export const useNetworkStatus = () => {
  const { isOnline, setOnline, offlineQueue } = useCache();

  useEffect(() => {
    try {
      setOnline(navigator.onLine);

      const handleOnline = async () => {
        setOnline(true);
      };

      const handleOffline = () => {
        setOnline(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } catch (error) {
      console.warn('Network status hook failed to initialize:', error);
    }
  }, [setOnline]);

  return {
    isOnline,
    hasQueuedItems: offlineQueue.length > 0,
  };
};
