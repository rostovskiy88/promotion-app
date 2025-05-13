import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { setUser } from '../../store/slices/authSlice';
import { SerializedUser } from '../../types/auth';

// Helper function to serialize Firebase user
const serializeUser = (user: User): SerializedUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  emailVerified: user.emailVerified,
  phoneNumber: user.phoneNumber,
  isAnonymous: user.isAnonymous,
  providerData: user.providerData.map(provider => ({
    providerId: provider.providerId,
    uid: provider.uid,
    displayName: provider.displayName,
    email: provider.email,
    phoneNumber: provider.phoneNumber,
    photoURL: provider.photoURL,
  })),
});

const AuthStateListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Set up the auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      dispatch(setUser(user ? serializeUser(user) : null));
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  return null;
};

export default AuthStateListener; 