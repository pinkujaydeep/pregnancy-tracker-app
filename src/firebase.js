import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCaEYkQq4ixwaAuUeOuwFok7o9DOrUrpBo",
  authDomain: "pregnancy-tracker-app-2eebb.firebaseapp.com",
  projectId: "pregnancy-tracker-app-2eebb",
  storageBucket: "pregnancy-tracker-app-2eebb.firebasestorage.app",
  messagingSenderId: "374200934963",
  appId: "1:374200934963:web:68767f2d193d3752593946",
  measurementId: "G-Z2KX4FSW10"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();