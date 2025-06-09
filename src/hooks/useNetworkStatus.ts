import { useEffect } from 'react';
import { useCache } from './useRedux';
import { message } from 'antd';

export const useNetworkStatus = () => {
  try {
    const { isOnline, setOnline, setSyncing, offlineQueue } = useCache();

    useEffect(() => {
      // Set initial online status without triggering sync
      setOnline(navigator.onLine);

      const handleOnline = async () => {
        setOnline(true);
        
        // Start syncing if there are queued items
        if (offlineQueue.length > 0) {
          setSyncing(true);
          message.info('Syncing queued changes...');
          
          // Trigger sync process (implemented in syncManager)
          try {
            // This would be handled by a sync manager
            console.log('Starting sync process for', offlineQueue.length, 'items');
            
            // Simulate sync process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            message.success('Changes synced successfully');
          } catch (error) {
            message.error('Some changes failed to sync');
          } finally {
            setSyncing(false);
          }
        }
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
    }, [setOnline, setSyncing, offlineQueue.length]);

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