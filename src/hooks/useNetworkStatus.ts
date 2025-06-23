import { useEffect } from 'react';
import { useCache } from './useRedux';

export const useNetworkStatus = () => {
  try {
    const { isOnline, setOnline, offlineQueue } = useCache();

    useEffect(() => {
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
    }, []);

    return {
      isOnline,
      hasQueuedItems: offlineQueue.length > 0,
    };
  } catch (error) {
    console.warn('Network status hook failed to initialize:', error);
    return {
      isOnline: navigator.onLine,
      hasQueuedItems: false,
    };
  }
};
