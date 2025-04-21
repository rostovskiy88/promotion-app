import { 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  private googleProvider = new GoogleAuthProvider();
  private facebookProvider = new FacebookAuthProvider();

  async loginWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(auth, this.googleProvider);
  }

  async loginWithFacebook(): Promise<UserCredential> {
    return signInWithPopup(auth, this.facebookProvider);
  }

  async loginWithEmail({ email, password }: LoginCredentials): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async register({ email, password }: LoginCredentials): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async logout(): Promise<void> {
    return signOut(auth);
  }

  getCurrentUser() {
    return auth.currentUser;
  }
}

export const authService = new AuthService(); 