import { adminDb, verifyAuthToken } from './_firebaseAdmin.js';
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
    // 1. Authenticate caller using Firebase ID Token
    let caller;
    try {
      caller = await verifyAuthToken(req);
    } catch (authErr) {
      return res.status(401).json({ error: 'Unauthorized: ' + authErr.message });
    }

    const callerUid = caller.uid;
    const isSuperAdmin = Boolean(caller.admin === true || (caller.email === 'admin@zensolve.in' && caller.email_verified));

    // Rate Limiting (60 requests per minute per user)
    const rateCheck = checkRateLimit(`profile_fetch_${callerUid}`, 60, 60000);
    if (!rateCheck.allowed) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment.' });
    }

    const { applicationId } = req.body || {};
    if (!applicationId || typeof applicationId !== 'string') {
      return res.status(400).json({ error: 'Missing applicationId parameter.' });
    }

    // 2. Fetch the authoritative application record
    const appRef = adminDb.collection('jobApplications').doc(applicationId);
    const appSnap = await appRef.get();

    if (!appSnap.exists) {
      return res.status(404).json({ error: 'Application record not found.' });
    }

    const appData = appSnap.data();

    // 3. Verify Authorization:
    // Caller must be Super Admin, or Candidate Owner, or the Approved Employer who owns the job
    let isAuthorized = false;

    if (isSuperAdmin) {
      isAuthorized = true;
    } else if (appData.userId === callerUid) {
      isAuthorized = true;
    } else if (appData.companyId === callerUid) {
      // Check employer status
      const employerRef = adminDb.collection('users').doc(callerUid);
      const employerSnap = await employerRef.get();
      if (!employerSnap.exists) {
        return res.status(403).json({ error: 'Employer account not found.' });
      }
      const employerData = employerSnap.data();
      if (employerData.suspended === true || employerData.status === 'suspended') {
        return res.status(403).json({ error: 'Suspended employer accounts cannot access candidate data.' });
      }
      if (employerData.approved !== true && employerData.status !== 'approved') {
        return res.status(403).json({ error: 'Pending or unverified employer accounts cannot view candidate data.' });
      }
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to view this candidate profile.' });
    }

    // 4. Retrieve candidate profile from users collection
    let candidateData = {};
    if (appData.userId) {
      const userRef = adminDb.collection('users').doc(appData.userId);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        candidateData = userSnap.data();
      }
    }

    const snap = appData.profileSnapshot || {};

    const getFirstNonEmptyArray = (...arrs) => {
      for (const a of arrs) {
        if (Array.isArray(a) && a.length > 0) return a;
      }
      return [];
    };

    const getFirstNonEmptyString = (...strs) => {
      for (const s of strs) {
        if (typeof s === 'string' && s.trim().length > 0) return s.trim();
      }
      return '';
    };

    // Combine candidate user profile with application snapshot
    const profile = {
      displayName: getFirstNonEmptyString(candidateData.displayName, candidateData.name, snap.displayName, appData.applicantName),
      email: getFirstNonEmptyString(candidateData.email, snap.email, appData.applicantEmail),
      phone: getFirstNonEmptyString(candidateData.phone, snap.phone, appData.applicantPhone),
      photoURL: getFirstNonEmptyString(candidateData.photoURL, candidateData.avatar, snap.photoURL, appData.applicantPhoto),
      headline: getFirstNonEmptyString(candidateData.headline, snap.headline, appData.applicantHeadline),
      bio: getFirstNonEmptyString(candidateData.bio, candidateData.about, snap.bio, appData.applicantBio),
      location: getFirstNonEmptyString(candidateData.location, candidateData.city, snap.location, appData.applicantLocation, appData.location),
      city: getFirstNonEmptyString(candidateData.city, snap.city),
      state: getFirstNonEmptyString(candidateData.state, snap.state),
      address: getFirstNonEmptyString(candidateData.address, snap.address),
      skills: getFirstNonEmptyArray(candidateData.skills, snap.skills, appData.skills, appData.applicantSkills),
      languages: getFirstNonEmptyArray(candidateData.languages, snap.languages, appData.languages),
      education: getFirstNonEmptyArray(candidateData.education, snap.education, appData.education),
      experience: getFirstNonEmptyArray(candidateData.experience, snap.experience, appData.experience),
      experienceYears: getFirstNonEmptyString(candidateData.experienceYears, candidateData.totalExperience, snap.experienceYears, appData.experienceYears),
      noticePeriod: getFirstNonEmptyString(candidateData.noticePeriod, snap.noticePeriod, appData.noticePeriod),
      currentSalary: getFirstNonEmptyString(candidateData.currentSalary, snap.currentSalary, appData.currentSalary),
      expectedSalary: getFirstNonEmptyString(candidateData.expectedSalary, snap.expectedSalary, appData.expectedSalary),
      gender: getFirstNonEmptyString(candidateData.gender, snap.gender, appData.gender),
      dob: getFirstNonEmptyString(candidateData.dob, snap.dob, appData.dob),
      portfolioURL: getFirstNonEmptyString(candidateData.portfolioURL, candidateData.portfolio, snap.portfolioURL, appData.portfolioURL),
      linkedinURL: getFirstNonEmptyString(candidateData.linkedinURL, candidateData.linkedin, snap.linkedinURL, appData.linkedinURL),
      githubURL: getFirstNonEmptyString(candidateData.githubURL, candidateData.github, snap.githubURL, appData.githubURL),
      resumeURL: getFirstNonEmptyString(candidateData.resumeURL, snap.resumeURL, appData.resume),
      isDigitalProfile: Boolean(appData.isDigitalProfile || appData.resume === 'DIGITAL_PROFILE_CV' || appData.resume?.startsWith?.('profile://')),
      notes: appData.notes || '',
      jobPosition: appData.jobPosition || '',
      appliedAt: appData.appliedAt || null,
      status: appData.status || 'Applied',
    };

    // Opportunistically sync back to application doc so client never has stale data
    try {
      await appRef.set(
        {
          applicantName: profile.displayName,
          applicantEmail: profile.email,
          applicantPhone: profile.phone,
          applicantPhoto: profile.photoURL,
          applicantHeadline: profile.headline,
          applicantBio: profile.bio,
          applicantLocation: profile.location,
          skills: profile.skills,
          languages: profile.languages,
          education: profile.education,
          experience: profile.experience,
          experienceYears: profile.experienceYears,
          noticePeriod: profile.noticePeriod,
          portfolioURL: profile.portfolioURL,
          linkedinURL: profile.linkedinURL,
          githubURL: profile.githubURL,
          profileSnapshot: profile,
        },
        { merge: true }
      );
    } catch (backfillErr) {
      console.warn('Background backfill notice:', backfillErr);
    }

    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error('get-candidate-profile error:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
