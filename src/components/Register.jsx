import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  FaEnvelope,
  FaLock,
  FaBuilding,
  FaUser,
  FaBriefcase,
  FaExclamationTriangle,
  FaCheckCircle,
} from 'react-icons/fa';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

const Register = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') === 'employer' ? 'employer' : 'candidate';

  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save role and metadata to Firestore `users` collection
      await setDoc(doc(db, 'users', user.uid), {
        email,
        role,
        companyName: role === 'employer' ? companyName : null,
        savedJobs: [],
        createdAt: new Date(),
      });

      if (role === 'employer') {
        navigate('/dashboard');
      } else {
        navigate('/jobs');
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered. Please login.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient background glass texture & grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] bg-cover bg-center mix-blend-multiply z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 mask-radial pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white p-0.5 border border-slate-200 shadow-sm group-hover:border-indigo-400 group-hover:shadow-glow-sm transition-all overflow-hidden flex items-center justify-center">
              <img
                src="/zen.jpeg"
                alt="ZenSolve Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display font-bold text-2xl text-slate-900 tracking-tight">
              ZenSolve
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Create an Account
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Join ZenSolve as a job seeker or enterprise employer.
          </p>
        </div>

        {/* Card */}
        <div className="glass-surface-3 glass-specular p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
          
          {/* Role Switcher Pill */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl glass-surface-1 border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={cn(
                "py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2",
                role === 'candidate'
                  ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <FaUser size={12} />
              <span>Job Seeker</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('employer')}
              className={cn(
                "py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2",
                role === 'employer'
                  ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <FaBuilding size={12} />
              <span>Employer / HR</span>
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {role === 'employer' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Company / Organization Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Acme Technologies"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required={role === 'employer'}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Work or Personal Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

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
              className="w-full text-sm font-semibold rounded-2xl shadow-glow-sm mt-2"
            >
              {role === 'employer' ? 'Register Company Account' : 'Create Candidate Account'}
            </Button>
          </form>

          <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
