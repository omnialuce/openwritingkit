// src/lib/firebase-admin.ts
import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (getApps().length === 0) {
  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Initializing with default credentials.", e);
      initializeApp();
    }
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not found. Initializing with default credentials.");
    initializeApp();
  }
}

export const adminApp: App = getApp();
