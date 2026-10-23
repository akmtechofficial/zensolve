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
    const snapshot = await getDocs(jobsRef);
    let jobs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by active status by default for public users unless requested
    if (filters.onlyActive) {
      jobs = jobs.filter((job) => job.status === "Active" || !job.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          (job.position && job.position.toLowerCase().includes(q)) ||
          (job.companyName && job.companyName.toLowerCase().includes(q)) ||
          (job.location && job.location.toLowerCase().includes(q)) ||
          (job.category && job.category.toLowerCase().includes(q)) ||
          (job.description && job.description.toLowerCase().includes(q))
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

    if (filters.companyId) {
      jobs = jobs.filter((job) => job.companyId === filters.companyId);
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
      return { id: snap.id, ...snap.data() };
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
      verified: true,
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
      return { id: snap.id, ...snap.data() };
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
 */
export const checkExistingApplication = async (jobId, userId, applicantEmail) => {
  try {
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
 * Submit official job application
 */
export const submitJobApplication = async (applicationData) => {
  try {
    const { jobId, userId, applicantEmail } = applicationData;
    // Duplicate check
    const existing = await checkExistingApplication(jobId, userId, applicantEmail);
    if (existing) {
      return {
        success: false,
        isDuplicate: true,
        error: "You have already submitted an application for this position.",
        existingId: existing.id,
      };
    }

    const appsRef = collection(db, "jobApplications");
    const docRef = await addDoc(appsRef, {
      ...applicationData,
      status: "Applied",
      appliedAt: serverTimestamp(),
      statusTimeline: [
        {
          status: "Applied",
          timestamp: new Date().toISOString(),
          note: "Application submitted to employer recruitment queue",
        },
      ],
    });

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
 */
export const getCandidateApplications = async (userId, applicantEmail) => {
  try {
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
      return { id: snap.id, ...snap.data() };
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
 * Save private internal HR notes for candidate
 */
export const saveInternalNotes = async (applicationId, internalNotes) => {
  try {
    const appRef = doc(db, "jobApplications", applicationId);
    await updateDoc(appRef, {
      internalNotes,
      internalNotesUpdatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving internal notes:", error);
    return { success: false, error: error.message };
  }
};

/* =========================================================================
   4. COMPANY PROFILE & APPROVALS
   ========================================================================= */

/**
 * Fetch distinct companies or registered company documents
 */
export const getCompanies = async () => {
  try {
    // 1. Fetch from 'companies' or 'users' collection with role 'company' / 'employer'
    const usersRef = collection(db, "users");
    const userSnap = await getDocs(usersRef);
    const registeredCompanies = userSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((u) => u.role === "company" || u.role === "employer");

    // 2. Fetch all jobs to gather company activity
    const jobs = await getJobs();
    const companyMap = new Map();

    // Map registered companies first
    registeredCompanies.forEach((comp) => {
      const name = comp.companyName || comp.displayName || "Partner Organization";
      companyMap.set(name.trim().toLowerCase(), {
        id: comp.id,
        name: comp.companyName || comp.displayName,
        logo: comp.logo || comp.companyLogo || "/zen.jpeg",
        location: comp.location || "India",
        industry: comp.industry || "Technology",
        companyType: comp.companyType || "Private Limited",
        website: comp.website || "",
        hrName: comp.hrName || comp.name || "HR Team",
        businessEmail: comp.email || comp.businessEmail || "",
        phone: comp.phone || comp.mobileNumber || "",
        about: comp.description || comp.about || "Verified hiring partner on ZenSolve.",
        status: comp.status || (comp.approved ? "approved" : "pending"),
        approved: comp.approved === true || comp.status === "approved",
        openRolesCount: 0,
        verified: comp.approved === true,
        rating: comp.rating || 4.8,
        createdAt: comp.createdAt,
      });
    });

    // Count published jobs
    jobs.forEach((job) => {
      if (job.companyName) {
        const key = job.companyName.trim().toLowerCase();
        if (companyMap.has(key)) {
          const c = companyMap.get(key);
          c.openRolesCount += 1;
        } else {
          companyMap.set(key, {
            id: job.companyId || `comp-${key}`,
            name: job.companyName.trim(),
            logo: job.companyLogo || "/zen.jpeg",
            location: job.location || "India",
            industry: job.category || "Technology",
            openRolesCount: 1,
            verified: job.verified !== false,
            approved: true,
            status: "approved",
            rating: job.rating || 4.8,
            about: `Hiring employer in ${job.category || "technology & services"}.`,
          });
        }
      }
    });

    return Array.from(companyMap.values());
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
export const updateCompanyApproval = async (companyId, status, decisionNote = "", adminEmail = "admin@zensolve.com") => {
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

    // Also record audit event
    await logAuditEvent("COMPANY_STATUS_UPDATE", companyId, {
      newStatus: status,
      decisionNote,
      adminEmail,
    });

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
export const toggleUserSuspension = async (userId, isSuspended, adminEmail = "admin@zensolve.com") => {
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
      return { id: snap.id, ...snap.data() };
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
export const moderateJob = async (jobId, action, reason = "", adminEmail = "admin@zensolve.com") => {
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

export const updatePlatformSettings = async (settings, adminEmail = "admin@zensolve.com") => {
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
