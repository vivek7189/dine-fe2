import { initializeApp, getApp } from 'firebase/app';
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
  // NOTE: databaseURL is intentionally NOT on this app — see rtdbConfig below.
};

// ── DEDICATED RTDB app (cross-project fix) ───────────────────────────────────────────────────────
// Realtime Database lives in the GCP project `ascendant-idea-443107-f8` (where both backends write
// order/KOT events), but Auth + Firestore live in a DIFFERENT Firebase project (`messages-d8176`).
// A single Firebase app CANNOT span two projects: pointing the messages-d8176 app's databaseURL at
// the ascendant-idea RTDB made every RTDB connection report "Provided authentication credentials are
// invalid" and RECONNECT every ~10s — so live events arrived seconds late or were dropped during a
// reconnect window (looked like "realtime not working / needs refresh"). Fix: initialize a SEPARATE
// Firebase app JUST for RTDB, whose apiKey belongs to the SAME project as its databaseURL, so the
// connection authenticates cleanly and stays stable. Auth/Firestore (the default app) are untouched.
// The apiKey is a public, firebasedatabase-restricted browser key (safe to inline, like any web key).
const rtdbConfig = {
  apiKey: process.env.NEXT_PUBLIC_RTDB_API_KEY || 'AIzaSyC-i48FQbubYnvR-mOk-KrRsd9zqv1VPvo',
  projectId: process.env.NEXT_PUBLIC_RTDB_PROJECT_ID || 'ascendant-idea-443107-f8',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://ascendant-idea-443107-f8-default-rtdb.asia-southeast1.firebasedatabase.app',
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
  // RTDB on its OWN app so apiKey ↔ databaseURL project match (stable, authenticated connection).
  let rtdbApp;
  try { rtdbApp = getApp('rtdb'); } catch (_) { rtdbApp = initializeApp(rtdbConfig, 'rtdb'); }
  database = getDatabase(rtdbApp);
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
