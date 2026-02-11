
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const fallbackFirebaseConfig = {
  apiKey: 'AIzaSyCMwYHpQJpPGoyQYSbDExiMDgT3v7Y-xjw',
  authDomain: 'freshleaf-425c3.firebaseapp.com',
  projectId: 'freshleaf-425c3',
  storageBucket: 'freshleaf-425c3.firebasestorage.app',
  messagingSenderId: '788536555394',
  appId: '1:788536555394:web:541bce0f597b1adabb419b',
  measurementId: 'G-ZFRJ5ZDT5L'
};

const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || fallbackFirebaseConfig.apiKey,
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || fallbackFirebaseConfig.authDomain,
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || fallbackFirebaseConfig.projectId,
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || fallbackFirebaseConfig.storageBucket,
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || fallbackFirebaseConfig.messagingSenderId,
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || fallbackFirebaseConfig.appId,
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || fallbackFirebaseConfig.measurementId
};

if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.warn('Using fallback Firebase config. Set VITE_FIREBASE_* env vars for production domain/project.');
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Initialize Firestore with persistent cache to support offline mode and prevent "code=unavailable" errors
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const storage = getStorage(app);
