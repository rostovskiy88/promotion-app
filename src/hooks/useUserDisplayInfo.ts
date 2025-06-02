import { useFirestoreUser } from './useFirestoreUser';
import { useAuth } from './useRedux';

/**
 * Custom hook that returns user display information, prioritizing Firestore data over Firebase Auth data
 * This ensures that edited profile information is shown instead of social login info
 */
export const useUserDisplayInfo = () => {
  const auth = useAuth();
  const firestoreUserData = useFirestoreUser();
  
  // Extract the user data and refresh function
  const { refresh, ...firestoreUser } = firestoreUserData;

  // Prioritize Firestore data, fallback to Firebase Auth data
  const displayName = (() => {
    if (firestoreUser?.firstName || firestoreUser?.lastName) {
      // Use Firestore data if available (edited profile)
      const name = `${firestoreUser.firstName || ''} ${firestoreUser.lastName || ''}`.trim();
      return name;
    }
    // Fallback to Firebase Auth data (social login initial data)
    const fallbackName = auth.user?.displayName || auth.user?.email || 'User';
    return fallbackName;
  })();

  const avatarUrl = firestoreUser?.avatarUrl || auth.user?.photoURL || '';
  
  const email = firestoreUser?.email || auth.user?.email || '';

  return {
    displayName,
    avatarUrl,
    email,
    firstName: firestoreUser?.firstName || '',
    lastName: firestoreUser?.lastName || '',
    age: firestoreUser?.age,
    // Include both sources for debugging/advanced use
    firestoreUser,
    authUser: auth.user,
    isAuthenticated: auth.isAuthenticated,
    // Add refresh function to manually update user data
    refresh,
  };
}; 