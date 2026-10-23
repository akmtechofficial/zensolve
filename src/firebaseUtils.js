import { db } from './firebaseConfig'; // Import Firebase config
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

/**
 * Check if a job is saved by the current user
 * @param {string} userId - The current user ID
 * @param {string} jobId - The job ID to check
 * @returns {boolean} - Returns true if the job is saved by the user
 */
export const isJobSaved = async (userId, jobId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const savedJobs = userDoc.data().savedJobs || [];
      return savedJobs.includes(jobId); // Check if the job is in the saved jobs array
    }
    return false; // If user doesn't exist, return false
  } catch (error) {
    console.error('Error checking if job is saved: ', error);
    return false;
  }
};

/**
 * Save a job to the current user's saved jobs array
 * @param {string} userId - The current user ID
 * @param {string} jobId - The job ID to save
 */
export const saveJobToUser = async (userId, jobId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      savedJobs: arrayUnion(jobId), // Add job ID to saved jobs array
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving job to user: ', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove a saved job from the current user's saved jobs array
 * @param {string} userId - The current user ID
 * @param {string} jobId - The job ID to remove
 */
export const removeSavedJobFromUser = async (userId, jobId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      savedJobs: arrayRemove(jobId), // Remove job ID from saved jobs array
    });
    return { success: true };
  } catch (error) {
    console.error('Error removing saved job from user: ', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get the save count for a specific job
 * @param {string} jobId - The job ID to get the save count for
 * @returns {number} - Returns the save count for the job
 */
export const getSaveCountFromFirestore = async (jobId) => {
  try {
    const jobRef = doc(db, 'jobs', jobId);
    const jobDoc = await getDoc(jobRef);
    if (jobDoc.exists()) {
      return jobDoc.data().saveCount || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching save count: ', error);
    return 0;
  }
};

/**
 * Save a job's save count to Firestore
 * @param {string} jobId - The job ID to update the save count for
 * @param {number} saveCount - The updated save count
 */
export const saveJobToFirestore = async (jobId, saveCount) => {
  try {
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, { saveCount });
  } catch (error) {
    console.error('Error updating save count in Firestore: ', error);
  }
};
