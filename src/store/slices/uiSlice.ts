import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
}

interface Modal {
  id: string;
  isOpen: boolean;
  title?: string;
  content?: any;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface UIState {
  // Theme
  theme: 'light' | 'dark';
  
  // Loading states
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Notifications
  notifications: Notification[];
  
  // Modals
  modals: Record<string, Modal>;
  
  // Navigation
  sidebarCollapsed: boolean;
  breadcrumbs: Array<{ title: string; path?: string }>;
  
  // Layout
  isMobile: boolean;
  
  // Preferences
  preferences: {
    articlesPerPage: number;
    language: 'en' | 'es' | 'fr';
    autoSave: boolean;
    emailNotifications: boolean;
  };
}

const initialState: UIState = {
  theme: 'light',
  globalLoading: false,
  loadingStates: {},
  notifications: [],
  modals: {},
  sidebarCollapsed: false,
  breadcrumbs: [{ title: 'Dashboard' }],
  isMobile: false,
  preferences: {
    articlesPerPage: 6,
    language: 'en',
    autoSave: true,
    emailNotifications: true,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Loading states
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    
    setLoadingState: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loadingStates[action.payload.key] = action.payload.loading;
    },
    
    clearLoadingState: (state, action: PayloadAction<string>) => {
      delete state.loadingStates[action.payload];
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        duration: 4.5,
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Modals
    openModal: (state, action: PayloadAction<Modal>) => {
      state.modals[action.payload.id] = { ...action.payload, isOpen: true };
    },
    
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].isOpen = false;
      }
    },
    
    removeModal: (state, action: PayloadAction<string>) => {
      delete state.modals[action.payload];
    },
    
    // Navigation
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    setBreadcrumbs: (state, action: PayloadAction<Array<{ title: string; path?: string }>>) => {
      state.breadcrumbs = action.payload;
    },
    
    // Layout
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
    },
    
    // Preferences
    updatePreferences: (state, action: PayloadAction<Partial<UIState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    resetPreferences: (state) => {
      state.preferences = initialState.preferences;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setGlobalLoading,
  setLoadingState,
  clearLoadingState,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  removeModal,
  setSidebarCollapsed,
  toggleSidebar,
  setBreadcrumbs,
  setIsMobile,
  updatePreferences,
  resetPreferences,
} = uiSlice.actions;

export default uiSlice.reducer; 