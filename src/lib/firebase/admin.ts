import "server-only";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

export function isAdminConfigured(): boolean {
  const jsonKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (jsonKey && !jsonKey.includes("YOUR-")) return true;

  const email = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const key = process.env.FIREBASE_PRIVATE_KEY?.trim();
  const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)?.trim();

  if (email && key && projectId && !email.includes("YOUR-") && !key.includes("YOUR-")) {
    return true;
  }
  return false;
}

export function getAdminApp(): App | null {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0] as App;
    return adminApp;
  }

  if (!isAdminConfigured()) return null;

  try {
    const jsonKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
    if (jsonKey) {
      const parsed = JSON.parse(jsonKey);
      adminApp = initializeApp({ credential: cert(parsed) });
      return adminApp;
    }

    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
    const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)?.trim();

    if (clientEmail && privateKey && projectId) {
      privateKey = privateKey.replace(/\\n/g, "\n");
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      return adminApp;
    }
  } catch (err) {
    console.error("Failed to initialize Firebase Admin SDK:", err);
    return null;
  }

  return null;
}

export function getAdminAuth(): Auth | null {
  if (adminAuth) return adminAuth;
  const app = getAdminApp();
  if (!app) return null;
  adminAuth = getAuth(app);
  return adminAuth;
}

export function getAdminDb(): Firestore | null {
  if (adminDb) return adminDb;
  const app = getAdminApp();
  if (!app) return null;
  adminDb = getFirestore(app);
  return adminDb;
}
