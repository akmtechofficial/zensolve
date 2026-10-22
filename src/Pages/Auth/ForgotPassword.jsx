import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaShieldAlt, FaSpinner } from 'react-icons/fa';
import { validateEmail } from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    const validation = validateEmail(email);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, validation.email);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError(err.message || 'Failed to send password reset email.');
      }
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
                Account Recovery
              </span>
            </div>
          </Link>
          <h2 className="text-2xl font-extrabold text-white tracking-tight font-display mt-6">
            Reset Your Password
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
            Enter your registered email address and we'll send you official instructions to configure a new password.
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-dark-card-elevated glass-specular-dark p-7 sm:p-9 rounded-3xl border border-white/10 shadow-2xl">
          {success ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
                <FaCheckCircle />
              </div>
              <h3 className="text-xl font-bold font-display text-white">Check Your Inbox</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A password reset authorization has been dispatched to{' '}
                <strong className="text-indigo-300 font-mono">{email}</strong>. Please check your inbox and follow the link to reset your password.
              </p>
              <div className="pt-3">
                <Link
                  to="/login"
                  className="w-full py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30"
                >
                  <FaArrowLeft className="text-[10px]" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl glass-dark-input text-sm text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                  <FaExclamationTriangle className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? <FaSpinner className="animate-spin" /> : 'Send Reset Link'}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
                >
                  <FaArrowLeft className="text-[10px]" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
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

export default ForgotPassword;
