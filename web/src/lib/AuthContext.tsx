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

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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

  useEffect(() => {
    logger.info('AuthProvider: subscribing to auth state');
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        logger.info('Auth state changed: user signed in', { uid: firebaseUser.uid, email: firebaseUser.email });
      } else {
        logger.info('Auth state changed: no user (signed out)');
      }
      setUser(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleAuthAction = async (action: () => Promise<unknown>): Promise<void> => {
    setError(null);
    try {
      await action();
    } catch (err) {
      const authError = err as AuthError;
      logger.error('Auth action failed', { code: authError.code, message: authError.message });
      setError(authError);
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

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}
