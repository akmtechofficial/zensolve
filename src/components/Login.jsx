import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowRight, FaShieldAlt, FaBriefcase, FaExclamationTriangle } from 'react-icons/fa';
import { Button } from './ui/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glass Texture & Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.10] bg-cover bg-center mix-blend-screen z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 mask-radial pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/15 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-md">
        
        {/* Logo and header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 p-[1px] shadow-glow-sm group-hover:shadow-glow-md transition-all">
              <div className="w-full h-full bg-slate-950/90 rounded-[15px] flex items-center justify-center font-display font-black text-xl text-indigo-400">
                Z
              </div>
            </div>
            <span className="font-display font-bold text-2xl text-white tracking-tight">
              ZenSolve
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Sign in to access your recruitment portal and saved jobs.
          </p>
        </div>

        {/* Glass Card */}
        <div className="glass-surface-3 glass-specular p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1.5">
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
                  className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
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
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-slate-300">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2">
              Create an account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
