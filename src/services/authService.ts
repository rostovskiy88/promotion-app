import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { store } from '../store';
import { persistor } from '../store';

export const logout = async (): Promise<void> => {
  try {
    // 1. Sign out from Firebase Auth
    await signOut(auth);

    // 2. Clear all Redux state including persisted data
    await persistor.purge();

    // 3. Reset Redux store to initial state
    store.dispatch({ type: 'RESET_STORE' });

    // 4. Clear all local storage
    localStorage.clear();

    // 5. Clear all session storage
    sessionStorage.clear();

    // 6. Clear any Google-specific session data
    const googleFrames = document.querySelectorAll('iframe[src*="accounts.google.com"]');
    googleFrames.forEach(frame => frame.remove());

    // 7. Disable Google auto-select if available
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }

    // 8. Clear authentication cookies
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    // 9. Force page reload to ensure completely clean state
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  } catch (error) {
    console.error('Error during logout:', error);
    // Even if there's an error, force a clean state
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
    throw error;
  }
};
