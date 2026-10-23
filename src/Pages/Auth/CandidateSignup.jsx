import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaBriefcase,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowRight,
} from 'react-icons/fa';
import { Button } from '../../components/ui/Button';

import { useAuth } from '../../components/useAuth';

const CandidateSignup = () => {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    headline: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      window.localStorage.setItem('pendingAuthRole', 'candidate');

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: formData.fullName,
      });

      // Save candidate profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: formData.fullName,
        email: formData.email,
        phone: formData.phone || '',
        headline: formData.headline || 'Job Seeker',
        role: 'candidate',
        savedJobs: [],
        skills: [],
        education: [],
        experience: [],
        createdAt: serverTimestamp(),
      });

      await refreshUser();
      window.localStorage.removeItem('pendingAuthRole');

      // Redirect immediately to candidate dashboard
      navigate('/candidate', { replace: true });
    } catch (err) {
      console.error('Candidate registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered. Please login.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Include a mix of letters and numbers.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glass Texture & Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] bg-cover bg-center mix-blend-multiply z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 mask-radial pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white p-0.5 border border-slate-200 shadow-sm group-hover:border-indigo-400 transition-all overflow-hidden flex items-center justify-center">
              <img src="/zen.jpeg" alt="ZenSolve Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-bold text-2xl text-slate-900 tracking-tight">
              ZenSolve
            </span>
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 block w-max mx-auto mb-2">
            Candidate Registration
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Create Candidate Account
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Access thousands of verified openings and track your job applications.
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-surface-3 glass-specular p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl bg-white/95">
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    placeholder="rahul@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Phone / WhatsApp
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Professional Headline */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Current Title / Career Headline
              </label>
              <div className="relative">
                <FaBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                <input
                  type="text"
                  name="headline"
                  placeholder="e.g. Senior Frontend Developer | React | Node.js"
                  value={formData.headline}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <FaExclamationTriangle className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full shadow-md shadow-indigo-500/10 font-bold"
            >
              Complete Candidate Registration
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            <span>Looking to hire talent instead? </span>
            <Link to="/signup/company" className="text-indigo-600 font-bold hover:underline">
              Register as Company
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default CandidateSignup;
