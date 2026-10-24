import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseConfig, isFirebaseConfigured } from "./config";

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

export function getClientApp(): FirebaseApp | null {
  if (appInstance) return appInstance;
  const config = getFirebaseConfig();
  if (!config) return null;

  if (getApps().length > 0) {
    appInstance = getApp();
  } else {
    appInstance = initializeApp(config);
  }
  return appInstance;
}

export function getClientAuth(): Auth | null {
  if (authInstance) return authInstance;
  const app = getClientApp();
  if (!app) return null;
  authInstance = getAuth(app);
  return authInstance;
}

export function getClientDb(): Firestore | null {
  if (dbInstance) return dbInstance;
  const app = getClientApp();
  if (!app) return null;
  dbInstance = getFirestore(app);
  return dbInstance;
}

export { isFirebaseConfigured };
