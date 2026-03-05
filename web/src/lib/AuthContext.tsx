'use client';

import './firebase';
import { createContext, useEffect, useState, type ReactNode } from 'react';
import { logger } from './logger';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  onAuthStateChange,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  resetPassword as authResetPassword,
} from '@shared/authService';

import type { User, AuthError } from '@shared/types';

const friendlyMessages: Record<string, string> = {
  'auth/email-already-in-use': 'Unable to create account. The email may not be authorized or may already be in use.',
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

const toAuthError = (err: unknown): AuthError => {
  const code = (err as { code?: string }).code ?? 'auth/unknown';
  const originalMessage = (err as { message?: string }).message ?? '';
  // Use our friendly map first, then preserve custom messages (e.g. whitelist),
  // only fall back to generic if the message looks like a raw Firebase string
  const message =
    friendlyMessages[code] ??
    (originalMessage && !originalMessage.startsWith('Firebase:') ? originalMessage : 'Something went wrong. Please try again.');
  return { code, message };
};

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
  actionInProgress: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    logger.info('AuthProvider: subscribing to auth state');
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        logger.info('Auth state changed: user signed in', firebaseUser.uid, firebaseUser.email);
      } else {
        logger.info('Auth state changed: no user (signed out)');
      }
      setUser(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleAuthAction = async (action: () => Promise<unknown>): Promise<boolean> => {
    setError(null);
    setActionInProgress(true);
    try {
      await action();
      return true;
    } catch (err) {
      logger.error('Auth action failed', (err as { code?: string }).code, err);
      setError(toAuthError(err));
      return false;
    } finally {
      setActionInProgress(false);
    }
  };

  const signIn = (email: string, password: string) => {
    logger.info('Attempting sign in', { email });
    return handleAuthAction(() => authSignIn(email, password));
  };

  const signUp = (email: string, password: string) => {
    logger.info('Attempting sign up', { email });
    return handleAuthAction(() => authSignUp(email, password));
  };

  const signOut = () => {
    logger.info('Attempting sign out');
    return handleAuthAction(authSignOut);
  };

  const resetPassword = (email: string) => {
    logger.info('Attempting password reset', { email });
    return handleAuthAction(() => authResetPassword(email));
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut, resetPassword, clearError, actionInProgress }}>
      {children}
    </AuthContext.Provider>
  );
}
