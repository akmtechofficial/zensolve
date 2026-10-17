import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../../components/useAuth';
import { Button } from '../../components/ui/Button';
import {
  FaBuilding,
  FaGlobe,
  FaMapMarkerAlt,
  FaUsers,
  FaCheckCircle,
  FaUpload,
  FaCalendarAlt,
} from 'react-icons/fa';

const DashboardCompanyProfile = () => {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [companyInfo, setCompanyInfo] = useState({
    name: userData?.companyName || 'ZenSolve Partner Inc.',
    industry: 'Information Technology & Cloud Services',
    location: 'Bangalore, Karnataka',
    website: 'https://zensolve.com',
    teamSize: '100 - 500 Employees',
    founded: '2020',
    about:
      'We are an innovative enterprise software organization specializing in modern cloud infrastructure, AI platforms, and digital workforce acceleration.',
    logoUrl: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // Simulate saving settings (or syncing to user doc)
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }, 600);
  };

  return (
    <DashboardLayout
      title="Company Brand Profile"
      subtitle="Customize how your organization appears to job seekers on public career listings."
    >
      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="glass-surface-2 glass-specular p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full glass-surface-1 border border-indigo-500/30 text-indigo-400 text-xs flex items-center justify-center font-bold">1</span>
              <span>General Organization Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  Industry / Domain
                </label>
                <input
                  type="text"
                  value={companyInfo.industry}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  Company Logo URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={companyInfo.logoUrl}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, logoUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  Official Website
                </label>
                <input
                  type="url"
                  value={companyInfo.website}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  Headquarters City
                </label>
                <input
                  type="text"
                  value={companyInfo.location}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  Team Size
                </label>
                <input
                  type="text"
                  value={companyInfo.teamSize}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, teamSize: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  Founded Year
                </label>
                <input
                  type="text"
                  value={companyInfo.founded}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, founded: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                About / Overview Description
              </label>
              <textarea
                value={companyInfo.about}
                onChange={(e) => setCompanyInfo({ ...companyInfo, about: e.target.value })}
                rows="4"
                className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-white focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {success && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm rounded-2xl flex items-center gap-2">
              <FaCheckCircle />
              <span>Company profile updated successfully!</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full sm:w-auto px-8 rounded-2xl shadow-glow-sm"
          >
            Save Profile Changes
          </Button>

        </form>
      </div>
    </DashboardLayout>
  );
};

export default DashboardCompanyProfile;
