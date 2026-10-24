export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export function getFirebaseConfig(): FirebaseConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID)?.trim();
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim();

  if (!apiKey || !projectId || !appId) return null;

  // Placeholder guard to avoid network attempts when values are unconfigured
  if (
    apiKey.includes("YOUR-") ||
    projectId.includes("YOUR-") ||
    appId.includes("YOUR-") ||
    apiKey === "placeholder"
  ) {
    return null;
  }

  return {
    apiKey,
    authDomain: authDomain || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || `${projectId}.firebasestorage.app`,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId,
  };
}

export const isFirebaseConfigured = (): boolean => getFirebaseConfig() !== null;
