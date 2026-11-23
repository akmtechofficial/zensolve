import { adminDb, adminStorage, verifyAuthToken } from './_firebaseAdmin.js';
import { checkRateLimit } from './_rateLimiter.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // 1. Authenticate caller using Firebase ID Token (S02, S13)
    let caller;
    try {
      caller = await verifyAuthToken(req);
    } catch (authErr) {
      return res.status(401).json({ error: 'Unauthorized: ' + authErr.message });
    }

    const callerUid = caller.uid;
    const isSuperAdmin = Boolean(caller.admin === true || caller.email === 'admin@zensolve.in');

    // Rate Limiting (30 requests per minute per user)
    const rateCheck = checkRateLimit(`resume_${callerUid}`, 30, 60000);
    if (!rateCheck.allowed) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment before requesting more CVs.' });
    }

    const { resumePath, applicationId } = req.body || {};

    if (!resumePath || typeof resumePath !== 'string') {
      return res.status(400).json({ error: 'Missing resumePath parameter.' });
    }

    // Sanitize path to prevent directory traversal
    const normalizedPath = resumePath.replace(/^\/+/, '');
    if (normalizedPath.includes('..') || !normalizedPath.startsWith('resumes/')) {
      return res.status(400).json({ error: 'Invalid resume storage path.' });
    }

    let isAuthorized = false;

    // 2. Super Admin Authorization
    if (isSuperAdmin) {
      isAuthorized = true;
    }
    // 3. Candidate Owner Authorization (Candidate accessing own CV)
    else if (normalizedPath.startsWith(`resumes/${callerUid}/`)) {
      isAuthorized = true;
    }
    // 4. Approved Employer Authorization (Employer accessing candidate CV for their own job application)
    else if (applicationId) {
      const appRef = adminDb.collection('jobApplications').doc(applicationId);
      const appSnap = await appRef.get();

      if (!appSnap.exists) {
        return res.status(404).json({ error: 'Application record not found.' });
      }

      const appData = appSnap.data();

      // Verify employer ownership of this application (S04, S13)
      if (appData.companyId !== callerUid) {
        return res.status(403).json({ error: 'Forbidden: You do not own the job or application linked to this resume.' });
      }

      // Verify that this employer account is approved and not suspended (S07)
      const userRef = adminDb.collection('users').doc(callerUid);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return res.status(403).json({ error: 'Forbidden: Employer account record not found.' });
      }

      const userData = userSnap.data();
      const isApproved = userData.approved === true || userData.status === 'approved';
      const isSuspended = userData.suspended === true || userData.status === 'suspended';

      if (!isApproved || isSuspended) {
        return res.status(403).json({ error: 'Forbidden: Pending or suspended employers cannot retrieve candidate resumes.' });
      }

      // Verify resume matches the application record
      const appResume = appData.resume || '';
      const appResumePath = appData.resumeStoragePath || '';

      if (appResume.includes(normalizedPath) || appResumePath === normalizedPath) {
        isAuthorized = true;
      } else {
        return res.status(403).json({ error: 'Forbidden: Requested resume path does not match this application record.' });
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to view this candidate resume.' });
    }

    // 5. Generate short-lived (15 minutes) signed URL
    const bucket = adminStorage.bucket();
    const file = bucket.file(normalizedPath);

    const [exists] = await file.exists().catch(() => [false]);
    if (!exists) {
      // In case file was stored under full path or legacy URL
      return res.status(404).json({ error: 'Resume file does not exist in storage bucket.' });
    }

    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: expiresAt,
    });

    return res.status(200).json({
      success: true,
      url: signedUrl,
      expiresAt,
    });
  } catch (error) {
    console.error('get-resume-url error:', error);
    return res.status(500).json({ error: 'Failed generating secure resume access URL: ' + error.message });
  }
}
