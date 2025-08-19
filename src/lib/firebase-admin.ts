import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let adminApp: App;

if (getApps().length === 0) {
  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Initializing with default credentials.", e);
      adminApp = initializeApp();
    }
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not found. Initializing with default credentials.");
    adminApp = initializeApp();
  }
} else {
  adminApp = getApp();
}

export { adminApp };
