import { createOrGetUser, getUserById, updateUser } from '../userService';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  updateDoc: jest.fn(),
}));

// Mock Firebase config
jest.mock('../../config/firebase', () => ({
  db: {},
}));

describe('userService', () => {
  const mockDb = {};
  const mockUserRef = { id: 'test-uid' };

  beforeEach(() => {
    jest.clearAllMocks();
    (doc as jest.Mock).mockReturnValue(mockUserRef);
    (serverTimestamp as jest.Mock).mockReturnValue('mock-timestamp');
  });

  describe('createOrGetUser', () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'John Doe',
      photoURL: 'https://example.com/photo.jpg',
      age: 25,
    };

    it('should create new user when user does not exist', async () => {
      const mockUserSnap = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockUserSnap);

      const result = await createOrGetUser(mockUser);

      expect(doc).toHaveBeenCalledWith(mockDb, 'users', mockUser.uid);
      expect(getDoc).toHaveBeenCalledWith(mockUserRef);
      expect(setDoc).toHaveBeenCalledWith(mockUserRef, {
        uid: mockUser.uid,
        email: mockUser.email,
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: mockUser.photoURL,
        age: mockUser.age,
        createdAt: 'mock-timestamp',
      });
      expect(result).toEqual({
        uid: mockUser.uid,
        email: mockUser.email,
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: mockUser.photoURL,
        age: mockUser.age,
      });
    });

    it('should create new user with empty displayName', async () => {
      const userWithoutDisplayName = {
        uid: 'test-uid',
        email: 'test@example.com',
      };
      const mockUserSnap = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockUserSnap);

      const result = await createOrGetUser(userWithoutDisplayName);

      expect(setDoc).toHaveBeenCalledWith(mockUserRef, {
        uid: userWithoutDisplayName.uid,
        email: userWithoutDisplayName.email,
        firstName: '',
        lastName: '',
        avatarUrl: '',
        age: null,
        createdAt: 'mock-timestamp',
      });
      expect(result).toEqual({
        uid: userWithoutDisplayName.uid,
        email: userWithoutDisplayName.email,
        firstName: '',
        lastName: '',
        avatarUrl: '',
        age: null,
      });
    });

    it('should handle displayName with single word', async () => {
      const userWithSingleName = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'John',
      };
      const mockUserSnap = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockUserSnap);

      await createOrGetUser(userWithSingleName);

      expect(setDoc).toHaveBeenCalledWith(mockUserRef, {
        uid: userWithSingleName.uid,
        email: userWithSingleName.email,
        firstName: 'John',
        lastName: '',
        avatarUrl: '',
        age: null,
        createdAt: 'mock-timestamp',
      });
    });

    it('should handle displayName with multiple words', async () => {
      const userWithMultipleNames = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'John Michael Doe',
      };
      const mockUserSnap = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockUserSnap);

      await createOrGetUser(userWithMultipleNames);

      expect(setDoc).toHaveBeenCalledWith(mockUserRef, {
        uid: userWithMultipleNames.uid,
        email: userWithMultipleNames.email,
        firstName: 'John',
        lastName: 'Michael Doe',
        avatarUrl: '',
        age: null,
        createdAt: 'mock-timestamp',
      });
    });

    it('should return existing user data when user exists', async () => {
      const existingUserData = {
        uid: 'test-uid',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/photo.jpg',
        age: 30,
      };
      const mockUserSnap = {
        exists: () => true,
        data: () => existingUserData,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockUserSnap);

      const result = await createOrGetUser(mockUser);

      expect(doc).toHaveBeenCalledWith(mockDb, 'users', mockUser.uid);
      expect(getDoc).toHaveBeenCalledWith(mockUserRef);
      expect(setDoc).not.toHaveBeenCalled();
      expect(result).toEqual(existingUserData);
    });

    it('should handle user without age', async () => {
      const userWithoutAge = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'John Doe',
        photoURL: 'https://example.com/photo.jpg',
      };
      const mockUserSnap = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockUserSnap);

      const result = await createOrGetUser(userWithoutAge);

      expect(setDoc).toHaveBeenCalledWith(mockUserRef, {
        uid: userWithoutAge.uid,
        email: userWithoutAge.email,
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: userWithoutAge.photoURL,
        age: null,
        createdAt: 'mock-timestamp',
      });
      expect(result).toEqual({
        uid: userWithoutAge.uid,
        email: userWithoutAge.email,
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: userWithoutAge.photoURL,
        age: null,
      });
    });

    it('should handle user without photoURL', async () => {
      const userWithoutPhoto = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'John Doe',
        age: 25,
      };
      const mockUserSnap = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockUserSnap);

      const result = await createOrGetUser(userWithoutPhoto);

      expect(setDoc).toHaveBeenCalledWith(mockUserRef, {
        uid: userWithoutPhoto.uid,
        email: userWithoutPhoto.email,
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: '',
        age: userWithoutPhoto.age,
        createdAt: 'mock-timestamp',
      });
      expect(result).toEqual({
        uid: userWithoutPhoto.uid,
        email: userWithoutPhoto.email,
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: '',
        age: userWithoutPhoto.age,
      });
    });
  });

  describe('getUserById', () => {
    it('should return user data when user exists', async () => {
      const userData = {
        uid: 'test-uid',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      const mockUserSnap = {
        exists: () => true,
        data: () => userData,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockUserSnap);

      const result = await getUserById('test-uid');

      expect(doc).toHaveBeenCalledWith(mockDb, 'users', 'test-uid');
      expect(getDoc).toHaveBeenCalledWith(mockUserRef);
      expect(result).toEqual(userData);
    });

    it('should return null when user does not exist', async () => {
      const mockUserSnap = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockUserSnap);

      const result = await getUserById('nonexistent-uid');

      expect(doc).toHaveBeenCalledWith(mockDb, 'users', 'nonexistent-uid');
      expect(getDoc).toHaveBeenCalledWith(mockUserRef);
      expect(result).toBeNull();
    });

    it('should handle errors when fetching user', async () => {
      const error = new Error('Firestore error');
      (getDoc as jest.Mock).mockRejectedValue(error);

      await expect(getUserById('test-uid')).rejects.toThrow('Firestore error');
      expect(doc).toHaveBeenCalledWith(mockDb, 'users', 'test-uid');
      expect(getDoc).toHaveBeenCalledWith(mockUserRef);
    });
  });

  describe('updateUser', () => {
    it('should update user data successfully', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        age: 28,
      };
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateUser('test-uid', updateData);

      expect(doc).toHaveBeenCalledWith(mockDb, 'users', 'test-uid');
      expect(updateDoc).toHaveBeenCalledWith(mockUserRef, updateData);
    });

    it('should update user with partial data', async () => {
      const updateData = {
        firstName: 'Jane',
      };
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateUser('test-uid', updateData);

      expect(doc).toHaveBeenCalledWith(mockDb, 'users', 'test-uid');
      expect(updateDoc).toHaveBeenCalledWith(mockUserRef, updateData);
    });

    it('should update user with avatar URL', async () => {
      const updateData = {
        avatarUrl: 'https://example.com/new-avatar.jpg',
      };
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateUser('test-uid', updateData);

      expect(doc).toHaveBeenCalledWith(mockDb, 'users', 'test-uid');
      expect(updateDoc).toHaveBeenCalledWith(mockUserRef, updateData);
    });

    it('should handle errors when updating user', async () => {
      const updateData = { firstName: 'Jane' };
      const error = new Error('Update failed');
      (updateDoc as jest.Mock).mockRejectedValue(error);

      await expect(updateUser('test-uid', updateData)).rejects.toThrow('Update failed');
      expect(doc).toHaveBeenCalledWith(mockDb, 'users', 'test-uid');
      expect(updateDoc).toHaveBeenCalledWith(mockUserRef, updateData);
    });

    it('should update user with empty data', async () => {
      const updateData = {};
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateUser('test-uid', updateData);

      expect(doc).toHaveBeenCalledWith(mockDb, 'users', 'test-uid');
      expect(updateDoc).toHaveBeenCalledWith(mockUserRef, updateData);
    });
  });
});
