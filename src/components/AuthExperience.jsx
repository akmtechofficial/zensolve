import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  sendPasswordlessEmailLink,
  signInWithGoogleProvider,
  checkGoogleRedirectResult,
  signInWithPasswordFallback,
  validateEmail,
  getPostAuthRedirectUrl,
} from '../services/authService';
import { useAuth } from './useAuth';
import {
  FaEnvelope,
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowRight,
  FaArrowLeft,
  FaShieldAlt,
  FaUserGraduate,
  FaBuilding,
  FaExternalLinkAlt,
  FaRedo,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const RESEND_COOLDOWN_SECONDS = 60;

export const AuthExperience = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [role, setRole] = useState('candidate'); // 'candidate' | 'company'
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [inlineEmailError, setInlineEmailError] = useState(null);

  // States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [linkSent, setLinkSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Password fallback toggle
  const [showPasswordFallback, setShowPasswordFallback] = useState(false);
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData, loading: authLoading } = useAuth();

  // Handle returnUrl parameter
  const queryParams = new URLSearchParams(location.search);
  const returnUrl = queryParams.get('returnUrl') || location.state?.from?.pathname || null;

  // Auto redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && userData) {
      const dest = getPostAuthRedirectUrl(userData, user, returnUrl);
      navigate(dest, { replace: true });
    }
  }, [user, userData, authLoading, navigate, returnUrl]);

  // Check for Google redirect result upon initial mount
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const res = await checkGoogleRedirectResult();
        if (res && res.success) {
          const dest = getPostAuthRedirectUrl(res.userData, res.user, returnUrl);
          navigate(dest, { replace: true });
        }
      } catch (err) {
        console.error('Redirect sign-in resolution error:', err);
      }
    };
    handleRedirect();
  }, [navigate, returnUrl]);

  // Handle Resend Cooldown Countdown Timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Real-time Email Syntax Validation
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (emailTouched) {
      if (!val) {
        setInlineEmailError('Email is required.');
      } else {
        const res = validateEmail(val);
        setInlineEmailError(res.valid ? null : res.error);
      }
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    if (!email) {
      setInlineEmailError('Email is required.');
    } else {
      const res = validateEmail(email);
      setInlineEmailError(res.valid ? null : res.error);
    }
  };

  const isEmailValid = email && !inlineEmailError && validateEmail(email).valid;

  // Submit Passwordless Magic Link
  const handleSendMagicLink = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setEmailTouched(true);

    const validation = validateEmail(email);
    if (!validation.valid) {
      setInlineEmailError(validation.error);
      return;
    }

    setLoading(true);
    try {
      await sendPasswordlessEmailLink(validation.email, role, returnUrl);
      setSentToEmail(validation.email);
      setLinkSent(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      console.error('Magic link dispatch error:', err);
      setError(err.message || 'Failed to send sign-in link.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Magic Link Handler
  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setError(null);
    setLoading(true);
    try {
      await sendPasswordlessEmailLink(sentToEmail, role, returnUrl);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err.message || 'Failed to resend link.');
    } finally {
      setLoading(false);
    }
  };

  // Google Authentication Handler
  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogleProvider(role);
      if (res.cancelled) {
        setGoogleLoading(false);
        return;
      }
      if (res.redirecting) {
        // Browser is performing full page redirect
        return;
      }
      if (res.success) {
        const dest = getPostAuthRedirectUrl(res.userData, res.user, returnUrl);
        navigate(dest, { replace: true });
      } else {
        setError(res.error || 'Google authentication failed.');
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Failed to authenticate with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Password Fallback Login Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signInWithPasswordFallback(email, password);
      if (res.success) {
        const dest = getPostAuthRedirectUrl(res.userData, res.user, returnUrl);
        navigate(dest, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in with password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-indigo-600 selection:text-white">
      {/* =========================================================================
          BACKGROUND AMBIENCE & LIGHTING
          ========================================================================= */}
      <div className="absolute inset-0 bg-radial-gradient-dark pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[400px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Subtle Matrix / Dot Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.07] pointer-events-none" />

      {/* Top Floating Mini Header */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex items-center justify-between relative z-20">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-900 border border-white/10 p-1 shadow-md shadow-indigo-500/20 group-hover:border-indigo-500/50 transition-all flex items-center justify-center overflow-hidden">
            <img src="/zen.jpeg" alt="ZenSolve" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg sm:text-xl text-white tracking-tight flex items-center gap-1.5">
              ZenSolve
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Nexus
              </span>
            </span>
          </div>
        </Link>

        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition py-1.5 px-3 rounded-xl glass-dark-subtle hover:border-white/20"
        >
          <span>Explore Job Directory</span>
          <FaExternalLinkAlt className="text-[10px] text-slate-500" />
        </Link>
      </div>

      {/* =========================================================================
          MAIN AUTHENTICATION WORKSPACE (2-COLUMN ON DESKTOP)
          ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center relative z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* =======================================================================
              LEFT PANEL: BRAND IDENTITY & IMMERSIVE EDITORIAL ARTWORK (DESKTOP)
              ======================================================================= */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-4">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-dark-pill text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Enterprise Recruitment & Intelligence Platform</span>
              </div>

              <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight font-display leading-[1.15]">
                Where elite talent and visionary companies connect.
              </h1>

              <p className="text-slate-400 text-sm xl:text-base leading-relaxed max-w-lg">
                Experience frictionless passwordless authentication. Access verified executive opportunities, high-throughput ATS candidate pipelines, and real-time recruitment telemetry.
              </p>
            </div>

            {/* Artwork Frame with Bezel & Glow */}
            <div className="relative group rounded-3xl p-1 bg-gradient-to-b from-white/15 via-white/5 to-transparent border border-white/10 shadow-2xl shadow-indigo-950/50 overflow-hidden">
              <div className="relative aspect-[4/3] rounded-[22px] overflow-hidden">
                <img
                  src="/images/auth_artwork.jpg"
                  alt="ZenSolve Talent Nexus"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Gradient dark scrim for readable badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090E]/90 via-[#07090E]/30 to-transparent pointer-events-none" />

                {/* Live Feature Chips */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 rounded-xl glass-dark-card border border-white/10 text-[11px] font-medium text-slate-200 flex items-center gap-1.5 shadow-lg">
                    <span className="text-indigo-400">⚡</span>
                    <span>Zero-Password Security</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl glass-dark-card border border-white/10 text-[11px] font-medium text-slate-200 flex items-center gap-1.5 shadow-lg">
                    <span className="text-emerald-400">🛡️</span>
                    <span>Firebase Enterprise Auth</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl glass-dark-card border border-white/10 text-[11px] font-medium text-slate-200 flex items-center gap-1.5 shadow-lg">
                    <span className="text-cyan-400">🎯</span>
                    <span>Role-Intelligent Routing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recruitment Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/5">
              <div>
                <span className="font-display font-bold text-xl text-white block">14,800+</span>
                <span className="text-[11px] text-slate-400 block">Active Candidates</span>
              </div>
              <div>
                <span className="font-display font-bold text-xl text-indigo-400 block">98.4%</span>
                <span className="text-[11px] text-slate-400 block">Match Reliability</span>
              </div>
              <div>
                <span className="font-display font-bold text-xl text-emerald-400 block">450+</span>
                <span className="text-[11px] text-slate-400 block">Verified Companies</span>
              </div>
            </div>

          </div>

          {/* =======================================================================
              RIGHT PANEL: AUTHENTICATION CONSOLE (GLASSMORPHIC)
              ======================================================================= */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            
            {/* The Glass Console Card */}
            <div className="glass-dark-card-elevated glass-specular-dark rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative">
              
              {/* Segmented Mode Switcher: Sign In vs Create Account */}
              {!linkSent && (
                <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900/80 border border-white/10 mb-6 shadow-inner">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className={`py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      mode === 'login'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className={`py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      mode === 'signup'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              {/* View 1: Link Sent / Check Your Inbox View */}
              {linkSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 text-center py-2"
                >
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl shadow-lg">
                      <FaEnvelope />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold font-display text-white tracking-tight">
                      Check your inbox
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                      We've sent a secure passwordless sign-in link to:
                    </p>
                    <div className="mt-2.5 inline-block px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-indigo-300 font-mono text-xs sm:text-sm font-semibold">
                      {sentToEmail}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                      Open the link in your email to authenticate immediately. No password required. Link is valid for 15 minutes.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2 text-left">
                      <FaExclamationTriangle className="flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Resend & Action Buttons */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={cooldown > 0 || loading}
                      className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <>
                          <FaRedo className="text-[11px]" />
                          <span>
                            {cooldown > 0 ? `Resend link in ${cooldown}s` : 'Resend sign-in link'}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Quick Webmail Helpers */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href="https://mail.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 text-[11px] text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition"
                      >
                        <span>Open Gmail</span>
                        <FaExternalLinkAlt className="text-[9px] text-slate-500" />
                      </a>
                      <a
                        href="https://outlook.live.com"
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 text-[11px] text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition"
                      >
                        <span>Open Outlook</span>
                        <FaExternalLinkAlt className="text-[9px] text-slate-500" />
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setLinkSent(false);
                        setError(null);
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium block mx-auto pt-2 hover:underline"
                    >
                      Change email address or sign in differently
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* View 2: Primary Authentication Form */
                <div className="space-y-5">
                  
                  {/* Account Creation Role Picker (When in Signup Mode) */}
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 block">
                        I want to join ZenSolve as:
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setRole('candidate')}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            role === 'candidate'
                              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                              : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <FaUserGraduate className={role === 'candidate' ? 'text-indigo-400' : 'text-slate-500'} />
                            <span className="font-bold text-xs sm:text-sm text-white">Candidate</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block leading-tight">
                            Find jobs & bookmark roles
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRole('company')}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            role === 'company'
                              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                              : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <FaBuilding className={role === 'company' ? 'text-indigo-400' : 'text-slate-500'} />
                            <span className="font-bold text-xs sm:text-sm text-white">Company / HR</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block leading-tight">
                            Post vacancies & hire talent
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Google Sign-In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                    className="w-full py-3 px-4 rounded-2xl glass-dark-btn-google flex items-center justify-center gap-3 font-semibold text-xs sm:text-sm shadow-md"
                  >
                    {googleLoading ? (
                      <FaSpinner className="animate-spin text-slate-300" />
                    ) : (
                      <>
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#EA4335"
                            d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.9l3.7-2.9z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                          />
                        </svg>
                        <span>
                          {mode === 'login' ? 'Continue with Google' : 'Sign Up with Google'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Aesthetic Divider */}
                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-white/10 w-full" />
                    <span className="bg-[#0D1324] px-3 text-[11px] text-slate-400 uppercase tracking-wider whitespace-nowrap font-medium">
                      or with secure email
                    </span>
                    <div className="border-t border-white/10 w-full" />
                  </div>

                  {/* Primary Passwordless Email Form */}
                  <form onSubmit={handleSendMagicLink} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-slate-300">
                          Work or Personal Email
                        </label>
                        {isEmailValid && (
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                            <FaCheck size={9} /> Valid format
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none" />
                        <input
                          type="email"
                          placeholder="name@company.com"
                          value={email}
                          onChange={handleEmailChange}
                          onBlur={handleEmailBlur}
                          required
                          className={`w-full pl-11 pr-4 py-3 rounded-2xl glass-dark-input text-sm text-white placeholder:text-slate-500 ${
                            inlineEmailError ? 'border-rose-500/60 focus:border-rose-500' : ''
                          }`}
                        />
                      </div>

                      {inlineEmailError && (
                        <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1.5">
                          <FaExclamationTriangle size={10} className="flex-shrink-0" />
                          <span>{inlineEmailError}</span>
                        </p>
                      )}
                    </div>

                    {error && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                        <FaExclamationTriangle className="flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Magic Link Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || googleLoading}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 active:scale-[0.99]"
                    >
                      {loading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <>
                          <span>
                            {mode === 'login'
                              ? 'Send Magic Sign-In Link'
                              : 'Send Account Activation Link'}
                          </span>
                          <FaArrowRight className="text-xs" />
                        </>
                      )}
                    </button>
                    
                    <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                      🔒 Passwordless sign-in eliminates credential theft. We send a verified authentication link to your inbox.
                    </p>
                  </form>

                  {/* Password Fallback Accordion */}
                  <div className="pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowPasswordFallback(!showPasswordFallback)}
                      className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition py-1"
                    >
                      <span className="font-medium">
                        {showPasswordFallback ? 'Hide password sign-in' : 'Sign in with password instead'}
                      </span>
                      {showPasswordFallback ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                    </button>

                    <AnimatePresence>
                      {showPasswordFallback && (
                        <motion.form
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          onSubmit={handlePasswordSubmit}
                          className="space-y-3 pt-3 overflow-hidden"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-medium text-slate-300">
                                Password
                              </label>
                              <Link
                                to="/forgot-password"
                                className="text-[11px] text-indigo-400 hover:underline"
                              >
                                Forgot password?
                              </Link>
                            </div>
                            <div className="relative">
                              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none" />
                              <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-dark-input text-sm text-white placeholder:text-slate-500"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-semibold text-xs transition"
                          >
                            Sign In with Password
                          </button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Alternative Traditional Signup Link */}
                  {mode === 'signup' && (
                    <div className="pt-2 text-center text-[11px] text-slate-400 space-y-1">
                      <span>Prefer multi-step registration? </span>
                      <div className="flex justify-center gap-3 pt-0.5">
                        <Link to="/signup/candidate" className="text-indigo-400 hover:underline">
                          Candidate Full Form
                        </Link>
                        <span>•</span>
                        <Link to="/signup/company" className="text-indigo-400 hover:underline">
                          Company Enterprise Form
                        </Link>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-6">
              <FaShieldAlt className="text-emerald-400 text-xs" />
              <span>Protected by Firebase Authentication & 256-Bit SSL</span>
            </div>

          </div>

        </div>
      </main>

      {/* Footer Navigation Info */}
      <footer className="w-full py-4 px-4 text-center text-xs text-slate-500 relative z-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} ZenSolve Technologies. All rights reserved.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/contactus" className="hover:text-white transition">Contact Support</Link>
            <span>•</span>
            <Link to="/companies" className="hover:text-white transition">Verified Employers</Link>
            <span>•</span>
            <Link to="/jobs" className="hover:text-white transition">Browse Careers</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthExperience;
