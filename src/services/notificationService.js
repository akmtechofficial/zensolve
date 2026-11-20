import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const MAX_DAILY_REMINDERS = 3;

/**
 * Gets formatted current date string (YYYY-MM-DD) in local time
 */
export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks remaining daily reminder quota for a company (Max 3 per day)
 */
export const getDailyReminderStatus = (uid, userData = null) => {
  const today = getTodayDateString();
  const storageKey = `zensolve_reminders_${uid}_${today}`;
  
  // Prefer Firestore userData if available and up-to-date, else localStorage
  let countToday = 0;
  if (userData?.lastReminderDate === today && typeof userData?.remindersSentToday === 'number') {
    countToday = userData.remindersSentToday;
  } else {
    const stored = window.localStorage.getItem(storageKey);
    countToday = stored ? parseInt(stored, 10) || 0 : 0;
  }

  const remaining = Math.max(0, MAX_DAILY_REMINDERS - countToday);
  const canSend = remaining > 0;

  return {
    canSend,
    countToday,
    remaining,
    maxLimit: MAX_DAILY_REMINDERS,
    today,
  };
};

/**
 * Dispatches initial company registration alert to ZenSolve Admin
 */
export const notifyAdminNewCompany = async (companyData) => {
  try {
    const response = await fetch('/api/notify-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn('Admin notification returned non-OK status:', err);
      return { success: false, error: err };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Failed to dispatch admin notification email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Resends expedited verification reminder email to ZenSolve Office with strict daily limit (Max 3 per day)
 */
export const resendVerificationReminder = async (companyData, userData = null) => {
  const uid = companyData.uid;
  if (!uid) {
    return { success: false, error: 'User UID is missing.' };
  }

  const { canSend, countToday, remaining } = getDailyReminderStatus(uid, userData);
  if (!canSend) {
    return {
      success: false,
      error: `Daily reminder limit reached (${MAX_DAILY_REMINDERS}/${MAX_DAILY_REMINDERS}). You have already sent 3 reminders today. Please allow our team time to review your profile.`,
      remaining: 0,
      countToday,
    };
  }

  const nextCount = countToday + 1;
  const today = getTodayDateString();
  const storageKey = `zensolve_reminders_${uid}_${today}`;

  try {
    const response = await fetch('/api/notify-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...companyData,
        isReminder: true,
        reminderCount: nextCount,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to dispatch reminder email to mail server.');
    }

    // Persist counter in localStorage
    window.localStorage.setItem(storageKey, nextCount.toString());

    // Persist counter in Firestore user document
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        lastReminderDate: today,
        remindersSentToday: nextCount,
        lastReminderSentAt: serverTimestamp(),
      });
    } catch (dbErr) {
      console.warn('Could not update reminder counter in Firestore:', dbErr);
    }

    return {
      success: true,
      message: `Reminder #${nextCount} sent successfully to ZenSolve Office (carezensolve@gmail.com).`,
      countToday: nextCount,
      remaining: MAX_DAILY_REMINDERS - nextCount,
    };
  } catch (error) {
    console.error('Failed to resend reminder email:', error);
    return {
      success: false,
      error: error.message || 'Unable to connect to the mail notification server.',
      countToday,
      remaining,
    };
  }
};
