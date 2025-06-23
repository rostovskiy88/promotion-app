import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    UserCredential,
} from 'firebase/auth';
import { auth, facebookProvider, googleProvider } from '../config/firebase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService {
  constructor() {}

  async loginWithGoogle(): Promise<UserCredential> {
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
      await signOut(auth);

      const googleFrames = document.querySelectorAll('iframe[src*="accounts.google.com"]');
      googleFrames.forEach(frame => frame.remove());

      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }

      localStorage.clear();
      sessionStorage.clear();

      document.cookie.split(';').forEach(function (c) {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });

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
