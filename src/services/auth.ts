import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../config/firebase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService {
  constructor() {
    // Initialize any necessary configurations
  }

  async loginWithGoogle(): Promise<UserCredential> {
    // Force Google to show account selection
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
    return signInWithPopup(auth, googleProvider);
  }

  async loginWithFacebook(): Promise<UserCredential> {
    return signInWithPopup(auth, facebookProvider);
  }

  async loginWithEmail(credentials: LoginCredentials): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, credentials.email, credentials.password);
  }

  async register({ email, password }: LoginCredentials): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async logout(): Promise<void> {
    try {
      // Sign out from Firebase
      await signOut(auth);

      // Clear any Google-specific session data
      const googleFrames = document.querySelectorAll('iframe[src*="accounts.google.com"]');
      googleFrames.forEach(frame => frame.remove());

      // Clear any cached credentials
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }

      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear cookies related to authentication
      document.cookie.split(';').forEach(function (c) {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });

      // Reload the page to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  getCurrentUser() {
    return auth.currentUser;
  }
}

export const authService = new AuthService();
