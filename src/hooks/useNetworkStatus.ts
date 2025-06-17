import { useEffect } from 'react';
import { useCache } from './useRedux';
import { message } from 'antd';

export const useNetworkStatus = () => {
  try {
    const { isOnline, setOnline, offlineQueue } = useCache();

    useEffect(() => {
      // Set initial online status without triggering sync
      setOnline(navigator.onLine);

      const handleOnline = async () => {
        setOnline(true);
        // Note: We'll handle syncing in a separate effect that watches for online status changes
      };

      const handleOffline = () => {
        setOnline(false);
        message.warning('You are now offline. Changes will be queued for sync.');
      };

      // Add event listeners
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Cleanup
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);

    // TODO: Add syncing logic here later without causing infinite loops

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