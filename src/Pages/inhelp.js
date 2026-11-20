// inhelp.js
import { db } from '../firebaseConfig'; // Import Firestore config
import { collection, addDoc } from 'firebase/firestore';

/**
 * Function to save contact form details to Firestore.
 * @param {Object} formData - The contact form data.
 * @returns {Promise} - Promise indicating success or failure.
 */
export const saveContactDetails = async (formData) => {
  try {
    // Add form data to Firestore collection "contactMessages"
    await addDoc(collection(db, 'contactMessages'), {
      ...formData,
      createdAt: new Date(),
    });
    return { success: true, message: 'Your message has been sent successfully!' };
  } catch (error) {
    console.error('Error saving contact details: ', error);
    return { success: false, message: 'Failed to send message. Please try again later.' };
  }
};
