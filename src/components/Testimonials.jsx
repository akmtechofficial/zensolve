import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FaStar, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaPen } from 'react-icons/fa';
import { Button } from './ui/Button';

const TestimonialsForm = ({ onReviewSubmitted }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [review, setReview] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !review) {
      setError('Please provide your name, email, and feedback.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'testimonials'), {
        name,
        email,
        review,
        role: role || 'Candidate',
        rating: Number(rating),
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setName('');
      setEmail('');
      setReview('');
      setRole('');
      if (onReviewSubmitted) onReviewSubmitted();
      setTimeout(() => {
        setSuccess(false);
        setIsExpanded(false);
      }, 2500);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {!isExpanded ? (
        <div className="text-center py-4">
          <Button
            variant="outline"
            size="md"
            icon={<FaPen className="text-xs text-indigo-400" />}
            onClick={() => setIsExpanded(true)}
            className="text-xs sm:text-sm"
          >
            Share Your Experience with ZenSolve
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white/90 shadow-xl space-y-4 text-left transition-all"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-lg font-bold text-slate-900">Share Your Hiring Experience</h4>
              <p className="text-xs text-slate-500">Your feedback helps job seekers and employers connect better.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-xs text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priya@example.com"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Your Role / Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
              >
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Exceptional</option>
                <option value="4">⭐⭐⭐⭐ 4 Stars - Very Good</option>
                <option value="3">⭐⭐⭐ 3 Stars - Good</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Feedback / Review</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows="3"
              placeholder="Tell us about the application process, interview quality, or hiring experience..."
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <FaCheckCircle />
              <span>Thank you! Your testimonial has been submitted.</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            className="w-full shadow-md shadow-indigo-500/10"
          >
            Submit Testimonial
          </Button>
        </form>
      )}
    </div>
  );
};

export default TestimonialsForm;
