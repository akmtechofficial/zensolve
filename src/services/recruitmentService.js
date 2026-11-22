import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

/* =========================================================================
   1. JOBS SERVICES
   ========================================================================= */

/**
 * Fetch all jobs from Firestore with optional filtering
 */
export const getJobs = async (filters = {}) => {
  try {
    const jobsRef = collection(db, "jobs");
    let q;

    // F01: Rule-compatible Firestore query
    if (filters.companyId) {
      q = query(jobsRef, where("companyId", "==", filters.companyId));
    } else if (filters.isAdmin) {
      q = jobsRef;
    } else {
      // Default public query must specify status == 'Active' to satisfy Firestore security rules
      q = query(jobsRef, where("status", "==", "Active"));
    }

    const snapshot = await getDocs(q);
    let jobs = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        position: data.position || data.title || "Job Position",
        companyName: data.companyName || data.company || "Hiring Company",
      };
    });

    if (filters.search) {
      const queryStr = filters.search.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          (job.position && job.position.toLowerCase().includes(queryStr)) ||
          (job.companyName && job.companyName.toLowerCase().includes(queryStr)) ||
          (job.clientCompanyName && job.clientCompanyName.toLowerCase().includes(queryStr)) ||
          (job.location && job.location.toLowerCase().includes(queryStr)) ||
          (job.category && job.category.toLowerCase().includes(queryStr)) ||
          (job.description && job.description.toLowerCase().includes(queryStr))
      );
    }

    if (filters.category && filters.category !== "All") {
      jobs = jobs.filter(
        (job) =>
          job.category &&
          job.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.jobType && filters.jobType !== "All") {
      jobs = jobs.filter(
        (job) =>
          job.jobType &&
          job.jobType.toLowerCase() === filters.jobType.toLowerCase()
      );
    }

    if (filters.location && filters.location !== "All") {
      jobs = jobs.filter(
        (job) =>
          job.location &&
          job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.companyName) {
      jobs = jobs.filter(
        (job) =>
          job.companyName &&
          job.companyName.toLowerCase() === filters.companyName.toLowerCase()
      );
    }

    return jobs;
  } catch (error) {
    console.error("Error fetching jobs from Firestore:", error);
    return [];
  }
};

/**
 * Get single job by ID
 */
export const getJobById = async (jobId) => {
  try {
    const jobRef = doc(db, "jobs", jobId);
    const snap = await getDoc(jobRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        ...data,
        position: data.position || data.title || "Job Position",
        companyName: data.companyName || data.company || "Hiring Company",
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching job ${jobId}:`, error);
    return null;
  }
};

/**
 * Create a new job listing (HR Dashboard)
 */
export const createJob = async (jobData) => {
  try {
    const jobsRef = collection(db, "jobs");
    const docRef = await addDoc(jobsRef, {
      ...jobData,
      rating: jobData.rating || 4.8,
      saveCount: 0,
      createdAt: serverTimestamp(),
      status: jobData.status || "Active",
      verified: false, // S11, S12: Employer cannot self-verify listings; verified is admin-moderated
      applicantCount: 0,
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating job in Firestore:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing job
 */
export const updateJob = async (jobId, jobData) => {
  try {
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
      ...jobData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating job:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a job
 */
export const deleteJob = async (jobId) => {
  try {
    const jobRef = doc(db, "jobs", jobId);
    await deleteDoc(jobRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting job:", error);
    return { success: false, error: error.message };
  }
};

/* =========================================================================
   2. CANDIDATE PROFILE & APPLICATIONS
   ========================================================================= */

/**
 * Get Candidate Profile by User ID
 */
export const getCandidateProfile = async (userId) => {
  try {
    if (!userId) return null;
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        ...data,
        position: data.position || data.title || "Job Position",
        companyName: data.companyName || data.company || "Hiring Company",
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    return null;
  }
};

/**
 * Save / Update Candidate Profile
 */
export const saveCandidateProfile = async (userId, profileData) => {
  try {
    if (!userId) throw new Error("User ID is required");
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        ...profileData,
        role: "candidate",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error("Error updating candidate profile:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if candidate has already applied for this job
 * Accepts (jobId, userId, applicantEmail) OR ({ jobId, userId, applicantEmail })
 */
export const checkExistingApplication = async (jobIdOrOptions, maybeUserId, maybeEmail) => {
  try {
    let jobId = jobIdOrOptions;
    let userId = maybeUserId;
    let applicantEmail = maybeEmail;

    if (typeof jobIdOrOptions === 'object' && jobIdOrOptions !== null) {
      jobId = jobIdOrOptions.jobId;
      userId = jobIdOrOptions.userId;
      applicantEmail = jobIdOrOptions.applicantEmail || jobIdOrOptions.email;
    }

    if (!jobId) return null;
    const appsRef = collection(db, "jobApplications");
    
    // Priority 1: Check by userId if provided
    if (userId) {
      const qUser = query(appsRef, where("jobId", "==", jobId), where("userId", "==", userId));
      const snapUser = await getDocs(qUser);
      if (!snapUser.empty) {
        const d = snapUser.docs[0];
        return { id: d.id, ...d.data() };
      }
    }

    // Priority 2: Check by applicantEmail if provided
    if (applicantEmail) {
      const qEmail = query(appsRef, where("jobId", "==", jobId), where("applicantEmail", "==", applicantEmail));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        const d = snapEmail.docs[0];
        return { id: d.id, ...d.data() };
      }
    }

    return null;
  } catch (error) {
    console.error("Error checking existing application:", error);
    return null;
  }
};

/**
 * Submit official job application (with strict single-application enforcement)
 */
export const submitJobApplication = async (applicationData) => {
  try {
    const { jobId, userId, applicantEmail } = applicationData;

    // Retrieve candidate profile data from Firestore to attach full dossier to application
    let candidateProfileSnapshot = {};
    if (userId) {
      try {
        const userSnap = await getDoc(doc(db, "users", userId));
        if (userSnap.exists()) {
          const uData = userSnap.data();
          const uRole = uData.role;
          if (uRole === 'company' || uRole === 'employer') {
            return {
              success: false,
              isCompanyAccount: true,
              error: "Company accounts are not permitted to apply for jobs. Please log in with a candidate account.",
            };
          }

          candidateProfileSnapshot = {
            displayName: uData.displayName || uData.name || '',
            email: uData.email || '',
            phone: uData.phone || '',
            photoURL: uData.photoURL || uData.avatar || '',
            location: uData.location || uData.city || '',
            city: uData.city || '',
            state: uData.state || '',
            address: uData.address || '',
            headline: uData.headline || '',
            bio: uData.bio || uData.about || '',
            skills: Array.isArray(uData.skills) ? uData.skills : [],
            languages: Array.isArray(uData.languages) ? uData.languages : [],
            education: Array.isArray(uData.education) ? uData.education : [],
            experience: Array.isArray(uData.experience) ? uData.experience : [],
            experienceYears: uData.experienceYears || uData.totalExperience || '',
            currentSalary: uData.currentSalary || '',
            expectedSalary: uData.expectedSalary || '',
            noticePeriod: uData.noticePeriod || '',
            gender: uData.gender || '',
            dob: uData.dob || '',
            portfolioURL: uData.portfolioURL || uData.portfolio || '',
            linkedinURL: uData.linkedinURL || uData.linkedin || '',
            githubURL: uData.githubURL || uData.github || '',
            resumeURL: uData.resumeURL || '',
            resumeStoragePath: uData.resumeStoragePath || '',
          };
        }
      } catch (err) {
        console.warn("User role validation notice:", err);
      }
    }

    // Strict duplicate check: 1 candidate = 1 application per job
    const existing = await checkExistingApplication(jobId, userId, applicantEmail);
    if (existing) {
      return {
        success: false,
        isDuplicate: true,
        error: "Aap pehle hi iss job ke liye apply kar chuke hain. Ek candidate ek job ke liye sirf ek baar apply kar sakta hai.",
        existingId: existing.id,
      };
    }

    // S06: Ensure internalNotes is never sent on candidate application root document
    const { internalNotes, ...cleanApplicationData } = applicationData;

    // S19: Deterministic document ID (${jobId}_${userId}) for absolute deduplication
    const appId = userId ? `${jobId}_${userId}` : null;
    const docRef = appId ? doc(db, "jobApplications", appId) : doc(collection(db, "jobApplications"));

    // Deep merge application fields with candidate's full profile
    const fullApplicationPayload = {
      // 1. Candidate's profile base
      ...candidateProfileSnapshot,
      // 2. Specific application inputs
      ...cleanApplicationData,
      // 3. Normalized top-level candidate dossier fields for recruiter view
      applicantName: cleanApplicationData.applicantName || candidateProfileSnapshot.displayName || '',
      applicantEmail: cleanApplicationData.applicantEmail || candidateProfileSnapshot.email || '',
      applicantPhone: cleanApplicationData.applicantPhone || candidateProfileSnapshot.phone || '',
      applicantPhoto: cleanApplicationData.applicantPhoto || candidateProfileSnapshot.photoURL || '',
      applicantLocation: cleanApplicationData.applicantLocation || candidateProfileSnapshot.location || '',
      applicantHeadline: cleanApplicationData.applicantHeadline || candidateProfileSnapshot.headline || '',
      applicantBio: cleanApplicationData.applicantBio || candidateProfileSnapshot.bio || '',
      skills: (cleanApplicationData.skills && cleanApplicationData.skills.length > 0)
        ? cleanApplicationData.skills
        : (cleanApplicationData.applicantSkills && cleanApplicationData.applicantSkills.length > 0)
        ? cleanApplicationData.applicantSkills
        : candidateProfileSnapshot.skills || [],
      languages: (cleanApplicationData.languages && cleanApplicationData.languages.length > 0)
        ? cleanApplicationData.languages
        : candidateProfileSnapshot.languages || [],
      education: (cleanApplicationData.education && cleanApplicationData.education.length > 0)
        ? cleanApplicationData.education
        : candidateProfileSnapshot.education || [],
      experience: (cleanApplicationData.experience && cleanApplicationData.experience.length > 0)
        ? cleanApplicationData.experience
        : candidateProfileSnapshot.experience || [],
      experienceYears: cleanApplicationData.experienceYears || candidateProfileSnapshot.experienceYears || '',
      noticePeriod: cleanApplicationData.noticePeriod || candidateProfileSnapshot.noticePeriod || '',
      portfolioURL: cleanApplicationData.portfolioURL || candidateProfileSnapshot.portfolioURL || '',
      linkedinURL: cleanApplicationData.linkedinURL || candidateProfileSnapshot.linkedinURL || '',
      githubURL: cleanApplicationData.githubURL || candidateProfileSnapshot.githubURL || '',
      // 4. Nested complete profileSnapshot object
      profileSnapshot: {
        ...candidateProfileSnapshot,
        ...(cleanApplicationData.profileSnapshot || {}),
      },
      status: "Applied",
      appliedAt: serverTimestamp(),
      statusTimeline: [
        {
          status: "Applied",
          timestamp: new Date().toISOString(),
          note: "Application submitted to employer recruitment queue",
        },
      ],
    };

    await setDoc(docRef, fullApplicationPayload);

    // Also increment application count on the job
    try {
      const jobRef = doc(db, "jobs", jobId);
      const jobSnap = await getDoc(jobRef);
      if (jobSnap.exists()) {
        const curCount = jobSnap.data().applicantCount || 0;
        await updateDoc(jobRef, { applicantCount: curCount + 1 });
      }
    } catch (e) {
      // non-fatal
    }

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error submitting application:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all applications for a specific candidate
 * Accepts (userId, applicantEmail) OR ({ userId, applicantEmail })
 */
export const getCandidateApplications = async (userIdOrOptions, maybeEmail) => {
  try {
    let userId = userIdOrOptions;
    let applicantEmail = maybeEmail;

    if (typeof userIdOrOptions === 'object' && userIdOrOptions !== null) {
      userId = userIdOrOptions.userId;
      applicantEmail = userIdOrOptions.applicantEmail || userIdOrOptions.email;
    }

    const appsRef = collection(db, "jobApplications");
    let apps = [];

    if (userId) {
      const q = query(appsRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);
      apps = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } else if (applicantEmail) {
      const q = query(appsRef, where("applicantEmail", "==", applicantEmail));
      const snapshot = await getDocs(q);
      apps = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    }

    // Sort descending
    apps.sort((a, b) => {
      const timeA = a.appliedAt?.toDate ? a.appliedAt.toDate() : new Date(a.appliedAt || 0);
      const timeB = b.appliedAt?.toDate ? b.appliedAt.toDate() : new Date(b.appliedAt || 0);
      return timeB - timeA;
    });

    return apps;
  } catch (error) {
    console.error("Error fetching candidate applications:", error);
    return [];
  }
};

/**
 * Get single application by ID
 */
export const getApplicationById = async (applicationId) => {
  try {
    const appRef = doc(db, "jobApplications", applicationId);
    const snap = await getDoc(appRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        ...data,
        position: data.position || data.title || "Job Position",
        companyName: data.companyName || data.company || "Hiring Company",
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching application ${applicationId}:`, error);
    return null;
  }
};

/**
 * Candidate withdraws application (only allowed if not yet Selected/Rejected)
 */
export const withdrawApplication = async (applicationId, userId, reason = "Withdrawn by candidate") => {
  try {
    const appRef = doc(db, "jobApplications", applicationId);
    const snap = await getDoc(appRef);
    if (!snap.exists()) throw new Error("Application not found");

    const appData = snap.data();
    if (appData.userId && appData.userId !== userId) {
      throw new Error("Unauthorized to withdraw this application");
    }

    if (appData.status === "Selected" || appData.status === "Rejected" || appData.status === "Withdrawn") {
      throw new Error(`Cannot withdraw an application that is already ${appData.status}`);
    }

    const currentTimeline = appData.statusTimeline || [];
    currentTimeline.push({
      status: "Withdrawn",
      timestamp: new Date().toISOString(),
      note: reason,
    });

    await updateDoc(appRef, {
      status: "Withdrawn",
      statusUpdatedAt: serverTimestamp(),
      withdrawalReason: reason,
      statusTimeline: currentTimeline,
    });

    return { success: true };
  } catch (error) {
    console.error("Error withdrawing application:", error);
    return { success: false, error: error.message };
  }
};

/* =========================================================================
   3. HR / COMPANY APPLICANT MANAGEMENT
   ========================================================================= */

/**
 * Get applications for HR Company (scoped strictly by companyId or jobId)
 */
export const getJobApplications = async ({ jobId, companyName, companyId } = {}) => {
  try {
    const appsRef = collection(db, "jobApplications");
    let appsQuery;

    if (companyId) {
      appsQuery = query(appsRef, where("companyId", "==", companyId));
    } else if (jobId) {
      appsQuery = query(appsRef, where("jobId", "==", jobId));
    } else {
      // Admin fallback or unfiltered if permissible
      appsQuery = appsRef;
    }

    const snapshot = await getDocs(appsQuery);
    let apps = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (jobId && companyId) {
      apps = apps.filter((a) => a.jobId === jobId);
    }
    if (companyName && !companyId) {
      apps = apps.filter(
        (a) =>
          a.companyName &&
          a.companyName.toLowerCase() === companyName.toLowerCase()
      );
    }

    // Sort by appliedAt descending
    apps.sort((a, b) => {
      const timeA = a.appliedAt?.toDate ? a.appliedAt.toDate() : new Date(a.appliedAt || 0);
      const timeB = b.appliedAt?.toDate ? b.appliedAt.toDate() : new Date(b.appliedAt || 0);
      return timeB - timeA;
    });

    return apps;
  } catch (error) {
    console.error("Error fetching applications:", error);
    return [];
  }
};

/**
 * Update application status with timeline audit record
 */
export const updateApplicationStatus = async (applicationId, status, note = "") => {
  try {
    const appRef = doc(db, "jobApplications", applicationId);
    const snap = await getDoc(appRef);
    const existingData = snap.exists() ? snap.data() : {};
    const timeline = existingData.statusTimeline || [];

    timeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Application updated to ${status}`,
    });

    await updateDoc(appRef, {
      status,
      statusUpdatedAt: serverTimestamp(),
      statusTimeline: timeline,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating application status:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Schedule interview for candidate application
 */
export const scheduleInterview = async (applicationId, interviewDetails) => {
  try {
    const appRef = doc(db, "jobApplications", applicationId);
    const snap = await getDoc(appRef);
    const existingData = snap.exists() ? snap.data() : {};
    const timeline = existingData.statusTimeline || [];

    timeline.push({
      status: "Interview Scheduled",
      timestamp: new Date().toISOString(),
      note: `Interview scheduled on ${interviewDetails.date} at ${interviewDetails.time} (${interviewDetails.type})`,
    });

    await updateDoc(appRef, {
      status: "Interview Scheduled",
      interview: {
        ...interviewDetails,
        scheduledAt: new Date().toISOString(),
      },
      statusUpdatedAt: serverTimestamp(),
      statusTimeline: timeline,
    });
    return { success: true };
  } catch (error) {
    console.error("Error scheduling interview:", error);
    return { success: false, error: error.message };
  }
};

/**
 * S06: Save private internal HR notes in protected subcollection hrPrivate/notes
 * Candidate has zero read/write access to this path under Firestore security rules
 */
export const saveInternalNotes = async (applicationId, internalNotes) => {
  try {
    const notesRef = doc(db, "jobApplications", applicationId, "hrPrivate", "notes");
    await setDoc(
      notesRef,
      {
        internalNotes,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error("Error saving internal notes:", error);
    return { success: false, error: error.message };
  }
};

/**
 * S06: Fetch private internal HR notes from protected subcollection hrPrivate/notes
 */
export const getInternalNotes = async (applicationId) => {
  try {
    if (!applicationId) return "";
    const notesRef = doc(db, "jobApplications", applicationId, "hrPrivate", "notes");
    const snap = await getDoc(notesRef);
    if (snap.exists()) {
      return snap.data().internalNotes || "";
    }
    // Backward compatibility fallback to root document for unmigrated legacy notes
    const appRef = doc(db, "jobApplications", applicationId);
    const appSnap = await getDoc(appRef);
    if (appSnap.exists()) {
      return appSnap.data().internalNotes || "";
    }
    return "";
  } catch (error) {
    console.warn("Internal notes read notice:", error.message);
    return "";
  }
};

/* =========================================================================
   4. COMPANY PROFILE & APPROVALS
   ========================================================================= */

/**
 * S05, F02: Fetch public company directory from sanitized publicCompanies collection
 * Never reads private users/{uid} documents
 */
export const getCompanies = async () => {
  try {
    const publicCompRef = collection(db, "publicCompanies");
    const snap = await getDocs(publicCompRef);
    let companies = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Fallback: if publicCompanies collection is currently empty (pre-migration)
    if (companies.length === 0) {
      // Safely aggregate company cards from active published jobs
      const jobs = await getJobs({ onlyActive: true });
      const compMap = new Map();
      jobs.forEach((job) => {
        if (job.companyName) {
          const key = job.companyName.trim().toLowerCase();
          if (compMap.has(key)) {
            const c = compMap.get(key);
            c.openRolesCount += 1;
          } else {
            compMap.set(key, {
              id: job.companyId || `comp-${key}`,
              name: job.companyName.trim(),
              companyName: job.companyName.trim(),
              logo: job.companyLogo || "/zen.jpeg",
              location: job.location || "India",
              industry: job.category || "Staffing & Manpower",
              openRolesCount: 1,
              verified: true,
              approved: true,
              status: "approved",
              rating: job.rating || 4.8,
            });
          }
        }
      });
      companies = Array.from(compMap.values());
    }

    return companies;
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
};

/**
 * Get all registered companies for Super Admin
 */
export const getAdminCompanies = async () => {
  try {
    const usersRef = collection(db, "users");
    const snap = await getDocs(usersRef);
    const companies = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((u) => u.role === "company" || u.role === "employer");

    // Also get jobs count for each company
    const jobs = await getJobs();
    return companies.map((c) => {
      const matchJobs = jobs.filter((j) => j.companyId === c.id || j.companyName?.toLowerCase() === c.companyName?.toLowerCase());
      return {
        ...c,
        totalJobs: matchJobs.length,
        status: c.status || (c.approved ? "approved" : "pending"),
      };
    });
  } catch (error) {
    console.error("Error fetching admin companies:", error);
    return [];
  }
};

/**
 * Admin: Update Company Approval Status (approved, rejected, suspended)
 */
export const updateCompanyApproval = async (companyId, status, decisionNote = "", adminEmail = "admin@zensolve.in") => {
  try {
    const compRef = doc(db, "users", companyId);
    const isApproved = status === "approved";
    await updateDoc(compRef, {
      status,
      approved: isApproved,
      approvalNote: decisionNote,
      reviewedBy: adminEmail,
      reviewedAt: serverTimestamp(),
    });

    // S05: Sync sanitized record into publicCompanies directory upon approval
    if (isApproved) {
      const snap = await getDoc(compRef);
      if (snap.exists()) {
        const d = snap.data();
        await setDoc(
          doc(db, "publicCompanies", companyId),
          {
            id: companyId,
            companyName: d.companyName || d.displayName || "Partner Organization",
            name: d.companyName || d.displayName || "Partner Organization",
            logo: d.logo || d.companyLogo || "/zen.jpeg",
            companyLogo: d.logo || d.companyLogo || "/zen.jpeg",
            location: d.location || "India",
            industry: d.industry || "Staffing & Manpower",
            companyType: d.companyType || "Private Limited",
            website: d.website || "",
            about: d.description || d.about || "Verified hiring partner on ZenSolve.",
            verified: true,
            rating: d.rating || 4.8,
            openRolesCount: 0,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } else {
      // If suspended or rejected, remove from public directory
      await deleteDoc(doc(db, "publicCompanies", companyId)).catch(() => {});
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating company status:", error);
    return { success: false, error: error.message };
  }
};

/* =========================================================================
   5. SAVED JOBS
   ========================================================================= */

/**
 * Fetch saved jobs for a specific user ID
 */
export const getUserSavedJobs = async (userId) => {
  try {
    if (!userId) return [];
    const userDocRef = doc(db, "users", userId);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) return [];

    const savedJobIds = userSnap.data().savedJobs || [];
    if (!savedJobIds.length) return [];

    const allJobs = await getJobs();
    return allJobs.filter((j) => savedJobIds.includes(j.id));
  } catch (error) {
    console.error("Error fetching user saved jobs:", error);
    return [];
  }
};

/**
 * Toggle save job for candidate
 */
export const toggleSaveJob = async (userId, jobId) => {
  try {
    if (!userId) throw new Error("Must be logged in to save job");
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const currentSaved = userSnap.exists() ? userSnap.data().savedJobs || [] : [];

    let updatedSaved;
    let isSaved;
    if (currentSaved.includes(jobId)) {
      updatedSaved = currentSaved.filter((id) => id !== jobId);
      isSaved = false;
    } else {
      updatedSaved = [...currentSaved, jobId];
      isSaved = true;
    }

    await setDoc(userRef, { savedJobs: updatedSaved }, { merge: true });
    return { success: true, isSaved };
  } catch (error) {
    console.error("Error toggling saved job:", error);
    return { success: false, error: error.message };
  }
};

/* =========================================================================
   6. SUPER ADMIN PLATFORM AUDIT & STATS
   ========================================================================= */

/**
 * Fetch platform stats for Super-Admin Dashboard
 */
export const getPlatformStats = async () => {
  try {
    const [jobsSnap, appsSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, "jobs")),
      getDocs(collection(db, "jobApplications")),
      getDocs(collection(db, "users")),
    ]);

    const jobs = jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const apps = appsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const companies = users.filter((u) => u.role === "company" || u.role === "employer");
    const candidates = users.filter((u) => u.role === "candidate" || !u.role);

    const pendingCompanies = companies.filter((c) => c.status === "pending" || c.approved === false);
    const approvedCompanies = companies.filter((c) => c.status === "approved" || c.approved === true);
    const suspendedCompanies = companies.filter((c) => c.status === "suspended");

    return {
      totalJobs: jobs.length,
      publishedJobs: jobs.filter((j) => j.status === "Active" || !j.status).length,
      totalApplications: apps.length,
      totalUsers: users.length,
      totalCandidates: candidates.length,
      totalCompanies: companies.length,
      pendingCompanies: pendingCompanies.length,
      approvedCompanies: approvedCompanies.length,
      suspendedCompanies: suspendedCompanies.length,
      recentApplications: apps.slice(0, 5),
    };
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    return {
      totalJobs: 0,
      publishedJobs: 0,
      totalApplications: 0,
      totalUsers: 0,
      totalCandidates: 0,
      totalCompanies: 0,
      pendingCompanies: 0,
      approvedCompanies: 0,
      suspendedCompanies: 0,
      recentApplications: [],
    };
  }
};

/**
 * Get all users for admin management
 */
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const snap = await getDocs(usersRef);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
};

/**
 * Toggle suspend user account
 */
export const toggleUserSuspension = async (userId, isSuspended, adminEmail = "admin@zensolve.in") => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      suspended: isSuspended,
      status: isSuspended ? "suspended" : "active",
      suspendedBy: adminEmail,
      suspendedAt: serverTimestamp(),
    });

    await logAuditEvent("USER_SUSPENSION_TOGGLE", userId, {
      suspended: isSuspended,
      adminEmail,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user suspension:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Log audit events for sensitive administrative operations
 */
export const logAuditEvent = async (action, targetId, details = {}, adminEmail = "system") => {
  try {
    const auditRef = collection(db, "auditLogs");
    await addDoc(auditRef, {
      action,
      targetId,
      details,
      adminEmail,
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch (e) {
    console.warn("Audit logging warning:", e);
    return { success: false };
  }
};

/**
 * Fetch recent audit logs
 */
export const getAuditLogs = async (limitCount = 25) => {
  try {
    const auditRef = collection(db, "auditLogs");
    const snap = await getDocs(auditRef);
    let logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    logs.sort((a, b) => {
      const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0);
      const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0);
      return timeB - timeA;
    });
    return logs.slice(0, limitCount);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
};

/**
 * Fetch company details by ID
 */
export const getCompanyDetails = async (companyId) => {
  try {
    const docRef = doc(db, "users", companyId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        ...data,
        position: data.position || data.title || "Job Position",
        companyName: data.companyName || data.company || "Hiring Company",
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching company details:", error);
    return null;
  }
};

/**
 * Super Admin: Moderate Job (Approve / Reject / Remove)
 */
export const moderateJob = async (jobId, action, reason = "", adminEmail = "admin@zensolve.in") => {
  try {
    const jobRef = doc(db, "jobs", jobId);
    if (action === "delete") {
      await deleteDoc(jobRef);
    } else {
      await updateDoc(jobRef, {
        moderationStatus: action, // 'Approved' | 'Rejected' | 'Removed'
        status: action === "Approved" ? "Active" : "Closed",
        moderationReason: reason,
        moderatedBy: adminEmail,
        moderatedAt: serverTimestamp(),
      });
    }

    await logAuditEvent("JOB_MODERATION", jobId, {
      action,
      reason,
      adminEmail,
    });

    return { success: true };
  } catch (error) {
    console.error("Error moderating job:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch reported listings or companies
 */
export const getPlatformReports = async () => {
  try {
    const reportsRef = collection(db, "reports");
    const snap = await getDocs(reportsRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
};

/**
 * Super Admin platform settings
 */
export const getPlatformSettings = async () => {
  try {
    const ref = doc(db, "platformSettings", "global");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
    return {
      autoApproveCompanies: false,
      jobModerationRequired: false,
      allowCandidateSignups: true,
      maintenanceMode: false,
      maxUploadSizeMb: 10,
    };
  } catch (error) {
    return {
      autoApproveCompanies: false,
      jobModerationRequired: false,
      allowCandidateSignups: true,
      maintenanceMode: false,
      maxUploadSizeMb: 10,
    };
  }
};

export const updatePlatformSettings = async (settings, adminEmail = "admin@zensolve.in") => {
  try {
    const ref = doc(db, "platformSettings", "global");
    await setDoc(ref, { ...settings, updatedAt: serverTimestamp(), updatedBy: adminEmail }, { merge: true });
    await logAuditEvent("SETTINGS_UPDATED", "global", { settings, adminEmail });
    return { success: true };
  } catch (error) {
    console.error("Error updating platform settings:", error);
    return { success: false, error: error.message };
  }
};
