import React, { useState } from 'react';
import { useAuth } from '../../components/useAuth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { Button } from '../../components/ui/Button';
import {
  FaBuilding,
  FaShieldAlt,
  FaLock,
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSignOutAlt,
} from 'react-icons/fa';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const HRSettings = () => {
  const { user, userData, isApprovedCompany, logout } = useAuth();
  const navigate = useNavigate();

  const [passwordSent, setPasswordSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedNote, setSavedNote] = useState(false);

  const [settings, setSettings] = useState({
    instantApplicantAlerts: userData?.preferences?.instantApplicantAlerts ?? true,
    weeklyDigest: userData?.preferences?.weeklyDigest ?? true,
    autoAcknowledge: userData?.preferences?.autoAcknowledge ?? true,
  });

  const handleToggle = async (key, val) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        preferences: next,
      });
      setSavedNote(true);
      setTimeout(() => setSavedNote(false), 3000);
    } catch (err) {
      console.error('Error updating HR settings:', err);
    }
  };

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
    <DashboardLayout
      title="HR Account Settings"
      subtitle="Manage corporate recruiting credentials, notifications, and security."
    >
      <div className="max-w-2xl space-y-8">
        
        {/* Company Identity */}
        <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <FaBuilding className="text-indigo-600 text-xs" />
            <span>Organization Profile Summary</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Company Name</span>
              <span className="font-bold text-slate-900">{userData?.companyName || 'Not configured'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">HR Representative</span>
              <span className="font-bold text-slate-900">{userData?.hrName || user?.displayName || 'HR Team'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Corporate Email</span>
              <span className="font-bold text-slate-900">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Verification Status</span>
              <span
                className={`font-bold text-[11px] uppercase tracking-wider ${
                  isApprovedCompany ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {isApprovedCompany ? 'Verified Partner Organization' : 'Under Review (Pending Approval)'}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Password */}
        <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <FaLock className="text-indigo-600 text-xs" />
            <span>Recruiter Password & Authentication</span>
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            Dispatch a secure password reset link to your official corporate inbox.
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
            Send Corporate Password Reset
          </Button>
        </div>

        {/* Notifications */}
        <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <FaBell className="text-indigo-600 text-xs" />
            <span>Recruitment Alerts & Notifications</span>
          </h3>

          {savedNote && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <FaCheckCircle />
              <span>Settings successfully updated</span>
            </div>
          )}

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Instant Candidate Application Alerts</span>
                <span className="text-[11px] text-slate-500">Receive email notification when a new resume is submitted</span>
              </div>
              <input
                type="checkbox"
                checked={settings.instantApplicantAlerts}
                onChange={(e) => handleToggle('instantApplicantAlerts', e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Auto-Acknowledge Applications</span>
                <span className="text-[11px] text-slate-500">Send automated confirmation email to candidates upon apply</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoAcknowledge}
                onChange={(e) => handleToggle('autoAcknowledge', e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-4">
          <Button
            variant="danger"
            size="md"
            icon={<FaSignOutAlt className="text-xs" />}
            onClick={handleLogout}
          >
            Sign Out of HR Console
          </Button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default HRSettings;
