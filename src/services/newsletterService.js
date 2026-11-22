/**
 * Newsletter subscription management service
 */
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { sendNewsletterWelcome } from './emailService';

export const validateNewsletterEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    return { valid: false, error: 'Please provide a valid email format (e.g. name@example.com).' };
  }
  return { valid: true, email: clean };
};

/**
 * Subscribes an email to the ZenSolve Career Newsletter
 * @param {string} email
 * @param {string} source - e.g. 'footer' | 'homepage'
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 */
export const subscribeToNewsletter = async (email, source = 'footer') => {
  try {
    const validation = validateNewsletterEmail(email);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const cleanEmail = validation.email;
    const subsRef = collection(db, 'newsletterSubscribers');

    // Check if already subscribed
    const q = query(subsRef, where('email', '==', cleanEmail));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return {
        success: true,
        alreadySubscribed: true,
        message: "You're already subscribed to our newsletter! We'll keep sending you top career alerts.",
      };
    }

    // Save new subscriber to Firestore
    await addDoc(subsRef, {
      email: cleanEmail,
      source,
      subscribedAt: serverTimestamp(),
      active: true,
    });

    // Send warm welcome email in background
    sendNewsletterWelcome(cleanEmail).catch((err) => {
      console.warn('Background welcome email notice:', err);
    });

    return {
      success: true,
      message: 'Thank you for subscribing! Check your inbox for the latest job alerts and career updates.',
    };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return {
      success: false,
      error: error.message || 'Failed to complete subscription. Please try again.',
    };
  }
};
