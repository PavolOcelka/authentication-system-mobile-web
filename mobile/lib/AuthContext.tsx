import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  onAuthStateChange,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  resetPassword as authResetPassword,
} from '@shared/authService';
import type { User, AuthError } from '@shared/types';
import '../config/firebase';

const friendlyMessages: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/requires-recent-login': 'Please sign in again to complete this action.',
};

const toAuthError = (err: unknown): AuthError => {
  const code = (err as { code?: string }).code ?? 'auth/unknown';
  const originalMessage = (err as { message?: string }).message ?? '';
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
