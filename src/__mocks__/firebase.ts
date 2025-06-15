// Mock Firebase configuration for testing
export const db = {};
export const auth = {
  currentUser: {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User'
  }
};
export const storage = {};

// Mock Firebase functions
export const initializeApp = jest.fn();
export const getFirestore = jest.fn(() => db);
export const getAuth = jest.fn(() => auth);
export const getStorage = jest.fn(() => storage);

// Mock Firebase Auth functions
export const updatePassword = jest.fn(() => Promise.resolve());
export const reauthenticateWithCredential = jest.fn(() => Promise.resolve());
export const onAuthStateChanged = jest.fn();
export const EmailAuthProvider = {
  credential: jest.fn(() => ({ providerId: 'password' }))
}; 