import React, { useState } from 'react';
import { subscribeToNewsletter } from '../services/newsletterService';
import { FaEnvelope, FaPaperPlane, FaCheckCircle, FaSpinner, FaExclamationCircle } from 'react-icons/fa';

const NewsletterSubscribe = ({ source = 'footer', variant = 'default' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    const res = await subscribeToNewsletter(email, source);
    setLoading(false);

    if (res.success) {
      setMessage(res.message);
      setEmail('');
    } else {
      setError(res.error || 'Failed to subscribe. Please try again.');
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full">
            <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter your email address..."
              required
              disabled={loading}
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin text-xs" />
                <span>Subscribing...</span>
              </>
            ) : (
              <>
                <span>Subscribe</span>
                <FaPaperPlane className="text-[10px]" />
              </>
            )}
          </button>
        </div>

        {message && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-1.5 animate-fadeIn">
            <FaCheckCircle className="text-emerald-600 text-xs shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium flex items-center gap-1.5">
            <FaExclamationCircle className="text-rose-500 text-xs shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>
      <p className="text-[10px] text-slate-400 mt-1.5 text-center sm:text-left">
        No spam ever. Unsubscribe at any time with a single click.
      </p>
    </div>
  );
};

export default NewsletterSubscribe;
