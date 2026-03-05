import { initializeFirebase, initializeWebAppCheck } from '@shared/firebaseConfig';
import { logger } from './logger';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID || '',
};

if (!firebaseConfig.apiKey) {
  throw new Error('Missing Firebase configuration. Check your .env.development file.');
}

const { auth, db } = initializeFirebase(firebaseConfig);
logger.info('Firebase initialized', { projectId: firebaseConfig.projectId });

if (typeof window !== 'undefined') {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (siteKey) {
    if (process.env.NEXT_PUBLIC_APP_CHECK_DEBUG === 'true') {
      (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    initializeWebAppCheck(siteKey);
    logger.info('App Check initialized with reCAPTCHA Enterprise');
  }
}

export { auth, db };