import { createContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChange,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  resetPassword as authResetPassword,
} from '@shared/authService';
import { toAuthError, mapFirebaseUser } from '@shared/authHelpers';
import type { User, AuthError } from '@shared/types';
import '../config/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      setUser(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleAuthAction = async (action: () => Promise<unknown>): Promise<boolean> => {
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      setError(toAuthError(err));
      return false;
    }
  };

  const signIn = (email: string, password: string) =>
    handleAuthAction(() => authSignIn(email, password, { requireWhitelist: false }));

  const signUp = (email: string, password: string) =>
    handleAuthAction(() => authSignUp(email, password, { requireWhitelist: false }));

  const signOut = () => handleAuthAction(authSignOut);

  const resetPassword = (email: string) =>
    handleAuthAction(() => authResetPassword(email));

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut, resetPassword, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}
