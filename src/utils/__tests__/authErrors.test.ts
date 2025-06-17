import { getAuthErrorMessage } from '../authErrors';
import { AppError } from '../../types/firebase';

describe('getAuthErrorMessage', () => {
  describe('Firebase errors with code', () => {
    it('should return correct message for invalid-credential', () => {
      const error: AppError = { code: 'auth/invalid-credential' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Incorrect email or password. Please check your credentials and try again.');
    });

    it('should return correct message for wrong-password', () => {
      const error: AppError = { code: 'auth/wrong-password' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Incorrect email or password. Please check your credentials and try again.');
    });

    it('should return correct message for user-not-found', () => {
      const error: AppError = { code: 'auth/user-not-found' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Incorrect email or password. Please check your credentials and try again.');
    });

    it('should return correct message for invalid-email', () => {
      const error: AppError = { code: 'auth/invalid-email' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Please enter a valid email address.');
    });

    it('should return correct message for user-disabled', () => {
      const error: AppError = { code: 'auth/user-disabled' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('This account has been disabled. Please contact support.');
    });

    it('should return correct message for too-many-requests', () => {
      const error: AppError = { code: 'auth/too-many-requests' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Too many failed attempts. Please try again later.');
    });

    it('should return correct message for network-request-failed', () => {
      const error: AppError = { code: 'auth/network-request-failed' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Network error. Please check your connection and try again.');
    });

    it('should return correct message for weak-password', () => {
      const error: AppError = { code: 'auth/weak-password' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Password is too weak. Please choose a stronger password.');
    });

    it('should return correct message for email-already-in-use', () => {
      const error: AppError = { code: 'auth/email-already-in-use' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('An account with this email already exists.');
    });

    it('should return correct message for operation-not-allowed', () => {
      const error: AppError = { code: 'auth/operation-not-allowed' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('This sign-in method is not allowed. Please contact support.');
    });

    it('should return correct message for popup-closed-by-user', () => {
      const error: AppError = { code: 'auth/popup-closed-by-user' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Sign-in was cancelled.');
    });

    it('should return correct message for popup-blocked', () => {
      const error: AppError = { code: 'auth/popup-blocked' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Popup was blocked by your browser. Please allow popups and try again.');
    });

    it('should return generic message for unknown Firebase error code', () => {
      const error: AppError = { code: 'auth/unknown-error' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('An error occurred during sign-in. Please try again.');
    });
  });

  describe('Errors with message but no code', () => {
    it('should return appropriate message for invalid-credential in message', () => {
      const error: AppError = { message: 'Firebase: Error (auth/invalid-credential).' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Incorrect email or password. Please check your credentials and try again.');
    });

    it('should return appropriate message for wrong-password in message', () => {
      const error: AppError = { message: 'Firebase: Error (auth/wrong-password).' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Incorrect email or password. Please check your credentials and try again.');
    });

    it('should return appropriate message for user-not-found in message', () => {
      const error: AppError = { message: 'Firebase: Error (auth/user-not-found).' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Incorrect email or password. Please check your credentials and try again.');
    });

    it('should return appropriate message for invalid-email in message', () => {
      const error: AppError = { message: 'Firebase: Error (auth/invalid-email).' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Please enter a valid email address.');
    });

    it('should return original message when no Firebase patterns match', () => {
      const error: AppError = { message: 'Some custom error message' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Some custom error message');
    });

    it('should return original message for network error', () => {
      const error: AppError = { message: 'Network error occurred' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Network error occurred');
    });
  });

  describe('Edge cases', () => {
    it('should handle null error', () => {
      const result = getAuthErrorMessage(null as any);
      expect(result).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle undefined error', () => {
      const result = getAuthErrorMessage(undefined as any);
      expect(result).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle string error', () => {
      const result = getAuthErrorMessage('string error' as any);
      expect(result).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle number error', () => {
      const result = getAuthErrorMessage(123 as any);
      expect(result).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle empty object error', () => {
      const error: AppError = {};
      const result = getAuthErrorMessage(error);
      expect(result).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle error with empty code', () => {
      const error: AppError = { code: '' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('An error occurred during sign-in. Please try again.');
    });

    it('should handle error with empty message', () => {
      const error: AppError = { message: '' };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('');
    });

    it('should handle error with both code and message', () => {
      const error: AppError = { 
        code: 'auth/invalid-email',
        message: 'This should be ignored'
      };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Please enter a valid email address.');
    });

    it('should handle error with non-string code', () => {
      const error: AppError = { code: 123 as any };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('An error occurred during sign-in. Please try again.');
    });

    it('should handle error with non-string message', () => {
      const error: AppError = { message: 123 as any };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle complex error message patterns', () => {
      const error: AppError = { 
        message: 'Multiple patterns: auth/wrong-password and auth/invalid-email'
      };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Incorrect email or password. Please check your credentials and try again.');
    });

    it('should handle case sensitivity in message patterns', () => {
      const error: AppError = { 
        message: 'Error contains AUTH/INVALID-CREDENTIAL in caps'
      };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Error contains AUTH/INVALID-CREDENTIAL in caps');
    });
  });

  describe('Real-world Firebase error scenarios', () => {
    it('should handle typical Firebase auth error structure', () => {
      const error: AppError = {
        code: 'auth/invalid-credential',
        message: 'Firebase: Error (auth/invalid-credential).',
        name: 'FirebaseError'
      };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Incorrect email or password. Please check your credentials and try again.');
    });

    it('should handle Firebase error without code but with descriptive message', () => {
      const error: AppError = {
        message: 'The password is invalid or the user does not have a password. (auth/wrong-password)'
      };
      const result = getAuthErrorMessage(error);
      expect(result).toBe('Incorrect email or password. Please check your credentials and try again.');
    });
  });
}); 