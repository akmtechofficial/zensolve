import React, { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useAuth } from '../../components/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaShieldAlt, FaSpinner } from 'react-icons/fa';

const VerifyEmail = () => {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!auth.currentUser) {
      setError('Please sign in first to verify your email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendEmailVerification(auth.currentUser);
      setSent(true);
    } catch (err) {
      console.error('Email verification error:', err);
      setError(err.message || 'Failed to send verification link. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center py-16 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background Lighting & Glass Accents */}
      <div className="absolute inset-0 bg-radial-gradient-dark pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 p-1 shadow-lg shadow-indigo-500/20 group-hover:border-indigo-500/50 transition-all flex items-center justify-center overflow-hidden">
              <img src="/zen.jpeg" alt="ZenSolve Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-2xl text-white tracking-tight block">
                ZenSolve
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-400 block">
                Security Gateway
              </span>
            </div>
          </Link>
          <h2 className="text-2xl font-extrabold text-white tracking-tight font-display mt-6">
            Verify Your Email
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
            We require verified email addresses to safeguard candidate credentials and corporate recruitment authorizations.
          </p>
        </div>

        {/* Card */}
        <div className="glass-dark-card-elevated glass-specular-dark p-7 sm:p-9 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-3xl mx-auto shadow-lg">
            <FaEnvelope />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 space-y-1.5 text-center">
            <span className="font-medium text-slate-400 block">Current Account:</span>
            <span className="font-mono text-indigo-300 font-semibold block text-sm">
              {user?.email || 'Logged In Account'}
            </span>
          </div>

          {sent && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <FaCheckCircle className="flex-shrink-0" />
              <span>A new verification link has been sent to your inbox.</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <FaExclamationTriangle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleResend}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin" /> : 'Resend Verification Email'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition"
            >
              Back to Login
            </button>
          </div>
        </div>

        {/* Security watermark */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-6">
          <FaShieldAlt className="text-emerald-400" />
          <span>Secured by Firebase Enterprise Authentication</span>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
