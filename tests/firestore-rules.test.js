import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';

let testEnv;

const PROJECT_ID = 'zensolve-security-test';
const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

describe('ZenSolve Comprehensive Security Authorization Suite', () => {

  // ---------------------------------------------------------------------------
  // 1. Candidate Isolation & Privilege Escalation (S01, S02, S05)
  // ---------------------------------------------------------------------------
  describe('Phase 1: Candidate Isolation & Profile Rules', () => {
    it('Candidate A can read and update their own profile', async () => {
      const candidateA = testEnv.authenticatedContext('candidate_a');
      const db = candidateA.firestore();

      // Setup initial profile via admin context
      await testEnv.withSecurityRulesDisabled(async (adminDb) => {
        await adminDb.collection('users').doc('candidate_a').set({
          uid: 'candidate_a',
          role: 'candidate',
          displayName: 'Candidate A',
        });
      });

      // Allowed: read own profile
      await assertSucceeds(db.collection('users').doc('candidate_a').get());

      // Allowed: update non-privileged field
      await assertSucceeds(
        db.collection('users').doc('candidate_a').update({
          displayName: 'Candidate A Updated',
        })
      );
    });

    it('Candidate A CANNOT read Candidate B private profile (S05)', async () => {
      const candidateA = testEnv.authenticatedContext('candidate_a');
      const db = candidateA.firestore();

      await testEnv.withSecurityRulesDisabled(async (adminDb) => {
        await adminDb.collection('users').doc('candidate_b').set({
          uid: 'candidate_b',
          role: 'candidate',
          phone: '+919999999999',
        });
      });

      // Denied: cross-user private profile read
      await assertFails(db.collection('users').doc('candidate_b').get());
    });

    it('Candidate A CANNOT self-promote to admin (S01)', async () => {
      const candidateA = testEnv.authenticatedContext('candidate_a');
      const db = candidateA.firestore();

      await testEnv.withSecurityRulesDisabled(async (adminDb) => {
        await adminDb.collection('users').doc('candidate_a').set({
          uid: 'candidate_a',
          role: 'candidate',
        });
      });

      // Denied: modifying role to admin
      await assertFails(
        db.collection('users').doc('candidate_a').update({
          role: 'admin',
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Employer Registration & Self-Approval Prevention (S01)
  // ---------------------------------------------------------------------------
  describe('Phase 2: Employer Self-Approval & Privileged Fields Prevention', () => {
    it('Employer CANNOT self-approve on creation (S01)', async () => {
      const employer = testEnv.authenticatedContext('employer_1');
      const db = employer.firestore();

      // Denied: creating profile with approved: true
      await assertFails(
        db.collection('users').doc('employer_1').set({
          uid: 'employer_1',
          role: 'company',
          approved: true,
          status: 'approved',
        })
      );
    });

    it('Employer CANNOT update profile to approved or unsuspended (S01)', async () => {
      const employer = testEnv.authenticatedContext('employer_1');
      const db = employer.firestore();

      await testEnv.withSecurityRulesDisabled(async (adminDb) => {
        await adminDb.collection('users').doc('employer_1').set({
          uid: 'employer_1',
          role: 'company',
          approved: false,
          status: 'pending',
          suspended: false,
        });
      });

      // Denied: tampering with approved flag
      await assertFails(
        db.collection('users').doc('employer_1').update({
          approved: true,
        })
      );

      // Denied: tampering with status field
      await assertFails(
        db.collection('users').doc('employer_1').update({
          status: 'approved',
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Job Listings & Cross-Tenant Isolation (S11, S12)
  // ---------------------------------------------------------------------------
  describe('Phase 3: Job Listings & Tenant Boundary Enforcement', () => {
    beforeEach(async () => {
      // Setup Approved Employer A and Approved Employer B
      await testEnv.withSecurityRulesDisabled(async (adminDb) => {
        await adminDb.collection('users').doc('employer_a').set({
          uid: 'employer_a',
          role: 'company',
          approved: true,
          status: 'approved',
          suspended: false,
        });
        await adminDb.collection('users').doc('employer_b').set({
          uid: 'employer_b',
          role: 'company',
          approved: true,
          status: 'approved',
          suspended: false,
        });
      });
    });

    it('Approved Employer A can publish jobs, but CANNOT self-verify (S11, S12)', async () => {
      const employerA = testEnv.authenticatedContext('employer_a');
      const db = employerA.firestore();

      // Denied: self-asserting verified: true
      await assertFails(
        db.collection('jobs').doc('job_1').set({
          companyId: 'employer_a',
          position: 'Software Engineer',
          status: 'Active',
          verified: true,
          applicantCount: 0,
        })
      );

      // Allowed: normal unverified job creation
      await assertSucceeds(
        db.collection('jobs').doc('job_1').set({
          companyId: 'employer_a',
          position: 'Software Engineer',
          status: 'Active',
          verified: false,
          applicantCount: 0,
        })
      );
    });

    it('Employer B CANNOT edit Employer A job listing', async () => {
      await testEnv.withSecurityRulesDisabled(async (adminDb) => {
        await adminDb.collection('jobs').doc('job_a').set({
          companyId: 'employer_a',
          position: 'Data Analyst',
          status: 'Active',
          verified: false,
          applicantCount: 0,
        });
      });

      const employerB = testEnv.authenticatedContext('employer_b');
      const db = employerB.firestore();

      // Denied: cross-tenant job update
      await assertFails(
        db.collection('jobs').doc('job_a').update({
          position: 'Hacked Title',
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Job Applications & HR Notes Security (S04, S06, S07, S08, S09)
  // ---------------------------------------------------------------------------
  describe('Phase 4: Candidate Applications & Protected HR Notes', () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (adminDb) => {
        // Candidate A
        await adminDb.collection('users').doc('candidate_a').set({
          uid: 'candidate_a',
          role: 'candidate',
        });
        // Candidate B
        await adminDb.collection('users').doc('candidate_b').set({
          uid: 'candidate_b',
          role: 'candidate',
        });
        // Approved Employer A
        await adminDb.collection('users').doc('employer_a').set({
          uid: 'employer_a',
          role: 'company',
          approved: true,
          status: 'approved',
          suspended: false,
        });
        // Suspended Employer S
        await adminDb.collection('users').doc('employer_s').set({
          uid: 'employer_s',
          role: 'company',
          approved: true,
          status: 'suspended',
          suspended: true,
        });
        // Job by Employer A
        await adminDb.collection('jobs').doc('job_100').set({
          companyId: 'employer_a',
          position: 'DevOps Engineer',
          status: 'Active',
        });
      });
    });

    it('Candidate A CANNOT submit application with mismatched companyId (S08)', async () => {
      const candidateA = testEnv.authenticatedContext('candidate_a');
      const db = candidateA.firestore();

      // Denied: job_100 belongs to employer_a, but candidate passes fake companyId
      await assertFails(
        db.collection('jobApplications').doc('app_fake').set({
          userId: 'candidate_a',
          jobId: 'job_100',
          companyId: 'fake_employer',
          status: 'Applied',
        })
      );
    });

    it('Candidate A CANNOT write internalNotes directly on root application (S06)', async () => {
      const candidateA = testEnv.authenticatedContext('candidate_a');
      const db = candidateA.firestore();

      // Denied: candidate cannot inject internalNotes
      await assertFails(
        db.collection('jobApplications').doc('app_1').set({
          userId: 'candidate_a',
          jobId: 'job_100',
          companyId: 'employer_a',
          status: 'Applied',
          internalNotes: 'Secret internal remarks',
        })
      );
    });

    it('Candidate A submits valid application; Candidate B CANNOT read it', async () => {
      const candidateA = testEnv.authenticatedContext('candidate_a');
      const dbA = candidateA.firestore();

      // Allowed: valid application binding to authentic job and companyId
      await assertSucceeds(
        dbA.collection('jobApplications').doc('app_valid').set({
          userId: 'candidate_a',
          jobId: 'job_100',
          companyId: 'employer_a',
          status: 'Applied',
        })
      );

      // Candidate B reads app_valid -> Denied!
      const candidateB = testEnv.authenticatedContext('candidate_b');
      const dbB = candidateB.firestore();
      await assertFails(dbB.collection('jobApplications').doc('app_valid').get());

      // Target Employer A reads app_valid -> Allowed!
      const employerA = testEnv.authenticatedContext('employer_a');
      const dbEmpA = employerA.firestore();
      await assertSucceeds(dbEmpA.collection('jobApplications').doc('app_valid').get());
    });

    it('Suspended Employer CANNOT read candidate applications (S07)', async () => {
      await testEnv.withSecurityRulesDisabled(async (adminDb) => {
        await adminDb.collection('jobApplications').doc('app_for_s').set({
          userId: 'candidate_a',
          jobId: 'job_s',
          companyId: 'employer_s',
          status: 'Applied',
        });
      });

      const suspendedEmp = testEnv.authenticatedContext('employer_s');
      const db = suspendedEmp.firestore();

      // Denied: suspended company cannot read applications
      await assertFails(db.collection('jobApplications').doc('app_for_s').get());
    });

    it('Candidate CANNOT read confidential hrPrivate/notes (S06)', async () => {
      await testEnv.withSecurityRulesDisabled(async (adminDb) => {
        await adminDb.collection('jobApplications').doc('app_with_notes').set({
          userId: 'candidate_a',
          jobId: 'job_100',
          companyId: 'employer_a',
          status: 'Applied',
        });
        await adminDb
          .collection('jobApplications')
          .doc('app_with_notes')
          .collection('hrPrivate')
          .doc('notes')
          .set({
            internalNotes: 'Candidate interview performance rating: 6/10',
          });
      });

      // Target Employer A reads notes -> Allowed!
      const employerA = testEnv.authenticatedContext('employer_a');
      const dbEmp = employerA.firestore();
      await assertSucceeds(
        dbEmp.collection('jobApplications').doc('app_with_notes').collection('hrPrivate').doc('notes').get()
      );

      // Candidate A reads notes -> DENIED! (S06)
      const candidateA = testEnv.authenticatedContext('candidate_a');
      const dbCand = candidateA.firestore();
      await assertFails(
        dbCand.collection('jobApplications').doc('app_with_notes').collection('hrPrivate').doc('notes').get()
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Audit Logs Client Tampering Prevention (S10)
  // ---------------------------------------------------------------------------
  describe('Phase 5: Audit Logs Integrity (S10)', () => {
    it('Client-side writes to auditLogs are DENIED (S10)', async () => {
      const candidateA = testEnv.authenticatedContext('candidate_a');
      const db = candidateA.firestore();

      // Denied: regular clients cannot forge audit logs
      await assertFails(
        db.collection('auditLogs').doc('log_1').set({
          action: 'FAKE_AUDIT',
          actor: 'candidate_a',
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Super Admin RBAC & Custom Claims (S02)
  // ---------------------------------------------------------------------------
  describe('Phase 6: Super Administrator Custom Claims Verification (S02)', () => {
    it('Admin with custom claim admin:true and verified email has full administrative authority', async () => {
      const adminCtx = testEnv.authenticatedContext('superadmin_uid', {
        admin: true,
        email: 'admin@zensolve.in',
        email_verified: true,
      });
      const db = adminCtx.firestore();

      // Allowed: superadmin reads audit logs
      await assertSucceeds(db.collection('auditLogs').doc('log_test').get());

      // Allowed: superadmin updates settings
      await assertSucceeds(
        db.collection('platformSettings').doc('config').set({
          maintenance: false,
        })
      );
    });

    it('Unverified account with admin email CANNOT gain admin privileges (S02)', async () => {
      const unverifiedAdmin = testEnv.authenticatedContext('fake_admin', {
        email: 'admin@zensolve.in',
        email_verified: false, // unverified!
      });
      const db = unverifiedAdmin.firestore();

      // Denied: unverified email cannot access audit logs
      await assertFails(db.collection('auditLogs').doc('log_test').get());
    });
  });

});
