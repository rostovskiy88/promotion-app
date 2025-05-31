// Mock Firebase configuration for testing
export const db = {};
export const auth = {};
export const storage = {};

// Mock Firebase functions
export const initializeApp = jest.fn();
export const getFirestore = jest.fn(() => db);
export const getAuth = jest.fn(() => auth);
export const getStorage = jest.fn(() => storage); 