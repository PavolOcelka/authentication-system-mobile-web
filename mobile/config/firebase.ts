import Constants from 'expo-constants';
import { initializeFirebase } from '../../shared/src/firebaseConfig';

// load firebase config from Expo consts, reads from app.config.js from extra section
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || '',
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || '',
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || '',
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || '',
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || '',
  appId: Constants.expoConfig?.extra?.firebaseAppId || '',
};

// validate if all env variables are present
if (!firebaseConfig.apiKey) {
  throw new Error('Missing Firebase configuration. Check your .env.development file and app.config.js');
}

// Initialize Firebase with mobile config
const { auth, db } = initializeFirebase(firebaseConfig);

// Export for use in mobile app
export { auth, db };