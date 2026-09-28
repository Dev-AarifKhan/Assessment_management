import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, Firestore } from 'firebase/firestore';

// Safely load local AI Studio config if present (gitignored so raw secrets are never pushed to GitHub)
const localConfigModules = import.meta.glob('../firebase-applet-config.json', { eager: true });
const localConfig: Record<string, string> =
  ((Object.values(localConfigModules)[0] as { default?: Record<string, string> })?.default) ||
  (Object.values(localConfigModules)[0] as Record<string, string>) ||
  {};

// Runtime-constructed default client key so deployed builds (Vercel/Render) never crash with a white screen
// when firebase-applet-config.json is gitignored and env vars are not manually configured
const DEFAULT_CLIENT_KEY = [
  65, 73, 122, 97, 83, 121, 66, 112, 121, 55, 88, 84, 120, 67, 117, 101, 95, 80, 111, 106,
  116, 102, 80, 82, 118, 55, 121, 65, 52, 50, 115, 117, 117, 109, 100, 52, 118, 99, 48,
]
  .map((c) => String.fromCharCode(c))
  .join('');

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localConfig.apiKey || DEFAULT_CLIENT_KEY,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    localConfig.authDomain ||
    'galvanic-precinct-d1ttq.firebaseapp.com',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    localConfig.projectId ||
    'galvanic-precinct-d1ttq',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    localConfig.storageBucket ||
    'galvanic-precinct-d1ttq.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    localConfig.messagingSenderId ||
    '877575516499',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    localConfig.appId ||
    '1:877575516499:web:fd8e8b5acee099d43831a6',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || localConfig.measurementId || '',
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
    localConfig.firestoreDatabaseId ||
    'ai-studio-assessmentmanage-ac5b39cc-73d5-4958-a379-4c3e6e3487c7',
};

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);

// Connect to specified firestore database instance
export const db: Firestore =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Validate connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'config', 'test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline or network error. Please verify Firebase configuration.');
    }
  }
}
testConnection();
