
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCMwYHpQJpPGoyQYSbDExiMDgT3v7Y-xjw",
  authDomain: "freshleaf-425c3.firebaseapp.com",
  projectId: "freshleaf-425c3",
  storageBucket: "freshleaf-425c3.firebasestorage.app",
  messagingSenderId: "788536555394",
  appId: "1:788536555394:web:541bce0f597b1adabb419b",
  measurementId: "G-ZFRJ5ZDT5L"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Initialize Firestore with persistent cache to support offline mode and prevent "code=unavailable" errors
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const storage = getStorage(app);
