import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getDbInstance } from './firebaseConfig';
import type { User } from './types';

export const createUserProfile = async (
  uid: string,
  email: string,
  displayName?: string,
): Promise<void> => {
  const db = getDbInstance();
  const userRef = doc(db, 'users', uid);

  await setDoc(userRef, {
    uid,
    email: email.trim().toLowerCase(),
    displayName: displayName ?? null,
    createdAt: serverTimestamp(),
  });
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const db = getDbInstance();
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) return null;

  const data = userDoc.data();

  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName ?? null,
    createdAt: data.createdAt?.toDate(),
  };
};

export const updateUserProfile = async (
  uid: string,
  updates: Partial<Pick<User, 'displayName'>>,
): Promise<void> => {
  const db = getDbInstance();
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { ...updates });
};
