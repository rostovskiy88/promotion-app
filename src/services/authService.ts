import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { store } from '../store';
import { persistor } from '../store';

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    await persistor.purge();
    store.dispatch({ type: 'RESET_STORE' });

    localStorage.clear();

    sessionStorage.clear();

    const googleFrames = document.querySelectorAll('iframe[src*="accounts.google.com"]');
    googleFrames.forEach(frame => frame.remove());

    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }

    document.cookie.split(';').forEach(function (c) {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  } catch (error) {
    console.error('Error during logout:', error);
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
    throw error;
  }
};
