/**
 * Standalone Automated Security Rules Test Suite
 * Uses @firebase/rules-unit-testing against Firestore Emulator
 * Run with: npx firebase-tools emulators:exec --only firestore "node scripts/test-rules.js"
 */

import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';
import assert from 'assert';

const PROJECT_ID = 'zensolve-security-test';
const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');

let testEnv;
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await testEnv.clearFirestore();
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log(' Starting ZenSolve Automated Security Verification');
  console.log('======================================================\n');

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080,
    },
  });

  // -------------------------------------------------------------
  // TEST GROUP 1: Candidate Isolation & Privilege Escalation
  // -------------------------------------------------------------
  console.log('\n[Group 1: Candidate Isolation & Privilege Escalation (S01, S02, S05)]');

  await test('Candidate A can read and update own profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc('candidate_a').set({
        uid: 'candidate_a',
        role: 'candidate',
        displayName: 'Candidate A',
      });
    });

    const candidateA = testEnv.authenticatedContext('candidate_a');
    const db = candidateA.firestore();

    await assertSucceeds(db.collection('users').doc('candidate_a').get());
    await assertSucceeds(
      db.collection('users').doc('candidate_a').update({
        displayName: 'Candidate A Updated',
      })
    );
  });

  await test('Candidate A CANNOT read Candidate B private profile (S05)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc('candidate_b').set({
        uid: 'candidate_b',
        role: 'candidate',
        phone: '+919999999999',
      });
    });

    const candidateA = testEnv.authenticatedContext('candidate_a');
    const db = candidateA.firestore();

    await assertFails(db.collection('users').doc('candidate_b').get());
  });

  await test('Candidate A CANNOT self-promote to admin role (S01)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc('candidate_a').set({
        uid: 'candidate_a',
        role: 'candidate',
      });
    });

    const candidateA = testEnv.authenticatedContext('candidate_a');
    const db = candidateA.firestore();

    await assertFails(
      db.collection('users').doc('candidate_a').update({
        role: 'admin',
      })
    );
  });

  // -------------------------------------------------------------
  // TEST GROUP 2: Employer Self-Approval Prevention (S01)
  // -------------------------------------------------------------
  console.log('\n[Group 2: Employer Self-Approval & Status Locking (S01)]');

  await test('Employer CANNOT self-approve on account creation (S01)', async () => {
    const employer = testEnv.authenticatedContext('emp_pending');
    const db = employer.firestore();

    await assertFails(
      db.collection('users').doc('emp_pending').set({
        uid: 'emp_pending',
        role: 'company',
        approved: true,
        status: 'approved',
      })
    );
  });

  await test('Employer CANNOT update status to approved or remove suspension (S01)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc('emp_pending').set({
        uid: 'emp_pending',
        role: 'company',
        approved: false,
        status: 'pending',
        suspended: false,
      });
    });

    const employer = testEnv.authenticatedContext('emp_pending');
    const db = employer.firestore();

    await assertFails(
      db.collection('users').doc('emp_pending').update({
        approved: true,
      })
    );

    await assertFails(
      db.collection('users').doc('emp_pending').update({
        status: 'approved',
      })
    );
  });

  // -------------------------------------------------------------
  // TEST GROUP 3: Job Listings & Tenant Boundary (S11, S12)
  // -------------------------------------------------------------
  console.log('\n[Group 3: Job Listings & Moderation Integrity (S11, S12)]');

  await test('Approved Employer A can publish jobs, but CANNOT self-verify (S11)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc('emp_a').set({
        uid: 'emp_a',
        role: 'company',
        approved: true,
        status: 'approved',
        suspended: false,
      });
    });

    const empA = testEnv.authenticatedContext('emp_a');
    const db = empA.firestore();

    // Denied: self-asserting verified: true
    await assertFails(
      db.collection('jobs').doc('job_1').set({
        companyId: 'emp_a',
        position: 'Backend Developer',
        status: 'Active',
        verified: true,
        applicantCount: 0,
      })
    );

    // Allowed: valid job listing with verified: false
    await assertSucceeds(
      db.collection('jobs').doc('job_1').set({
        companyId: 'emp_a',
        position: 'Backend Developer',
        status: 'Active',
        verified: false,
        applicantCount: 0,
      })
    );
  });

  await test('Employer B CANNOT edit or hijack Employer A job listing', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc('emp_a').set({
        uid: 'emp_a',
        role: 'company',
        approved: true,
        status: 'approved',
        suspended: false,
      });
      await adminDb.collection('users').doc('emp_b').set({
        uid: 'emp_b',
        role: 'company',
        approved: true,
        status: 'approved',
        suspended: false,
      });
      await adminDb.collection('jobs').doc('job_a').set({
        companyId: 'emp_a',
        position: 'DevOps Lead',
        status: 'Active',
      });
    });

    const empB = testEnv.authenticatedContext('emp_b');
    const db = empB.firestore();

    await assertFails(
      db.collection('jobs').doc('job_a').update({
        position: 'Hijacked Position',
      })
    );
  });

  // -------------------------------------------------------------
  // TEST GROUP 4: Job Applications & HR Notes Isolation (S04, S06, S07, S08, S09)
  // -------------------------------------------------------------
  console.log('\n[Group 4: Candidate Applications & Protected HR Notes (S04, S06, S07, S08, S09)]');

  await test('Candidate CANNOT apply with forged companyId (S08)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc('cand_1').set({
        uid: 'cand_1',
        role: 'candidate',
      });
      await adminDb.collection('jobs').doc('job_10').set({
        companyId: 'emp_a',
        status: 'Active',
      });
    });

    const cand1 = testEnv.authenticatedContext('cand_1');
    const db = cand1.firestore();

    // Denied: job_10 belongs to emp_a, but candidate passes fake_company
    await assertFails(
      db.collection('jobApplications').doc('app_fake').set({
        userId: 'cand_1',
        jobId: 'job_10',
        companyId: 'fake_company',
        status: 'Applied',
      })
    );
  });

  await test('Candidate CANNOT write internalNotes on root application (S06)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc('cand_1').set({
        uid: 'cand_1',
        role: 'candidate',
      });
      await adminDb.collection('jobs').doc('job_10').set({
        companyId: 'emp_a',
        status: 'Active',
      });
    });

    const cand1 = testEnv.authenticatedContext('cand_1');
    const db = cand1.firestore();

    await assertFails(
      db.collection('jobApplications').doc('app_1').set({
        userId: 'cand_1',
        jobId: 'job_10',
        companyId: 'emp_a',
        status: 'Applied',
        internalNotes: 'Injected note',
      })
    );
  });

  await test('Cross-tenant Application Isolation: Candidate B CANNOT read Candidate A application', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc('cand_1').set({ uid: 'cand_1', role: 'candidate' });
      await adminDb.collection('users').doc('cand_2').set({ uid: 'cand_2', role: 'candidate' });
      await adminDb.collection('users').doc('emp_a').set({ uid: 'emp_a', role: 'company', approved: true, status: 'approved' });
      await adminDb.collection('jobs').doc('job_10').set({ companyId: 'emp_a', status: 'Active' });
      await adminDb.collection('jobApplications').doc('app_real').set({
        userId: 'cand_1',
        jobId: 'job_10',
        companyId: 'emp_a',
        status: 'Applied',
      });
    });

    const cand2 = testEnv.authenticatedContext('cand_2');
    const dbCand2 = cand2.firestore();
    await assertFails(dbCand2.collection('jobApplications').doc('app_real').get());

    const empA = testEnv.authenticatedContext('emp_a');
    const dbEmpA = empA.firestore();
    await assertSucceeds(dbEmpA.collection('jobApplications').doc('app_real').get());
  });

  await test('Suspended Employer CANNOT read candidate applications (S07)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc('emp_suspended').set({
        uid: 'emp_suspended',
        role: 'company',
        approved: true,
        status: 'suspended',
        suspended: true,
      });
      await adminDb.collection('jobApplications').doc('app_susp').set({
        userId: 'cand_1',
        jobId: 'job_s',
        companyId: 'emp_suspended',
        status: 'Applied',
      });
    });

    const suspendedEmp = testEnv.authenticatedContext('emp_suspended');
    const db = suspendedEmp.firestore();

    await assertFails(db.collection('jobApplications').doc('app_susp').get());
  });

  await test('Candidate CANNOT read hrPrivate/notes subcollection (S06)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('users').doc('cand_1').set({ uid: 'cand_1', role: 'candidate' });
      await adminDb.collection('users').doc('emp_a').set({ uid: 'emp_a', role: 'company', approved: true, status: 'approved' });
      await adminDb.collection('jobApplications').doc('app_priv').set({
        userId: 'cand_1',
        jobId: 'job_10',
        companyId: 'emp_a',
        status: 'Applied',
      });
      await adminDb.collection('jobApplications').doc('app_priv').collection('hrPrivate').doc('notes').set({
        internalNotes: 'Confidential salary discussion: Offer 15 LPA max',
      });
    });

    // Target employer reading hrPrivate/notes -> Allowed
    const empA = testEnv.authenticatedContext('emp_a');
    const dbEmp = empA.firestore();
    await assertSucceeds(
      dbEmp.collection('jobApplications').doc('app_priv').collection('hrPrivate').doc('notes').get()
    );

    // Candidate reading hrPrivate/notes -> DENIED! (S06)
    const cand1 = testEnv.authenticatedContext('cand_1');
    const dbCand = cand1.firestore();
    await assertFails(
      dbCand.collection('jobApplications').doc('app_priv').collection('hrPrivate').doc('notes').get()
    );
  });

  // -------------------------------------------------------------
  // TEST GROUP 5: Client-Side Audit Logs Denied (S10)
  // -------------------------------------------------------------
  console.log('\n[Group 5: Audit Log Integrity (S10)]');

  await test('Client-side writes to auditLogs are strictly DENIED (S10)', async () => {
    const user = testEnv.authenticatedContext('any_user');
    const db = user.firestore();

    await assertFails(
      db.collection('auditLogs').doc('forged_log').set({
        action: 'FORGED_EVENT',
      })
    );
  });

  // -------------------------------------------------------------
  // TEST GROUP 6: Super Admin Custom Claims Verification (S02)
  // -------------------------------------------------------------
  console.log('\n[Group 6: Super Admin Claims Verification (S02)]');

  await test('Verified Super-Admin with claims has full authority', async () => {
    const adminCtx = testEnv.authenticatedContext('admin_uid', {
      admin: true,
      email: 'admin@zensolve.in',
      email_verified: true,
    });
    const db = adminCtx.firestore();

    await assertSucceeds(db.collection('auditLogs').doc('log_sample').get());
    await assertSucceeds(
      db.collection('platformSettings').doc('global').set({
        platformName: 'ZenSolve',
      })
    );
  });

  await test('Unverified email with admin address is DENIED admin privileges (S02)', async () => {
    const unverifiedAdmin = testEnv.authenticatedContext('fake_admin', {
      email: 'admin@zensolve.in',
      email_verified: false,
    });
    const db = unverifiedAdmin.firestore();

    await assertFails(db.collection('auditLogs').doc('log_sample').get());
  });

  // Clean up
  await testEnv.cleanup();

  console.log('\n======================================================');
  console.log(` Test Execution Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((e) => {
  console.error('Test execution error:', e);
  process.exit(1);
});
