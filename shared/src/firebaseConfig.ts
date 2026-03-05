import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export const initializeFirebase = (config: FirebaseConfig) => {
  if (getApps().length === 0) {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
  }

  return { auth, db, app };
};

export const getAuthInstance = (): Auth => {
  if (!auth) throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  return auth;
};

export const getDbInstance = (): Firestore => {
  if (!db) throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  return db;
};

export const getAppInstance = (): FirebaseApp => {
  if (!app) throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  return app;
};