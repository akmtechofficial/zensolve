import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { FaUser, FaEnvelope, FaComment, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const TestimonialsForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [review, setReview] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !review) {
      setError('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reviewData = { name, email, review };
      await addDoc(collection(db, 'testimonials'), reviewData);
      setSuccess('Your review has been submitted successfully!');
      setName('');
      setEmail('');
      setReview('');
    } catch (error) {
      setError('Failed to submit review. Please try again.');
      console.error('Error adding document: ', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center ">
      <form onSubmit={handleSubmit} className="p-8 w-full max-w-lg bg-white/70 backdrop-blur-md shadow-2xl rounded-2xl border border-white/40">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">🌟 Share Your Experience</h2>

        <div className="relative mb-6">
          <FaUser className="absolute left-4 top-3 text-gray-600" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 pl-12 rounded-xl bg-white shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Your Name"
            required
          />
        </div>

        <div className="relative mb-6">
          <FaEnvelope className="absolute left-4 top-3 text-gray-600" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 pl-12 rounded-xl bg-white shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Your Email"
            required
          />
        </div>

        <div className="relative mb-6">
          <FaComment className="absolute left-4 top-3 text-gray-600" />
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full p-4 pl-12 rounded-xl bg-white shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Your Review"
            rows="4"
            required
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-500 text-red-500 p-3 rounded-xl mb-4 flex items-center">
            <FaExclamationTriangle className="mr-2" /> {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-500 text-green-500 p-3 rounded-xl mb-4 flex items-center">
            <FaCheckCircle className="mr-2" /> {success}
          </div>
        )}

        <button
          type="submit"
          className={`w-full py-4 text-xl font-semibold text-white rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg ${
            isSubmitting ? 'cursor-not-allowed opacity-50' : ''
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? <FaSpinner className="animate-spin mx-auto" /> : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default TestimonialsForm;
