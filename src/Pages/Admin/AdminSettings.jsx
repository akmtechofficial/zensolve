import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getPlatformSettings, updatePlatformSettings } from '../../services/recruitmentService';
import { useAuth } from '../../components/useAuth';
import {
  FaCog,
  FaShieldAlt,
  FaCheckCircle,
  FaSlidersH,
  FaFileDownload,
  FaSave,
} from 'react-icons/fa';

const AdminSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    autoApproveCompanies: false,
    jobModerationRequired: false,
    allowCandidateSignups: true,
    maintenanceMode: false,
    maxUploadSizeMb: 10,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getPlatformSettings();
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await updatePlatformSettings(settings, user?.email || 'admin@zensolve.com');
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert(res.error || 'Failed to update settings');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Platform Policies & Governance"
      subtitle="Configure platform-wide recruitment rules, moderation thresholds, and operational flags."
    >
      <form onSubmit={handleSave} className="max-w-4xl space-y-6">
        {/* Verification Policies */}
        <div className="glass-surface-2 glass-specular p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-lg">
              <FaShieldAlt />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Recruitment Verification Policies</h3>
              <p className="text-xs text-slate-500">Configure automated checks and gatekeeping logic.</p>
            </div>
          </div>

          <div className="space-y-4 pt-2 divide-y divide-slate-100">
            {/* Setting 1: Require Super-Admin approval for companies */}
            <div className="flex items-center justify-between pt-4">
              <div className="pr-4">
                <span className="text-xs font-bold text-slate-900 block">
                  Mandatory Super-Admin Company Approval
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  When enabled, companies stay in "Pending Review" status and cannot publish jobs until approved.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('autoApproveCompanies')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  !settings.autoApproveCompanies ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    !settings.autoApproveCompanies ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Setting 2: Job Moderation */}
            <div className="flex items-center justify-between pt-4">
              <div className="pr-4">
                <span className="text-xs font-bold text-slate-900 block">
                  Individual Job Post Pre-Moderation
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Require every job opening submitted by approved employers to be reviewed before going public.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('jobModerationRequired')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.jobModerationRequired ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    settings.jobModerationRequired ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Setting 3: Allow Candidate Registrations */}
            <div className="flex items-center justify-between pt-4">
              <div className="pr-4">
                <span className="text-xs font-bold text-slate-900 block">
                  Public Candidate Registration Active
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Allow new job seekers to create candidate profiles and submit resumes.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('allowCandidateSignups')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.allowCandidateSignups ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    settings.allowCandidateSignups ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Storage Limits */}
        <div className="glass-surface-2 glass-specular p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-lg">
              <FaSlidersH />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">System Resources & File Uploads</h3>
              <p className="text-xs text-slate-500">Configure attachment and resume upload caps.</p>
            </div>
          </div>

          <div className="pt-2 max-w-xs">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Maximum Candidate Resume Size (MB)
            </label>
            <input
              type="number"
              value={settings.maxUploadSizeMb}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, maxUploadSizeMb: Number(e.target.value) || 10 }))
              }
              min="1"
              max="25"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Feedback message */}
        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <FaCheckCircle className="text-emerald-600" />
            <span>Platform policies successfully updated and recorded in audit log.</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            <FaSave />
            <span>{saving ? 'Updating Policies...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminSettings;
