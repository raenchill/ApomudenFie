// src/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // skip if not using in browser

const firebaseConfig = {
  apiKey: "AIzaSyA0B9GGLGd719hHhy__6WkH0z_5q--xYeg",
  authDomain: "aidfidelis.web.app",
  projectId: "apomudenfie-new",
  storageBucket: "apomudenfie-new.appspot.com",
  messagingSenderId: "931827434358",
  appId: "1:931827434358:web:c7c0070c690f8b4a9e7057",
  measurementId: "G-4GNJJDEZZD"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // optional

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
