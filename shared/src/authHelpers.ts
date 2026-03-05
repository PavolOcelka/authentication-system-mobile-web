import type { User as FirebaseUser } from 'firebase/auth';
import type { User, AuthError } from './types';

export const friendlyMessages: Record<string, string> = {
  'auth/email-already-in-use': 'Unable to create account. The email may not be authorized or may already be in use.',
  'auth/not-whitelisted': 'Unable to create account. The email may not be authorized or may already be in use.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'Invalid email or password.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
  'auth/requires-recent-login': 'Please sign in again to complete this action.',
};

export const toAuthError = (err: unknown): AuthError => {
  const code = (err as { code?: string }).code ?? 'auth/unknown';
  const originalMessage = (err as { message?: string }).message ?? '';
  const message =
    friendlyMessages[code] ??
    (originalMessage && !originalMessage.startsWith('Firebase:') ? originalMessage : 'Something went wrong. Please try again.');
  return { code, message };
};

export const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
});
