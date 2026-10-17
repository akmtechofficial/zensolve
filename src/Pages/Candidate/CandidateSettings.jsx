import React, { useState } from 'react';
import { useAuth } from '../../components/useAuth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import CandidateLayout from './CandidateLayout';
import { Button } from '../../components/ui/Button';
import {
  FaLock,
  FaShieldAlt,
  FaSignOutAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBell,
  FaEnvelope,
} from 'react-icons/fa';

const CandidateSettings = () => {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();

  const [passwordSent, setPasswordSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    interviewReminders: true,
    weeklyMatches: false,
  });

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setPasswordSent(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to dispatch password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <CandidateLayout
      title="Account Settings"
      subtitle="Manage your credentials, notification preferences, and privacy controls."
    >
      <div className="max-w-2xl space-y-8">
        
        {/* Account Info Card */}
        <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <FaShieldAlt className="text-indigo-600 text-xs" />
            <span>Account Security & Identity</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Registered Email</span>
              <span className="font-bold text-slate-900">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Candidate ID</span>
              <span className="font-mono text-slate-600">{user?.uid}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Account Role</span>
              <span className="font-bold text-indigo-600 uppercase tracking-wider text-[11px]">
                {userData?.role || 'Candidate'}
              </span>
            </div>
          </div>
        </div>

        {/* Password Reset Card */}
        <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <FaLock className="text-indigo-600 text-xs" />
            <span>Password & Authentication</span>
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            Need to update your password? Click below to receive a secure password reset link to your email.
          </p>

          {passwordSent && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <FaCheckCircle className="flex-shrink-0" />
              <span>Password reset link sent to {user?.email}!</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <FaExclamationTriangle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            variant="outline"
            size="md"
            loading={loading}
            onClick={handlePasswordReset}
            className="w-full sm:w-auto"
          >
            Send Password Reset Link
          </Button>
        </div>

        {/* Notifications Card */}
        <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <FaBell className="text-indigo-600 text-xs" />
            <span>Recruitment Notifications</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Application Status Changes</span>
                <span className="text-[11px] text-slate-500">Email alerts when a recruiter shortlists your CV</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={(e) =>
                  setNotifications((p) => ({ ...p, emailAlerts: e.target.checked }))
                }
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Interview Schedule Reminders</span>
                <span className="text-[11px] text-slate-500">Automated reminders before scheduled interview slots</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.interviewReminders}
                onChange={(e) =>
                  setNotifications((p) => ({ ...p, interviewReminders: e.target.checked }))
                }
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Logout Section */}
        <div className="pt-4 flex items-center justify-between">
          <Button
            variant="danger"
            size="md"
            icon={<FaSignOutAlt className="text-xs" />}
            onClick={handleLogout}
          >
            Sign Out of Account
          </Button>
        </div>

      </div>
    </CandidateLayout>
  );
};

export default CandidateSettings;
