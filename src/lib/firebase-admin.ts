import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

let adminApp: App;

if (!getApps().length) {
  if (serviceAccount) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // Fallback for environments where the service account isn't set,
    // like client-side rendering or local dev without the env var.
    // Firebase Admin SDK will try to use Application Default Credentials.
    console.warn("Firebase Admin SDK Service Account not found in environment variables. Attempting to use Application Default Credentials.");
    adminApp = initializeApp();
  }
} else {
  adminApp = getApp();
}

export { adminApp };
