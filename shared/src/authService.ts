import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';

import { doc, getDoc } from 'firebase/firestore';
import { getAuthInstance, getDbInstance } from './firebaseConfig'; //typescript will resolve to .ts file
import { createUserProfile } from './userService';
import type { AuthError } from './types';

//whitelist check before allowing sign up
const checkWhitelist = async (email: string): Promise<boolean> => {
  const db = getDbInstance();
  const normalizedEmail = email.trim().toLowerCase();
  const whitelistRef = doc(db, 'whitelist', normalizedEmail);
  const whitelistDoc = await getDoc(whitelistRef);

  if (!whitelistDoc.exists()) return false;

  const data = whitelistDoc.data();
  return data?.approved === true;
};

export const signUp = async (
  email: string,
  password: string,
  options: { requireWhitelist: boolean } = { requireWhitelist: true }
): Promise<FirebaseUser> => {
  const auth = getAuthInstance();

  if (options.requireWhitelist) {
    const isWhitelisted = await checkWhitelist(email);
    if (!isWhitelisted) {
      const error: AuthError = {
        code: 'auth/not-whitelisted',
        message: 'This email is not authorized. Registration is available by invitation only.',
      };
      throw error;
    }
  }

  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await createUserProfile(user.uid, email);

  return user;
};

export const signIn = async (
  email: string,
  password: string,
  options: { requireWhitelist: boolean } = { requireWhitelist: true },
): Promise<FirebaseUser> => {
  const auth = getAuthInstance();
  const { user } = await signInWithEmailAndPassword(auth, email, password);

  if (options.requireWhitelist) {
    const isWhitelisted = await checkWhitelist(email);
    if (!isWhitelisted) {
      await firebaseSignOut(auth);
      const error: AuthError = {
        code: 'auth/not-whitelisted',
        message: 'Your account does not have access to this application.',
      };
      throw error;
    }
  }

  return user;
};

export const signOut = async (): Promise<void> => {
  const auth = getAuthInstance();
  await firebaseSignOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  const auth = getAuthInstance();
  await sendPasswordResetEmail(auth, email);
};

export const onAuthStateChange = (
  callback: (user: FirebaseUser | null) => void,
): (() => void) => {
  const auth = getAuthInstance();
  return onAuthStateChanged(auth, callback);
};
