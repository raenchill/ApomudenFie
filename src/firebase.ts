// src/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // skip if not using in browser
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';
import { connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA0B9GGLGd719hHhy__6WkH0z_5q--xYeg",
  authDomain: "apomudenfie-new.firebaseapp.com",
  projectId: "apomudenfie-new",
  storageBucket: "apomudenfie-new.appspot.com", // fixed!
  messagingSenderId: "931827434358",
  appId: "1:931827434358:web:c7c0070c690f8b4a9e7057",
  measurementId: "G-4GNJJDEZZD"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // optional

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

// If running in dev (Vite) or on localhost/127.0.0.1, connect to Firebase emulators
if (
  typeof window !== 'undefined' &&
  (import.meta.env?.DEV === true ||
    (window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')))
) {
  try {
    // Use the same host as the page (localhost vs 127.0.0.1) to avoid iframe origin issues
    const host = window.location.hostname === 'localhost' ? 'localhost' : '127.0.0.1';
    connectAuthEmulator(auth, `http://${host}:9299`);
    connectFirestoreEmulator(db, host, 8085);
    connectStorageEmulator(storage, host, 9399);
    console.log('Connected to Firebase emulators');
  } catch (e) {
    console.warn('Could not connect to Firebase emulators:', e);
  }
}
