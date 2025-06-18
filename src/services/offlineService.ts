// Offline data management service for PWA requirements

export interface OfflineData {
  articles: any[];
  lastFetch: number;
  version: number;
}

const OFFLINE_KEY = 'react-promotion-offline-data';
const OFFLINE_VERSION = 1;

// Save data to localStorage for offline access
export const saveOfflineData = (articles: any[]): void => {
  const data: OfflineData = {
    articles,
    lastFetch: Date.now(),
    version: OFFLINE_VERSION,
  };
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(data));
};

// Get offline data from localStorage
export const getOfflineData = (): OfflineData | null => {
  try {
    const data = localStorage.getItem(OFFLINE_KEY);
    if (!data) return null;

    const parsed: OfflineData = JSON.parse(data);

    // Check if data is still valid (not older than 24 hours)
    const isStale = Date.now() - parsed.lastFetch > 24 * 60 * 60 * 1000;
    if (isStale || parsed.version !== OFFLINE_VERSION) {
      localStorage.removeItem(OFFLINE_KEY);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Error reading offline data:', error);
    return null;
  }
};

// Check if the app is online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Listen for online/offline events
export const setupNetworkListeners = (onOnline: () => void, onOffline: () => void): (() => void) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// Clear offline data
export const clearOfflineData = (): void => {
  localStorage.removeItem(OFFLINE_KEY);
};
