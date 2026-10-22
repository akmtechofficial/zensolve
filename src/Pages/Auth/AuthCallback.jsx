import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  completeEmailLinkSignIn,
  validateEmail,
  getPostAuthRedirectUrl,
} from '../../services/authService';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaEnvelope,
  FaArrowRight,
  FaShieldAlt,
  FaRedo,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AuthCallback = () => {
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'needEmail' | 'success' | 'error'
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const processingRef = useRef(false);

  // Extract explicit returnUrl if passed in query string
  const queryParams = new URLSearchParams(location.search);
  const returnUrl = queryParams.get('returnUrl');

  const executeSignIn = async (emailToUse = null) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await completeEmailLinkSignIn(emailToUse);

      if (res.requiresEmailInput) {
        setStatus('needEmail');
        if (res.error) setErrorMsg(res.error);
        setLoading(false);
        return;
      }

      if (res.success) {
        setStatus('success');
        const targetUrl = getPostAuthRedirectUrl(res.userData, res.user, returnUrl);
        setDestination(targetUrl);
        // Brief pleasant pause for visual confirmation before transition
        setTimeout(() => {
          navigate(targetUrl, { replace: true });
        }, 1200);
      } else {
        setStatus('error');
        setErrorMsg(res.error || 'Failed to authenticate using this link.');
      }
    } catch (err) {
      console.error('Callback error:', err);
      setStatus('error');
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (processingRef.current) return;
    processingRef.current = true;

    executeSignIn();
  }, []);

  const handleManualEmailSubmit = (e) => {
    e.preventDefault();
    const validation = validateEmail(emailInput);
    if (!validation.valid) {
      setErrorMsg(validation.error);
      return;
    }
    executeSignIn(validation.email);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center py-16 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background Lighting & Glass Accents */}
      <div className="absolute inset-0 bg-radial-gradient-dark pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Grid pattern overlay */}
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
        </div>

        {/* Dynamic Glass State Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-dark-card glass-specular-dark rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl relative"
        >
          <AnimatePresence mode="wait">
            {/* 1. Verifying State */}
            {status === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6 space-y-5"
              >
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl">
                    <FaSpinner className="animate-spin text-indigo-400 text-2xl" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-white tracking-tight">
                    Authenticating Session
                  </h2>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Verifying cryptographic credentials and configuring your recruitment console...
                  </p>
                </div>
              </motion.div>
            )}

            {/* 2. Need Email Confirmation (Cross-device / In-app browser) */}
            {status === 'needEmail' && (
              <motion.div
                key="needEmail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-2xl mx-auto mb-4">
                    <FaEnvelope />
                  </div>
                  <h2 className="text-xl font-bold font-display text-white tracking-tight">
                    Confirm Your Email
                  </h2>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    It looks like you opened this link on a new device or in private browsing. Please enter your email address to complete verification.
                  </p>
                </div>

                <form onSubmit={handleManualEmailSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">
                      Your Email Address
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none" />
                      <input
                        type="email"
                        required
                        autoFocus
                        placeholder="you@domain.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl glass-dark-input text-sm text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2.5">
                      <FaExclamationTriangle className="flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>
                        <span>Complete Sign-In</span>
                        <FaArrowRight className="text-xs" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* 3. Success State */}
            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6 space-y-5"
              >
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl">
                    <FaCheckCircle />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-white tracking-tight">
                    Authenticated Successfully
                  </h2>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Identity confirmed. Navigating to your secure portal...
                  </p>
                </div>
                <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full w-full animate-[shimmer_1.5s_infinite]" />
                </div>
              </motion.div>
            )}

            {/* 4. Error State */}
            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4 space-y-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-2xl mx-auto">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-white tracking-tight">
                    Link Invalid or Expired
                  </h2>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {errorMsg || 'This sign-in link is no longer valid or has already been consumed. For security reasons, authentication links can only be used once.'}
                  </p>
                </div>

                <div className="pt-2 space-y-3">
                  <Link
                    to="/login"
                    className="w-full py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/25"
                  >
                    <FaRedo className="text-xs" />
                    <span>Request a New Magic Link</span>
                  </Link>

                  <Link
                    to="/"
                    className="block text-xs text-slate-400 hover:text-white transition"
                  >
                    Return to Homepage
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Security watermark */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-6">
          <FaShieldAlt className="text-emerald-400" />
          <span>ZenSolve Cryptographic Token Verification</span>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
