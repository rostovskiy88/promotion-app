import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
}; 