import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCSoLBdam2o2TQXoBoBPM2OlPD5x-H6Rdw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-study-assistant-for-student.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-study-assistant-for-student",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-study-assistant-for-student.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "231677645613",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:231677645613:web:8e259cb8b54c8d57ca79a4"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Configure Google Sign-In Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider
};
export default app;
