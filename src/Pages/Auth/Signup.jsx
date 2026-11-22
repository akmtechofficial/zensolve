import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUserGraduate,
  FaBuilding,
  FaArrowRight,
  FaCheckCircle,
  FaShieldAlt,
  FaSpinner,
  FaBriefcase,
  FaFileAlt,
  FaUsers,
} from 'react-icons/fa';
import { signInWithGoogleProvider, getPostAuthRedirectUrl } from '../../services/authService';
import { useAuth } from '../../components/useAuth';

const Signup = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleGoogleQuickSignup = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogleProvider('candidate');
      if (res.cancelled) {
        setGoogleLoading(false);
        return;
      }
      if (res.redirecting) return;

      if (res.success) {
        await refreshUser();
        const dest = getPostAuthRedirectUrl(res.userData, res.user, '/candidate');
        navigate(dest, { replace: true });
      } else {
        setError(res.error || 'Google signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Google Quick Signup error:', err);
      setError(err.message || 'Failed to authenticate with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glows & Grid */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[500px] h-[350px] bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[300px] bg-violet-600/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 mask-radial pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto w-full">
        
        {/* Brand Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
            <div className="w-12 h-12 rounded-2xl bg-white p-0.5 border border-white/20 shadow-lg group-hover:border-indigo-400 transition-all overflow-hidden flex items-center justify-center">
              <img src="/zen.jpeg" alt="ZenSolve Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-bold text-2xl text-white tracking-tight">
              ZenSolve
            </span>
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 block w-max mx-auto mb-2.5">
            Registration Gateway
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            Create Your ZenSolve Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
            Choose your account type below to get started on India's premier multi-company employment and manpower ecosystem.
          </p>
        </div>

        {/* Error Alert if any */}
        {error && (
          <div className="mb-6 max-w-md mx-auto p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-2xl text-center">
            {error}
          </div>
        )}

        {/* Two Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Card 1: Candidate Account */}
          <div className="relative group rounded-3xl p-7 bg-slate-900/80 border border-white/10 hover:border-indigo-500/50 shadow-2xl backdrop-blur-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                <FaUserGraduate />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                  For Job Seekers
                </span>
                <h2 className="text-xl font-bold text-white font-display">
                  Candidate Account
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Search verified jobs, apply in 1-click using your saved or digital resume, and track interview progress in real-time.
                </p>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-slate-300 border-t border-white/5">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-400 text-xs flex-shrink-0" />
                  <span>1-Click easy apply with auto-saved resumes</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-400 text-xs flex-shrink-0" />
                  <span>Auto-generate digital CV from completed profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-400 text-xs flex-shrink-0" />
                  <span>100% free with verified company vacancies</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-3">
              <Link
                to="/signup/candidate"
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Sign Up as Candidate</span>
                <FaArrowRight className="text-xs" />
              </Link>

              {/* Instant Google button for candidates */}
              <button
                type="button"
                onClick={handleGoogleQuickSignup}
                disabled={googleLoading}
                className="w-full py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer"
              >
                {googleLoading ? (
                  <FaSpinner className="animate-spin text-slate-300" />
                ) : (
                  <>
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z" />
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.3.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z" />
                    </svg>
                    <span>Instant Sign-Up with Google</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Staffing & Manpower Agency */}
          <div className="relative group rounded-3xl p-7 bg-slate-900/80 border border-white/10 hover:border-violet-500/50 shadow-2xl backdrop-blur-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                <FaBuilding />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400 block mb-1">
                  For Staffing & Placement Firms
                </span>
                <h2 className="text-xl font-bold text-white font-display">
                  Manpower & Staffing Agency
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Post job openings for your client companies, manage recruitment pipelines, and supply verified manpower at scale.
                </p>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-slate-300 border-t border-white/5">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-violet-400 text-xs flex-shrink-0" />
                  <span>Multi-company client job posting engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-violet-400 text-xs flex-shrink-0" />
                  <span>Direct candidate applications & resume access</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-violet-400 text-xs flex-shrink-0" />
                  <span>Centralized HR management & status workflow</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                to="/signup/company"
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
              >
                <span>Register Staffing Agency</span>
                <FaArrowRight className="text-xs" />
              </Link>
            </div>
          </div>

        </div>

        {/* Footer: Link back to Sign In */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline">
              Sign In to Your Account →
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;
