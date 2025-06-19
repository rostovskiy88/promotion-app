import { useEffect } from 'react';
import { useAuth } from './useRedux';

export const useUserDisplayInfo = () => {
  const auth = useAuth();

  useEffect(() => {
    if (auth.user?.uid && !auth.firestoreUser) {
      auth.refreshFirestoreUser(auth.user.uid);
    }
  }, [auth.user?.uid, auth.firestoreUser, auth.refreshFirestoreUser]);

  const displayName = (() => {
    if (auth.firestoreUser?.firstName || auth.firestoreUser?.lastName) {
      const name = `${auth.firestoreUser.firstName || ''} ${auth.firestoreUser.lastName || ''}`.trim();
      return name;
    }
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
    firestoreUser: auth.firestoreUser,
    authUser: auth.user,
    isAuthenticated: auth.isAuthenticated,
    refresh,
  };
};
