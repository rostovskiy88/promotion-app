import { AppError } from '../types/firebase';

export const getAuthErrorMessage = (error: AppError): string => {
  // Check if it's a Firebase error with a code
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
        // For any other Firebase error, return a generic message
        return 'An error occurred during sign-in. Please try again.';
    }
  }
  
  // If it's not a Firebase error or doesn't have a code, check the message
  if (error && typeof error === 'object' && 'message' in error) {
    const message = error.message;
    // Check if the message is actually a string before using string methods
    if (typeof message === 'string') {
      // Check if the message contains Firebase error patterns
      if (message.includes('auth/invalid-credential') || 
          message.includes('auth/wrong-password') ||
          message.includes('auth/user-not-found')) {
        return 'Incorrect email or password. Please check your credentials and try again.';
      }
      
      if (message.includes('auth/invalid-email')) {
        return 'Please enter a valid email address.';
      }
      
      // Return the original message if it doesn't match any Firebase patterns
      return message;
    }
    // If message is not a string, return fallback
    return 'An unexpected error occurred. Please try again.';
  }
  
  // Fallback for any other error format
  return 'An unexpected error occurred. Please try again.';
}; 