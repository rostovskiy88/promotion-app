import { useEffect } from 'react';
import { useAuth } from './useRedux';

/**
 * Custom hook that returns user display information, prioritizing Firestore data over Firebase Auth data
 * This ensures that edited profile information is shown instead of social login info
 */
export const useUserDisplayInfo = () => {
  const auth = useAuth();

  // Auto-fetch Firestore user data when auth user is available
  useEffect(() => {
    if (auth.user?.uid && !auth.firestoreUser) {
      auth.refreshFirestoreUser(auth.user.uid);
    }
  }, [auth.user?.uid, auth.firestoreUser, auth.refreshFirestoreUser]);

  // Prioritize Firestore data, fallback to Firebase Auth data
  const displayName = (() => {
    if (auth.firestoreUser?.firstName || auth.firestoreUser?.lastName) {
      // Use Firestore data if available (edited profile)
      const name = `${auth.firestoreUser.firstName || ''} ${auth.firestoreUser.lastName || ''}`.trim();
      return name;
    }
    // Fallback to Firebase Auth data (social login initial data)
    const fallbackName = auth.user?.displayName || auth.user?.email || 'User';
    return fallbackName;
  })();

  const avatarUrl = auth.firestoreUser?.avatarUrl || auth.user?.photoURL || '';

  const email = auth.firestoreUser?.email || auth.user?.email || '';

  const refresh = async () => {
    if (auth.user?.uid) {
      await auth.refreshFirestoreUser(auth.user.uid);
    }
  };

  return {
    displayName,
    avatarUrl,
    email,
    firstName: auth.firestoreUser?.firstName || '',
    lastName: auth.firestoreUser?.lastName || '',
    age: auth.firestoreUser?.age,
    // Include both sources for debugging/advanced use
    firestoreUser: auth.firestoreUser,
    authUser: auth.user,
    isAuthenticated: auth.isAuthenticated,
    // Add refresh function to manually update user data
    refresh,
  };
};
