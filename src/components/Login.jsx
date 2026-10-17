import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowRight, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { Button } from './ui/Button';

const ADMIN_EMAILS = [
  'admin@zensolve.com',
  'admin@zensolve.in',
  'superadmin@zensolve.com',
  'akmtechofficial@gmail.com',
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Check query param ?returnUrl= or location.state?.from
  const queryParams = new URLSearchParams(location.search);
  const returnUrl = queryParams.get('returnUrl') || location.state?.from?.pathname || null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore to route intelligently
      let role = 'candidate';
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          role = userDoc.data().role || 'candidate';
        }
      } catch (err) {
        console.warn('Could not read user role:', err);
      }

      if (ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
        role = 'admin';
      }

      // If user came with an intended return URL (e.g. applying for a job)
      if (returnUrl && !returnUrl.startsWith('/login') && !returnUrl.startsWith('/register')) {
        navigate(returnUrl, { replace: true });
        return;
      }

      // Smart role-based dashboard destination
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'company' || role === 'employer') {
        navigate('/hr', { replace: true });
      } else {
        navigate('/candidate', { replace: true });
      }
    } catch (err) {
      console.error('Sign in error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please verify your credentials.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again or reset your password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many unsuccessful login attempts. Please reset your password or try again later.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
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

      <div className="relative z-10 w-full max-w-md">
        
        {/* Logo and header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white p-0.5 border border-slate-200 shadow-sm group-hover:border-indigo-400 transition-all overflow-hidden flex items-center justify-center">
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
            Welcome Back
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Sign in to access your recruitment portal, applications, or ATS console.
          </p>
        </div>

        {/* Glass Card */}
        <div className="glass-surface-3 glass-specular p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl bg-white/95">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Email Address
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
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
              className="w-full shadow-md shadow-indigo-500/10 font-bold"
            >
              Sign In to ZenSolve
            </Button>
          </form>

          {/* Quick Sign Up Links */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-center text-xs text-slate-600">
            <div>
              Don't have an account yet?{' '}
              <Link to="/signup" className="text-indigo-600 font-bold hover:underline">
                Create an account
              </Link>
            </div>
            <div className="flex justify-center gap-4 pt-1 text-[11px] text-slate-500">
              <Link to="/signup/candidate" className="hover:text-indigo-600 underline">
                Candidate Signup
              </Link>
              <span>•</span>
              <Link to="/signup/company" className="hover:text-indigo-600 underline">
                Company HR Signup
              </Link>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-6">
          <FaShieldAlt className="text-emerald-500" />
          <span>Secured by Firebase Enterprise Authentication</span>
        </div>

      </div>
    </div>
  );
};

export default Login;
