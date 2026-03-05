import Constants from 'expo-constants';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeFirebase } from '@shared/firebaseConfig';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || '',
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || '',
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || '',
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || '',
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || '',
  appId: Constants.expoConfig?.extra?.firebaseAppId || '',
};

if (!firebaseConfig.apiKey) {
  throw new Error('Missing Firebase configuration. Check your .env.development file and app.config.js');
}

const { auth, db } = initializeFirebase(firebaseConfig, {
  initAuth: (app) => initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  }),
});

export { auth, db };