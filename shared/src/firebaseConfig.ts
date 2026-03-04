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

/**
 * Initialize Firebase with provided configuration
 * This is a factory function that both mobile and web will call
 * 
 * @param config - Firebase project configuration
 * @returns Object containing auth and db instances
 */
export const initializeFirebase = (config: FirebaseConfig) => {
  // Only initialize if not already done
  // This prevents "Firebase already initialized" errors
  if (getApps().length === 0) {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Firebase initialized successfully')
    }
  }
  
  return { auth, db, app };
};

export const getAuthInstance = () => auth;
export const getDbInstance = () => db;
export const getAppInstance = () => app;