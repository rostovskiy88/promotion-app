import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { onAuthStateChanged } from 'firebase/auth';
import AuthStateListener from './AuthStateListener';
import { setUser, setFirestoreUser } from '../../store/slices/authSlice';

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

// Mock Firebase config
jest.mock('../../config/firebase', () => ({
  auth: {},
}));

// Mock Redux actions
jest.mock('../../store/slices/authSlice', () => ({
  setUser: jest.fn(),
  setFirestoreUser: jest.fn(),
}));

const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>;
const mockSetUser = setUser as jest.MockedFunction<typeof setUser>;
const mockSetFirestoreUser = setFirestoreUser as jest.MockedFunction<typeof setFirestoreUser>;

// Mock Redux store
const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: (state = {}) => state,
    },
  });
};

// Mock Firebase User object
const createMockUser = (overrides = {}) => ({
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  emailVerified: true,
  phoneNumber: '+1234567890',
  isAnonymous: false,
  providerData: [
    {
      providerId: 'google.com',
      uid: 'google-uid-123',
      displayName: 'Test User',
      email: 'test@example.com',
      phoneNumber: '+1234567890',
      photoURL: 'https://example.com/photo.jpg',
    },
  ],
  ...overrides,
});

describe('AuthStateListener Component', () => {
  let mockStore: ReturnType<typeof createMockStore>;
  let mockUnsubscribe: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStore = createMockStore();
    mockUnsubscribe = jest.fn();
    
    // Mock onAuthStateChanged to return unsubscribe function
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      // Store the callback for manual triggering in tests
      (mockOnAuthStateChanged as any).lastCallback = callback;
      return mockUnsubscribe;
    });

    // Mock Redux action creators to return action objects
    mockSetUser.mockImplementation((payload) => ({ type: 'auth/setUser', payload }));
    mockSetFirestoreUser.mockImplementation((payload) => ({ type: 'auth/setFirestoreUser', payload }));
  });

  const renderComponent = () => {
    return render(
      <Provider store={mockStore}>
        <AuthStateListener />
      </Provider>
    );
  };

  describe('Component Lifecycle', () => {
    it('renders without crashing and returns null', () => {
      const { container } = renderComponent();
      
      // Component should render nothing (returns null)
      expect(container.firstChild).toBeNull();
    });

    it('sets up auth state listener on mount', () => {
      renderComponent();

      expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
      expect(mockOnAuthStateChanged).toHaveBeenCalledWith({}, expect.any(Function));
    });

    it('cleans up auth state listener on unmount', () => {
      const { unmount } = renderComponent();

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auth State Changes', () => {
    it('dispatches setUser when user logs in', () => {
      const mockUser = createMockUser();
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

      renderComponent();

      // Manually trigger the auth state change with a user
      const callback = (mockOnAuthStateChanged as any).lastCallback;
      callback(mockUser);

      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'auth/setUser',
        payload: {
          uid: 'test-uid-123',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: 'https://example.com/photo.jpg',
          emailVerified: true,
          phoneNumber: '+1234567890',
          isAnonymous: false,
          providerData: [
            {
              providerId: 'google.com',
              uid: 'google-uid-123',
              displayName: 'Test User',
              email: 'test@example.com',
              phoneNumber: '+1234567890',
              photoURL: 'https://example.com/photo.jpg',
            },
          ],
        },
      });
    });

    it('dispatches setUser and setFirestoreUser with null when user logs out', () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

      renderComponent();

      // Manually trigger the auth state change with null (logout)
      const callback = (mockOnAuthStateChanged as any).lastCallback;
      callback(null);

      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'auth/setUser',
        payload: null,
      });

      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'auth/setFirestoreUser',
        payload: null,
      });
    });
  });

  describe('User Serialization', () => {
    it('correctly serializes user with all properties', () => {
      const mockUser = createMockUser();
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

      renderComponent();

      const callback = (mockOnAuthStateChanged as any).lastCallback;
      callback(mockUser);

      const dispatchCall = dispatchSpy.mock.calls.find(call => 
        call[0].type === 'auth/setUser' && call[0].payload !== null
      );

      expect(dispatchCall).toBeDefined();
      expect(dispatchCall![0].payload).toEqual({
        uid: 'test-uid-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: true,
        phoneNumber: '+1234567890',
        isAnonymous: false,
        providerData: [
          {
            providerId: 'google.com',
            uid: 'google-uid-123',
            displayName: 'Test User',
            email: 'test@example.com',
            phoneNumber: '+1234567890',
            photoURL: 'https://example.com/photo.jpg',
          },
        ],
      });
    });

    it('correctly serializes user with null properties', () => {
      const mockUser = createMockUser({
        email: null,
        displayName: null,
        photoURL: null,
        phoneNumber: null,
        providerData: [],
      });
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

      renderComponent();

      const callback = (mockOnAuthStateChanged as any).lastCallback;
      callback(mockUser);

      const dispatchCall = dispatchSpy.mock.calls.find(call => 
        call[0].type === 'auth/setUser' && call[0].payload !== null
      );

      expect(dispatchCall).toBeDefined();
      expect(dispatchCall![0].payload).toEqual({
        uid: 'test-uid-123',
        email: null,
        displayName: null,
        photoURL: null,
        emailVerified: true,
        phoneNumber: null,
        isAnonymous: false,
        providerData: [],
      });
    });

    it('correctly serializes provider data', () => {
      const mockUser = createMockUser({
        providerData: [
          {
            providerId: 'facebook.com',
            uid: 'facebook-uid-456',
            displayName: 'Facebook User',
            email: 'facebook@example.com',
            phoneNumber: null,
            photoURL: null,
          },
          {
            providerId: 'twitter.com',
            uid: 'twitter-uid-789',
            displayName: null,
            email: null,
            phoneNumber: '+0987654321',
            photoURL: 'https://twitter.com/photo.jpg',
          },
        ],
      });
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

      renderComponent();

      const callback = (mockOnAuthStateChanged as any).lastCallback;
      callback(mockUser);

      const dispatchCall = dispatchSpy.mock.calls.find(call => 
        call[0].type === 'auth/setUser' && call[0].payload !== null
      );

      expect(dispatchCall).toBeDefined();
      expect((dispatchCall![0].payload as any).providerData).toEqual([
        {
          providerId: 'facebook.com',
          uid: 'facebook-uid-456',
          displayName: 'Facebook User',
          email: 'facebook@example.com',
          phoneNumber: null,
          photoURL: null,
        },
        {
          providerId: 'twitter.com',
          uid: 'twitter-uid-789',
          displayName: null,
          email: null,
          phoneNumber: '+0987654321',
          photoURL: 'https://twitter.com/photo.jpg',
        },
      ]);
    });
  });

  describe('Multiple Auth State Changes', () => {
    it('handles multiple login/logout cycles', () => {
      const mockUser = createMockUser();
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

      renderComponent();

      const callback = (mockOnAuthStateChanged as any).lastCallback;

      // Login
      callback(mockUser);
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'auth/setUser',
        payload: expect.objectContaining({ uid: 'test-uid-123' }),
      });

      // Logout
      callback(null);
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'auth/setUser',
        payload: null,
      });
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'auth/setFirestoreUser',
        payload: null,
      });

      // Login again with different user
      const newUser = createMockUser({ uid: 'new-uid-456', email: 'new@example.com' });
      callback(newUser);
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'auth/setUser',
        payload: expect.objectContaining({ uid: 'new-uid-456', email: 'new@example.com' }),
      });
    });
  });

  describe('Error Handling', () => {
    it('handles undefined user gracefully', () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

      renderComponent();

      const callback = (mockOnAuthStateChanged as any).lastCallback;
      callback(undefined);

      // Should treat undefined same as null (logout)
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'auth/setUser',
        payload: null,
      });
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'auth/setFirestoreUser',
        payload: null,
      });
    });

    it('handles user with incomplete properties', () => {
      const incompleteUser = {
        uid: 'incomplete-uid',
        email: null,
        displayName: null,
        photoURL: null,
        emailVerified: false,
        phoneNumber: null,
        isAnonymous: true,
        providerData: [], // Empty array instead of missing
      } as any;
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

      renderComponent();

      const callback = (mockOnAuthStateChanged as any).lastCallback;
      
      // Should not throw and handle gracefully
      expect(() => callback(incompleteUser)).not.toThrow();
      
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'auth/setUser',
        payload: expect.objectContaining({ 
          uid: 'incomplete-uid',
          email: null,
          displayName: null,
          photoURL: null,
          emailVerified: false,
          phoneNumber: null,
          isAnonymous: true,
          providerData: []
        }),
      });
    });
  });
}); 