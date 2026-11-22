/**
 * Script: set-admin-claims.js
 * Sets server-controlled custom claims and verified email for ZenSolve administrator.
 * Usage: node scripts/set-admin-claims.js [email]
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const targetEmail = process.argv[2] || 'admin@zensolve.in';

if (!admin.apps.length) {
  let credential = null;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const parsed = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8'));
      credential = admin.credential.cert(parsed);
    } catch {
      try {
        credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
      } catch (e) {
        console.warn('Could not parse FIREBASE_SERVICE_ACCOUNT:', e.message);
      }
    }
  }

  admin.initializeApp({
    credential: credential || admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || 'zensolve-info',
  });
}

async function setAdminClaims() {
  console.log(`Setting administrative custom claims for: ${targetEmail}...`);

  try {
    const user = await admin.auth().getUserByEmail(targetEmail);
    console.log(`Found user: ${user.uid} (${user.email})`);

    // 1. Enforce verified email
    if (!user.emailVerified) {
      await admin.auth().updateUser(user.uid, { emailVerified: true });
      console.log('✓ Marked user email as verified.');
    }

    // 2. Set custom claims (admin: true)
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
      role: 'admin',
      updatedAt: Date.now(),
    });
    console.log('✓ Successfully assigned custom claims: { admin: true, role: "admin" }');

    // 3. Update Firestore user document
    const db = admin.firestore();
    await db.collection('users').doc(user.uid).set(
      {
        role: 'admin',
        emailVerified: true,
        claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log('✓ Updated Firestore user profile.');

    console.log('\nSUCCESS: Administrative claims assigned. Please log out and back in to refresh token claims.');
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`ERROR: User ${targetEmail} not found in Firebase Authentication.`);
      console.log('Please register or initialize this account first via the portal.');
    } else {
      console.error('ERROR assigning admin claims:', error);
    }
    process.exit(1);
  }
}

setAdminClaims();
