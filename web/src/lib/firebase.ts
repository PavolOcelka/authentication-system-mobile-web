import { initializeFirebase } from '../../../shared/src/firebaseConfig';

// load firebase config from NExt.js env variables, NEXT_PUBLIC_ prefix is required for client-side access
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// validate if all env variables are present
if (!firebaseConfig.apiKey) {
  throw new Error('Missing Firebase configuration. Check your .env.development file.');
}

// Initialize Firebase with web config
const { auth, db } = initializeFirebase(firebaseConfig);

// Export for use in web app
export { auth, db };