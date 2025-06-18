import { configureStore } from '@reduxjs/toolkit';
import uiReducer, {
  toggleTheme,
  setTheme,
  setLoadingState,
  clearLoadingState,
  openModal,
  closeModal,
  updatePreferences,
  resetPreferences,
} from '../uiSlice';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('uiSlice', () => {
  let store: any;

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();

    // Create a new store for each test
    store = configureStore({
      reducer: {
        ui: uiReducer,
      },
    });
  });

  describe('theme actions', () => {
    it('should toggle theme from light to dark', () => {
      // Initial state should be light
      expect(store.getState().ui.theme).toBe('light');

      store.dispatch(toggleTheme());
      const state = store.getState().ui;
      expect(state.theme).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should toggle theme from dark to light', () => {
      // First set theme to dark
      store.dispatch(setTheme('dark'));
      localStorageMock.setItem.mockClear(); // Clear previous calls

      // Now toggle
      store.dispatch(toggleTheme());
      const state = store.getState().ui;
      expect(state.theme).toBe('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('should set theme to dark', () => {
      store.dispatch(setTheme('dark'));
      const state = store.getState().ui;
      expect(state.theme).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should set theme to light', () => {
      store.dispatch(setTheme('light'));
      const state = store.getState().ui;
      expect(state.theme).toBe('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });

  describe('loading actions', () => {
    it('should set loading state for a key', () => {
      store.dispatch(setLoadingState({ key: 'articles', loading: true }));
      const state = store.getState().ui;
      expect(state.loadingStates.articles).toBe(true);
    });

    it('should clear loading state for a key', () => {
      // First set loading
      store.dispatch(setLoadingState({ key: 'articles', loading: true }));
      // Then clear it
      store.dispatch(clearLoadingState('articles'));
      const state = store.getState().ui;
      expect(state.loadingStates.articles).toBeUndefined();
    });

    it('should handle multiple loading states', () => {
      store.dispatch(setLoadingState({ key: 'articles', loading: true }));
      store.dispatch(setLoadingState({ key: 'users', loading: true }));
      store.dispatch(setLoadingState({ key: 'profile', loading: true }));

      const state = store.getState().ui;
      expect(state.loadingStates.articles).toBe(true);
      expect(state.loadingStates.users).toBe(true);
      expect(state.loadingStates.profile).toBe(true);
    });

    it('should clear specific loading state without affecting others', () => {
      store.dispatch(setLoadingState({ key: 'articles', loading: true }));
      store.dispatch(setLoadingState({ key: 'users', loading: true }));
      store.dispatch(clearLoadingState('articles'));

      const state = store.getState().ui;
      expect(state.loadingStates.articles).toBeUndefined();
      expect(state.loadingStates.users).toBe(true);
    });
  });

  describe('modal actions', () => {
    it('should open a modal', () => {
      const modal = { id: 'testModal', isOpen: true, title: 'Test Modal' };
      store.dispatch(openModal(modal));

      const state = store.getState().ui;
      expect(state.modals.testModal).toEqual(modal);
    });

    it('should close a modal', () => {
      // First open modal
      const modal = { id: 'testModal', isOpen: true, title: 'Test Modal' };
      store.dispatch(openModal(modal));
      // Then close it
      store.dispatch(closeModal('testModal'));

      const state = store.getState().ui;
      expect(state.modals.testModal.isOpen).toBe(false);
    });

    it('should handle multiple modals', () => {
      const modal1 = { id: 'modal1', isOpen: true, title: 'Modal 1' };
      const modal2 = { id: 'modal2', isOpen: true, title: 'Modal 2' };
      store.dispatch(openModal(modal1));
      store.dispatch(openModal(modal2));

      const state = store.getState().ui;
      expect(state.modals.modal1.isOpen).toBe(true);
      expect(state.modals.modal2.isOpen).toBe(true);
    });
  });

  describe('preferences actions', () => {
    it('should update preferences', () => {
      const newPreferences = {
        language: 'es' as const,
        emailNotifications: false,
      };
      store.dispatch(updatePreferences(newPreferences));

      const state = store.getState().ui;
      expect(state.preferences).toEqual({
        articlesPerPage: 6,
        language: 'es',
        autoSave: true,
        emailNotifications: false,
      });
    });

    it('should partially update preferences', () => {
      store.dispatch(updatePreferences({ emailNotifications: false }));

      const state = store.getState().ui;
      expect(state.preferences).toEqual({
        articlesPerPage: 6,
        language: 'en',
        autoSave: true,
        emailNotifications: false,
      });
    });

    it('should reset preferences', () => {
      // First modify preferences
      store.dispatch(updatePreferences({ language: 'es', emailNotifications: false }));
      // Then reset
      store.dispatch(resetPreferences());

      const state = store.getState().ui;
      expect(state.preferences).toEqual({
        articlesPerPage: 6,
        language: 'en',
        autoSave: true,
        emailNotifications: true,
      });
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple theme toggles', () => {
      // Start with light theme
      expect(store.getState().ui.theme).toBe('light');

      // Toggle to dark
      store.dispatch(toggleTheme());
      expect(store.getState().ui.theme).toBe('dark');

      // Toggle back to light
      store.dispatch(toggleTheme());
      expect(store.getState().ui.theme).toBe('light');

      // Toggle to dark again
      store.dispatch(toggleTheme());
      expect(store.getState().ui.theme).toBe('dark');
    });

    it('should maintain loading states independently', () => {
      store.dispatch(setLoadingState({ key: 'articles', loading: true }));
      store.dispatch(setLoadingState({ key: 'users', loading: true }));
      store.dispatch(setLoadingState({ key: 'profile', loading: true }));

      // Clear one loading state
      store.dispatch(clearLoadingState('users'));

      const state = store.getState().ui;
      expect(state.loadingStates.articles).toBe(true);
      expect(state.loadingStates.users).toBeUndefined();
      expect(state.loadingStates.profile).toBe(true);
    });

    it('should handle modal and loading state interactions', () => {
      store.dispatch(setLoadingState({ key: 'modalContent', loading: true }));
      store.dispatch(openModal({ id: 'loadingModal', isOpen: true, title: 'Loading Modal' }));

      const state = store.getState().ui;
      expect(state.loadingStates.modalContent).toBe(true);
      expect(state.modals.loadingModal.isOpen).toBe(true);
      expect(state.modals.loadingModal.title).toBe('Loading Modal');
    });
  });
});
