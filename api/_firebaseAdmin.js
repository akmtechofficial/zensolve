import admin from 'firebase-admin';

// Initialize Firebase Admin Singleton
if (!admin.apps.length) {
  try {
    let credential = null;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const rawJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8');
        const parsed = JSON.parse(rawJson);
        credential = admin.credential.cert(parsed);
      } catch {
        try {
          const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
          credential = admin.credential.cert(parsed);
        } catch (e) {
          console.warn('Failed parsing FIREBASE_SERVICE_ACCOUNT:', e.message);
        }
      }
    }

    admin.initializeApp({
      credential: credential || admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || 'zensolve-info',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'zensolve-info.appspot.com',
    });
  } catch (err) {
    // If running in development without credentials, initialize with project ID
    try {
      admin.initializeApp({
        projectId: 'zensolve-info',
        storageBucket: 'zensolve-info.appspot.com',
      });
    } catch (fallbackErr) {
      console.warn('Firebase Admin init notice:', fallbackErr.message);
    }
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();

/**
 * Extracts and verifies Firebase ID Token from Authorization header
 * @param {object} req - HTTP request object
 * @returns {Promise<object>} Decoded token
 */
export async function verifyAuthToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or malformed Authorization header. Expected Bearer <token>.');
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) {
    throw new Error('Empty bearer token provided.');
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error(`Authentication token verification failed: ${error.message}`);
  }
}

export default admin;
