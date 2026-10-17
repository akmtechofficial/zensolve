import React, { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useAuth } from '../../components/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';
import { Button } from '../../components/ui/Button';

const VerifyEmail = () => {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!auth.currentUser) {
      setError('Please log in first to verify your email address.');
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glass Texture & Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] bg-cover bg-center mix-blend-multiply z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 mask-radial pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Brand Header */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-white p-0.5 border border-slate-200 shadow-sm group-hover:border-indigo-400 transition-all overflow-hidden flex items-center justify-center">
            <img src="/zen.jpeg" alt="ZenSolve Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            ZenSolve
          </span>
        </Link>

        {/* Card */}
        <div className="glass-surface-3 glass-specular p-8 rounded-3xl border border-slate-200/90 shadow-xl bg-white/95 text-left">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-2xl mx-auto mb-6 shadow-sm">
            <FaEnvelope />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 text-center tracking-tight font-display mb-2">
            Verify Your Email
          </h2>
          <p className="text-xs text-slate-600 text-center leading-relaxed mb-6">
            We require email verification to ensure security for candidate credentials and corporate recruitment authorizations.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 mb-6 space-y-1">
            <span className="font-semibold block text-slate-900">Registered Account:</span>
            <span className="font-mono text-indigo-600 block">{user?.email || 'Logged In Account'}</span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Check your inbox for the verification link sent during registration.
            </span>
          </div>

          {sent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2 mb-4">
              <FaCheckCircle className="flex-shrink-0" />
              <span>A new verification link has been sent to your email!</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 mb-4">
              <FaExclamationTriangle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <Button
              variant="primary"
              size="md"
              loading={loading}
              onClick={handleResend}
              className="w-full shadow-md shadow-indigo-500/10 font-bold"
            >
              Resend Verification Email
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerifyEmail;
