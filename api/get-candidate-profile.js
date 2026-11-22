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

    // Combine candidate user profile with application snapshot
    const profile = {
      displayName: candidateData.displayName || candidateData.name || appData.applicantName || '',
      email: candidateData.email || appData.applicantEmail || '',
      phone: candidateData.phone || appData.applicantPhone || '',
      photoURL: candidateData.photoURL || candidateData.avatar || appData.applicantPhoto || '',
      headline: candidateData.headline || appData.applicantHeadline || '',
      bio: candidateData.bio || candidateData.about || appData.applicantBio || '',
      location: candidateData.location || candidateData.city || appData.applicantLocation || appData.location || '',
      city: candidateData.city || '',
      state: candidateData.state || '',
      address: candidateData.address || '',
      skills: Array.isArray(candidateData.skills) && candidateData.skills.length > 0
        ? candidateData.skills
        : (Array.isArray(appData.skills) ? appData.skills : (appData.applicantSkills || [])),
      languages: Array.isArray(candidateData.languages) && candidateData.languages.length > 0
        ? candidateData.languages
        : (Array.isArray(appData.languages) ? appData.languages : []),
      education: Array.isArray(candidateData.education) && candidateData.education.length > 0
        ? candidateData.education
        : (Array.isArray(appData.education) ? appData.education : []),
      experience: Array.isArray(candidateData.experience) && candidateData.experience.length > 0
        ? candidateData.experience
        : (Array.isArray(appData.experience) ? appData.experience : []),
      experienceYears: candidateData.experienceYears || candidateData.totalExperience || appData.experienceYears || '',
      noticePeriod: candidateData.noticePeriod || appData.noticePeriod || '',
      currentSalary: candidateData.currentSalary || appData.currentSalary || '',
      expectedSalary: candidateData.expectedSalary || appData.expectedSalary || '',
      gender: candidateData.gender || appData.gender || '',
      dob: candidateData.dob || appData.dob || '',
      portfolioURL: candidateData.portfolioURL || candidateData.portfolio || appData.portfolioURL || '',
      linkedinURL: candidateData.linkedinURL || candidateData.linkedin || appData.linkedinURL || '',
      githubURL: candidateData.githubURL || candidateData.github || appData.githubURL || '',
      resumeURL: candidateData.resumeURL || appData.resume || '',
      isDigitalProfile: Boolean(appData.isDigitalProfile || appData.resume === 'DIGITAL_PROFILE_CV'),
      notes: appData.notes || '',
      jobPosition: appData.jobPosition || '',
      appliedAt: appData.appliedAt || null,
      status: appData.status || 'Applied',
    };

    // Opportunistically backfill missing snapshot fields on legacy application doc
    if (!appData.education || !appData.experience || !appData.skills) {
      try {
        await appRef.set(
          {
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
            profileSnapshot: profile,
          },
          { merge: true }
        );
      } catch (backfillErr) {
        console.warn('Background backfill notice:', backfillErr);
      }
    }

    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error('get-candidate-profile error:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
