import { AppError } from '../types/firebase';

export const getAuthErrorMessage = (error: AppError): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect email or password. Please check your credentials and try again.';

      case 'auth/invalid-email':
        return 'Please enter a valid email address.';

      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';

      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';

      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';

      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';

      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';

      case 'auth/operation-not-allowed':
        return 'This sign-in method is not allowed. Please contact support.';

      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled.';

      case 'auth/popup-blocked':
        return 'Popup was blocked by your browser. Please allow popups and try again.';

      default:
        return 'An error occurred during sign-in. Please try again.';
    }
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = error.message;
    if (typeof message === 'string') {
      if (
        message.includes('auth/invalid-credential') ||
        message.includes('auth/wrong-password') ||
        message.includes('auth/user-not-found')
      ) {
        return 'Incorrect email or password. Please check your credentials and try again.';
      }

      if (message.includes('auth/invalid-email')) {
        return 'Please enter a valid email address.';
      }

      return message;
    }
    return 'An unexpected error occurred. Please try again.';
  }

  return 'An unexpected error occurred. Please try again.';
};
