/**
 * Client-side email notification service for ZenSolve
 * Dispatches requests to /api/send-email serverless function
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Send an email notification through serverless API
 * @param {string} type - 'NEW_APPLICATION' | 'NEW_COMPANY' | 'NEW_JOB' | 'NEWSLETTER_WELCOME'
 * @param {object} payload - email data
 */
export const sendPlatformEmail = async (type, payload) => {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, payload }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn(`[emailService] ${type} notification returned non-200:`, errData);
      return { success: false, error: errData.error || 'Server returned error' };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error(`[emailService] Failed to dispatch ${type} email:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * 1. Notify company when a candidate applies
 */
export const notifyCompanyOfApplication = async ({
  job,
  applicantName,
  applicantEmail,
  applicantPhone,
  isDigitalProfile,
  notes,
}) => {
  try {
    let companyEmail = job.companyEmail || job.postedBy;

    // If company email not directly on job, lookup company user document
    if (!companyEmail && job.companyId) {
      try {
        const compSnap = await getDoc(doc(db, 'users', job.companyId));
        if (compSnap.exists()) {
          const compData = compSnap.data();
          companyEmail = compData.email || compData.businessEmail || compData.contactEmail;
        }
      } catch (lookupErr) {
        console.warn('[emailService] Company email lookup note:', lookupErr);
      }
    }

    return await sendPlatformEmail('NEW_APPLICATION', {
      companyEmail: companyEmail || 'carezensolve@gmail.com',
      companyName: job.companyName || 'Your Agency',
      clientCompanyName: job.clientCompanyName || '',
      applicantName,
      applicantEmail,
      applicantPhone,
      jobPosition: job.position,
      jobId: job.id,
      isDigitalProfile,
      notes,
    });
  } catch (err) {
    console.error('[emailService] notifyCompanyOfApplication error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * 2. Notify Admin when a new company registers
 */
export const notifyAdminOfNewCompany = async (companyData) => {
  return await sendPlatformEmail('NEW_COMPANY', companyData);
};

/**
 * 3. Notify Admin when a company posts a new job
 */
export const notifyAdminOfNewJob = async (jobData) => {
  return await sendPlatformEmail('NEW_JOB', jobData);
};

/**
 * 4. Send welcome email to newsletter subscriber
 */
export const sendNewsletterWelcome = async (email) => {
  return await sendPlatformEmail('NEWSLETTER_WELCOME', { email });
};
