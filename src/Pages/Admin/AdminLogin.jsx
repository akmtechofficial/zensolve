import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useAuth, SUPER_ADMIN_EMAIL, ADMIN_EMAILS } from '../../components/useAuth';
import { resolveUserProfile } from '../../services/authService';
import {
  FaShieldAlt,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaArrowRight,
  FaExclamationTriangle,
  FaCheckCircle,
  FaKey,
} from 'react-icons/fa';

const AdminLogin = () => {
  const [email, setEmail] = useState(SUPER_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canInitialize, setCanInitialize] = useState(false);
  const [initSuccess, setInitSuccess] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading: authLoading, refreshUser } = useAuth();

  // If already authenticated as Super Admin, direct to /admin
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      const dest = location.state?.from?.pathname || '/admin';
      navigate(dest, { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate, location]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setInitSuccess(null);

    const normalizedEmail = email.trim().toLowerCase();

    // Strict Enforcement: Allow designated admin accounts
    if (!ADMIN_EMAILS.includes(normalizedEmail)) {
      setError(`Access Restricted: "${normalizedEmail}" is not in the authorized Super Admin list.`);
      return;
    }

    if (!password || password.length < 6) {
      setError('Please enter a valid password (minimum 6 characters).');
      return;
    }

    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      
      // Secondary verification
      if (!credential.user?.email || !ADMIN_EMAILS.includes(credential.user.email.toLowerCase())) {
        await signOut(auth);
        throw new Error('Unauthorized account credentials.');
      }

      await resolveUserProfile(credential.user, 'admin');
      await refreshUser();
      
      const dest = location.state?.from?.pathname || '/admin';
      navigate(dest, { replace: true });
    } catch (err) {
      console.error('Super Admin Login Error:', err);
      if (err.code === 'auth/user-not-found') {
        setError(`The account ${normalizedEmail} has not been created in Firebase Authentication yet.`);
        setCanInitialize(true);
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(`Incorrect password for ${normalizedEmail}. Please try again.`);
        setCanInitialize(true); // Allow setting up if credentials aren't initialized yet
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Access temporarily locked for security. Please try again later.');
      } else {
        setError(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // One-time Admin Account Initialization Helper (if user hasn't created admin in Firebase yet)
  const handleInitializeAccount = async () => {
    if (!password || password.length < 6) {
      setError('Please provide a password of at least 6 characters to initialize the admin account.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!ADMIN_EMAILS.includes(normalizedEmail)) {
      setError(`Only authorized Super Admin emails can be initialized.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      await resolveUserProfile(cred.user, 'admin');
      await refreshUser();
      setInitSuccess(`Admin account (${normalizedEmail}) successfully initialized in Firebase! Redirecting...`);
      setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 1500);
    } catch (err) {
      console.error('Account creation error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Account already exists in Firebase. Please sign in with the correct password.');
        setCanInitialize(false);
      } else {
        setError(err.message || 'Failed to initialize admin account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-indigo-600 selection:text-white">
      {/* Background Lighting */}
      <div className="absolute inset-0 bg-radial-gradient-dark pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/15 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[400px] bg-rose-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between relative z-20">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-slate-900 border border-white/10 p-1 shadow-md shadow-indigo-500/20 flex items-center justify-center overflow-hidden">
            <img src="/zen.jpeg" alt="ZenSolve" className="w-full h-full object-contain rounded-xl" />
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
            ZenSolve
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Admin Portal
            </span>
          </span>
        </Link>

        <Link
          to="/"
          className="text-xs text-slate-400 hover:text-white transition py-1.5 px-3 rounded-xl bg-slate-900/60 border border-white/10"
        >
          Return to Portal
        </Link>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex items-center justify-center relative z-10">
        <div className="w-full">
          <div className="glass-dark-card-elevated rounded-3xl p-7 sm:p-9 border border-indigo-500/30 shadow-2xl relative">
            
            {/* Header Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-600 p-[1px] mx-auto mb-4 shadow-lg shadow-indigo-600/30">
                <div className="w-full h-full bg-[#0B0F19] rounded-[15px] flex items-center justify-center text-indigo-400 text-2xl">
                  <FaShieldAlt />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold font-display text-white tracking-tight">
                Super Admin Console
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Authorized Personnel Only • Firebase Authentication
              </p>
            </div>

            {/* If currently logged in as a non-admin account */}
            {user && !isAdmin && (
              <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="flex-shrink-0" />
                  <span>Currently signed in as: <strong>{user.email}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut(auth);
                    window.location.reload();
                  }}
                  className="text-left text-indigo-400 hover:underline font-semibold"
                >
                  Sign out and switch to Super Admin →
                </button>
              </div>
            )}

            {/* Feedback Notifications */}
            {error && (
              <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-2xl flex items-start gap-2.5">
                <FaExclamationTriangle className="flex-shrink-0 mt-0.5 text-rose-400 text-sm" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {initSuccess && (
              <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-2xl flex items-start gap-2.5">
                <FaCheckCircle className="flex-shrink-0 mt-0.5 text-emerald-400 text-sm" />
                <span className="leading-relaxed">{initSuccess}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  Super Admin Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-indigo-500/40 text-sm text-indigo-300 font-mono font-medium focus:border-indigo-400 focus:outline-none"
                    placeholder="admin@zensolve.in"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['admin@zensolve.in', 'carezensolve@gmail.com', 'admin@zensolve.com'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmail(em)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border font-mono transition ${
                        email.trim().toLowerCase() === em
                          ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300 font-semibold'
                          : 'bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  Master Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-11 py-3 rounded-2xl bg-slate-900/90 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 active:scale-[0.99] mt-2"
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-sm" />
                ) : (
                  <>
                    <span>Authenticate Super Admin</span>
                    <FaArrowRight className="text-xs" />
                  </>
                )}
              </button>
            </form>

            {/* Initialize Account Helper (Shown if account is not created in Firebase yet) */}
            {canInitialize && (
              <div className="mt-5 pt-4 border-t border-white/10 text-center">
                <p className="text-[11px] text-slate-400 mb-2">
                  First time setup? You can initialize <strong className="text-indigo-300">{SUPER_ADMIN_EMAIL}</strong> in Firebase with this password:
                </p>
                <button
                  type="button"
                  onClick={handleInitializeAccount}
                  disabled={loading}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-indigo-500/40 text-xs text-indigo-300 font-semibold transition flex items-center justify-center gap-2 mx-auto"
                >
                  <FaKey className="text-[10px]" />
                  <span>Initialize {SUPER_ADMIN_EMAIL} in Firebase</span>
                </button>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-6 pt-4 border-t border-white/5 text-center">
              <span className="text-[10px] text-slate-500 block leading-tight">
                🔒 All login attempts are recorded and cross-referenced with Firebase Auth security telemetry.
              </span>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-4 text-center text-xs text-slate-600 relative z-20 border-t border-white/5">
        <span>© {new Date().getFullYear()} ZenSolve Technologies • Security Level 4</span>
      </footer>
    </div>
  );
};

export default AdminLogin;
