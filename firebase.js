import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:demo',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-DEMO123',
  // RTDB URL fallback: the Electron desktop build compiles without
  // NEXT_PUBLIC_FIREBASE_DATABASE_URL, which left databaseURL empty and made Firebase
  // RTDB fatally fail to init ("Cannot parse Firebase url") — so NO realtime/auto-print
  // in the desktop app (live orders only appeared after a manual refresh). This URL is a
  // public client value (already inlined in the bundle), so a hardcoded fallback is safe
  // and guarantees RTDB initializes even when the env var is absent.
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://ascendant-idea-443107-f8-default-rtdb.asia-southeast1.firebasedatabase.app'
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
         process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your_api_key_here';
};

let app, auth, database;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  // Create mock auth object for fallback
  auth = {
    currentUser: null,
    signInWithPhoneNumber: () => Promise.reject(new Error('Firebase not configured')),
    onAuthStateChanged: () => () => {}
  };
  database = null;
}

export { app, auth, database, isFirebaseConfigured };