
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

/**
 * VIGILANT FIREBASE CONFIGURATION
 * Using environment API_KEY as primary credential if available.
 */
const firebaseConfig = {
  apiKey: process.env.API_KEY || "AIzaSyPlaceholderKey",
  authDomain: "vigilant-expiry.firebaseapp.com",
  projectId: "vigilant-expiry",
  storageBucket: "vigilant-expiry.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

// Consider configured if the API_KEY is not the placeholder
export const isFirebaseConfigured = 
  firebaseConfig.apiKey !== "AIzaSyPlaceholderKey";

let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  dbInstance = getFirestore(app);
  authInstance = getAuth(app);
} catch (error) {
  console.info("Firebase initialization deferred. Utilizing Local Vault.");
}

export const db = dbInstance;
export const auth = authInstance;
