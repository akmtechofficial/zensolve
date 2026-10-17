import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Fetch all jobs from Firestore with optional client/server filtering
 */
export const getJobs = async (filters = {}) => {
  try {
    const jobsRef = collection(db, "jobs");
    const snapshot = await getDocs(jobsRef);
    let jobs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply filtering
    if (filters.search) {
      const q = filters.search.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          (job.position && job.position.toLowerCase().includes(q)) ||
          (job.companyName && job.companyName.toLowerCase().includes(q)) ||
          (job.location && job.location.toLowerCase().includes(q)) ||
          (job.category && job.category.toLowerCase().includes(q))
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
      status: "Active",
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

/**
 * Get all applications (optionally filtered by jobId or companyName)
 */
export const getJobApplications = async ({ jobId, companyName } = {}) => {
  try {
    const appsRef = collection(db, "jobApplications");
    const snapshot = await getDocs(appsRef);
    let apps = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (jobId) {
      apps = apps.filter((a) => a.jobId === jobId);
    }
    if (companyName) {
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
 * Update application status (Pending, Reviewed, Shortlisted, Rejected, Hired)
 */
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const appRef = doc(db, "jobApplications", applicationId);
    await updateDoc(appRef, {
      status,
      statusUpdatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating application status:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch distinct companies from published jobs and companyLogos collection
 */
export const getCompanies = async () => {
  try {
    const jobs = await getJobs();
    const companyMap = new Map();

    jobs.forEach((job) => {
      if (job.companyName) {
        const key = job.companyName.trim();
        if (!companyMap.has(key)) {
          companyMap.set(key, {
            name: key,
            logo: job.companyLogo || "/logo192.png",
            location: job.location || "India",
            industry: job.category || "Technology",
            openRolesCount: 1,
            verified: job.verified !== false,
            rating: job.rating || 4.8,
            about: `Leading employer in ${job.category || "technology & services"}. Committed to career excellence and workforce innovation.`,
          });
        } else {
          const comp = companyMap.get(key);
          comp.openRolesCount += 1;
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

    // Fetch all jobs and match
    const allJobs = await getJobs();
    return allJobs.filter((j) => savedJobIds.includes(j.id));
  } catch (error) {
    console.error("Error fetching user saved jobs:", error);
    return [];
  }
};
