'use client';

import './firebase';
import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { logger } from './logger';
import {
  onAuthStateChange,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  resetPassword as authResetPassword,
} from '@shared/authService';
import { toAuthError, mapFirebaseUser } from '@shared/authHelpers';
import type { User, AuthError } from '@shared/types';

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

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut, resetPassword, clearError, actionInProgress }}>
      {children}
    </AuthContext.Provider>
  );
}
