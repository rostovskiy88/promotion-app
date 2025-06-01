import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresIn: number; // milliseconds
}

interface CacheState {
  // API cache
  apiCache: Record<string, CacheEntry>;
  
  // Offline data
  offlineQueue: Array<{
    id: string;
    action: string;
    data: any;
    timestamp: number;
    retries: number;
  }>;
  
  // Network status
  isOnline: boolean;
  lastOnlineTime: number;
  
  // Sync status
  isSyncing: boolean;
  syncErrors: string[];
  lastSyncTime: number;
  
  // Performance metrics
  metrics: {
    apiCalls: number;
    cacheHits: number;
    cacheMisses: number;
    avgResponseTime: number;
  };
}

const initialState: CacheState = {
  apiCache: {},
  offlineQueue: [],
  isOnline: true,
  lastOnlineTime: Date.now(),
  isSyncing: false,
  syncErrors: [],
  lastSyncTime: 0,
  metrics: {
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgResponseTime: 0,
  },
};

const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    // API Cache
    setCacheEntry: (state, action: PayloadAction<{ key: string; data: any; expiresIn?: number }>) => {
      const { key, data, expiresIn = 5 * 60 * 1000 } = action.payload; // Default 5 minutes
      state.apiCache[key] = {
        data,
        timestamp: Date.now(),
        expiresIn,
      };
    },
    
    getCacheEntry: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      const entry = state.apiCache[key];
      
      if (entry) {
        const now = Date.now();
        if (now - entry.timestamp < entry.expiresIn) {
          state.metrics.cacheHits++;
          return entry.data;
        } else {
          // Expired, remove it
          delete state.apiCache[key];
          state.metrics.cacheMisses++;
        }
      } else {
        state.metrics.cacheMisses++;
      }
    },
    
    clearCache: (state) => {
      state.apiCache = {};
    },
    
    removeExpiredEntries: (state) => {
      const now = Date.now();
      Object.keys(state.apiCache).forEach(key => {
        const entry = state.apiCache[key];
        if (now - entry.timestamp >= entry.expiresIn) {
          delete state.apiCache[key];
        }
      });
    },
    
    // Offline Queue
    addToOfflineQueue: (state, action: PayloadAction<{ action: string; data: any }>) => {
      const queueItem = {
        id: Date.now().toString(),
        action: action.payload.action,
        data: action.payload.data,
        timestamp: Date.now(),
        retries: 0,
      };
      state.offlineQueue.push(queueItem);
    },
    
    removeFromOfflineQueue: (state, action: PayloadAction<string>) => {
      state.offlineQueue = state.offlineQueue.filter(item => item.id !== action.payload);
    },
    
    incrementRetries: (state, action: PayloadAction<string>) => {
      const item = state.offlineQueue.find(item => item.id === action.payload);
      if (item) {
        item.retries++;
      }
    },
    
    clearOfflineQueue: (state) => {
      state.offlineQueue = [];
    },
    
    // Network Status
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      const wasOffline = !state.isOnline;
      state.isOnline = action.payload;
      
      if (action.payload && wasOffline) {
        state.lastOnlineTime = Date.now();
      }
    },
    
    // Sync Status
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
      if (!action.payload) {
        state.lastSyncTime = Date.now();
      }
    },
    
    addSyncError: (state, action: PayloadAction<string>) => {
      state.syncErrors.push(action.payload);
    },
    
    clearSyncErrors: (state) => {
      state.syncErrors = [];
    },
    
    // Metrics
    incrementApiCalls: (state) => {
      state.metrics.apiCalls++;
    },
    
    updateResponseTime: (state, action: PayloadAction<number>) => {
      const { avgResponseTime, apiCalls } = state.metrics;
      state.metrics.avgResponseTime = (avgResponseTime * (apiCalls - 1) + action.payload) / apiCalls;
    },
    
    resetMetrics: (state) => {
      state.metrics = {
        apiCalls: 0,
        cacheHits: 0,
        cacheMisses: 0,
        avgResponseTime: 0,
      };
    },
  },
});

export const {
  setCacheEntry,
  getCacheEntry,
  clearCache,
  removeExpiredEntries,
  addToOfflineQueue,
  removeFromOfflineQueue,
  incrementRetries,
  clearOfflineQueue,
  setOnlineStatus,
  setSyncing,
  addSyncError,
  clearSyncErrors,
  incrementApiCalls,
  updateResponseTime,
  resetMetrics,
} = cacheSlice.actions;

export default cacheSlice.reducer; 