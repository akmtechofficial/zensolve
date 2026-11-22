/**
 * Script: migrate-security.js
 * Comprehensive data migration script for ZenSolve platform:
 * 1. S05: Sanitizes and syncs approved companies into publicCompanies collection.
 * 2. S06: Migrates confidential internalNotes from root jobApplications into hrPrivate/notes subcollection.
 * 3. Supports --dry-run (default is dry-run unless --execute is passed) and --backup.
 *
 * Usage:
 *   node scripts/migrate-security.js --dry-run
 *   node scripts/migrate-security.js --execute
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const isDryRun = !process.argv.includes('--execute');
const shouldBackup = process.argv.includes('--backup') || !process.argv.includes('--no-backup');

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

const db = admin.firestore();

async function runMigration() {
  console.log('========================================================');
  console.log(` ZenSolve Security Architecture Migration Tool`);
  console.log(` Mode: ${isDryRun ? 'DRY-RUN (Simulating changes)' : 'LIVE EXECUTION (Writing to database)'}`);
  console.log('========================================================\n');

  const backupData = {
    timestamp: new Date().toISOString(),
    companies: [],
    applications: [],
  };

  // -----------------------------------------------------------------
  // 1. Migrate Public Companies (S05)
  // -----------------------------------------------------------------
  console.log('--- Phase 1: Migrating Approved Companies to publicCompanies ---');
  const usersSnap = await db.collection('users').get();
  let companiesMigrated = 0;

  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data();
    const isCompany = data.role === 'company' || data.role === 'employer';
    const isApproved = data.approved === true || data.status === 'approved';
    const isSuspended = data.suspended === true || data.status === 'suspended';

    if (isCompany && isApproved && !isSuspended) {
      const companyId = userDoc.id;
      const publicPayload = {
        id: companyId,
        companyName: data.companyName || data.displayName || 'Hiring Organization',
        name: data.companyName || data.displayName || 'Hiring Organization',
        logo: data.logo || data.companyLogo || '/zen.jpeg',
        companyLogo: data.logo || data.companyLogo || '/zen.jpeg',
        location: data.location || 'India',
        industry: data.industry || 'Staffing & Manpower',
        companyType: data.companyType || 'Private Limited',
        website: data.website || '',
        about: data.description || data.about || 'Verified hiring partner on ZenSolve.',
        verified: true,
        rating: data.rating || 4.8,
        openRolesCount: 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      backupData.companies.push({ id: companyId, raw: data, public: publicPayload });

      if (isDryRun) {
        console.log(`[DRY-RUN] Would create publicCompanies/${companyId} for "${publicPayload.companyName}"`);
      } else {
        await db.collection('publicCompanies').doc(companyId).set(publicPayload, { merge: true });
        console.log(`[OK] Created/Updated publicCompanies/${companyId}`);
      }
      companiesMigrated++;
    }
  }
  console.log(`Companies to migrate: ${companiesMigrated}\n`);

  // -----------------------------------------------------------------
  // 2. Migrate Internal HR Notes (S06)
  // -----------------------------------------------------------------
  console.log('--- Phase 2: Isolating Internal HR Notes from jobApplications ---');
  const appsSnap = await db.collection('jobApplications').get();
  let notesMigrated = 0;

  for (const appDoc of appsSnap.docs) {
    const appData = appDoc.data();
    if (appData.internalNotes) {
      const appId = appDoc.id;
      backupData.applications.push({
        id: appId,
        internalNotes: appData.internalNotes,
      });

      if (isDryRun) {
        console.log(`[DRY-RUN] Would migrate notes for application ${appId} to hrPrivate/notes`);
      } else {
        // 1. Write to protected hrPrivate subcollection
        await db.collection('jobApplications').doc(appId).collection('hrPrivate').doc('notes').set(
          {
            internalNotes: appData.internalNotes,
            migratedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        // 2. Remove internalNotes from root application document
        await db.collection('jobApplications').doc(appId).update({
          internalNotes: admin.firestore.FieldValue.delete(),
        });
        console.log(`[OK] Migrated and isolated internalNotes for application ${appId}`);
      }
      notesMigrated++;
    }
  }
  console.log(`Applications with internal notes migrated: ${notesMigrated}\n`);

  // -----------------------------------------------------------------
  // 3. Save Backup
  // -----------------------------------------------------------------
  if (shouldBackup) {
    const backupDir = path.resolve('backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const backupFile = path.join(backupDir, `migration_backup_${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`✓ Migration snapshot backed up to: ${backupFile}`);
  }

  console.log('\n========================================================');
  if (isDryRun) {
    console.log('DRY-RUN COMPLETE. No database writes were performed.');
    console.log('To execute live migration, run: node scripts/migrate-security.js --execute');
  } else {
    console.log('LIVE MIGRATION COMPLETE. All security data paths upgraded.');
  }
  console.log('========================================================');
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
