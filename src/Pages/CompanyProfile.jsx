import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJobs } from '../services/recruitmentService';
import JobCard from '../components/JobCard';
import { VerifiedBadge, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import ApplyJob from '../components/ApplyJob';
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaGlobe,
  FaUsers,
  FaBriefcase,
  FaArrowLeft,
  FaCheckCircle,
  FaCalendarAlt,
  FaShareAlt,
} from 'react-icons/fa';

const CompanyProfile = () => {
  const { companyName } = useParams();
  const navigate = useNavigate();
  const decodedName = decodeURIComponent(companyName || '');

  const [companyJobs, setCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState(null);
  const [quickApplyJob, setQuickApplyJob] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCompanyInfo = async () => {
      setLoading(true);
      const allJobs = await getJobs();
      const matched = allJobs.filter(
        (j) =>
          j.companyName &&
          j.companyName.toLowerCase().trim() === decodedName.toLowerCase().trim()
      );

      if (isMounted) {
        setCompanyJobs(matched);

        const firstJob = matched[0] || {};
        setCompanyData({
          name: decodedName,
          logo: firstJob.companyLogo || null,
          location: firstJob.location || 'India',
          industry: firstJob.category || 'Technology & Services',
          verified: firstJob.verified !== false,
          teamSize: '50 - 500 Employees',
          founded: '2019',
          website: 'https://zensolve.com',
          about:
            firstJob.description ||
            `${decodedName} is a verified hiring partner on ZenSolve, committed to engineering excellence, transparent career growth, and workforce development.`,
        });
        setLoading(false);
      }
    };

    fetchCompanyInfo();
    return () => {
      isMounted = false;
    };
  }, [decodedName]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 relative overflow-hidden">
      {/* Background Ambient Glass Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.10] bg-cover bg-center mix-blend-screen z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />

      {/* Cover Header Banner */}
      <div className="relative h-64 sm:h-72 w-full bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 mask-radial-top" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-start pt-6 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white glass-surface-1 px-4 py-2 rounded-full border border-white/10 transition"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Info (Overlapping Cover) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 mb-12">
        <div className="glass-surface-3 glass-specular border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Company Logo */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl glass-surface-1 border-2 border-indigo-500/40 p-2 shadow-2xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                {companyData?.logo ? (
                  <img
                    src={companyData.logo}
                    alt={decodedName}
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.textContent = decodedName.charAt(0);
                    }}
                  />
                ) : (
                  <span className="text-4xl font-black text-indigo-400 font-display">
                    {decodedName.charAt(0)}
                  </span>
                )}
              </div>

              {/* Title & Metadata */}
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                    {decodedName}
                  </h1>
                  {companyData?.verified && <VerifiedBadge text="Verified Partner" size="md" />}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <FaBuilding className="text-indigo-400" />
                    <span>{companyData?.industry}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-indigo-400" />
                    <span>{companyData?.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaUsers className="text-indigo-400" />
                    <span>{companyData?.teamSize}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="md"
                icon={<FaGlobe className="text-xs" />}
                onClick={() => window.open(companyData?.website, '_blank')}
                className="glass-surface-1 rounded-2xl border-white/10 hover:border-indigo-500/40 text-slate-200"
              >
                Website
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={<FaBriefcase className="text-xs" />}
                onClick={() => {
                  const el = document.getElementById('open-jobs-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-2xl shadow-glow-sm"
              >
                View {companyJobs.length} Open Roles
              </Button>
            </div>

          </div>
        </div>
      </div>

      {/* Profile Details & Jobs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Left Column: About & Overview */}
        <div className="space-y-6">
          <div className="glass-surface-2 glass-specular p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white tracking-tight font-display">About Company</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {companyData?.about}
            </p>
          </div>

          <div className="glass-surface-2 glass-specular p-6 rounded-3xl border border-white/10 space-y-3.5 text-xs text-slate-300 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-2 font-display">Company Overview</h4>
            <div className="flex justify-between py-1.5 border-b border-white/10">
              <span className="text-slate-400">Founded</span>
              <span className="font-semibold text-white">{companyData?.founded}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/10">
              <span className="text-slate-400">Headquarters</span>
              <span className="font-semibold text-white">{companyData?.location}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/10">
              <span className="text-slate-400">Industry</span>
              <span className="font-semibold text-white">{companyData?.industry}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Active Openings</span>
              <span className="font-bold text-indigo-300">{companyJobs.length} Roles</span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Jobs Published by this company */}
        <div id="open-jobs-section" className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight font-display">
                Active Openings at {decodedName}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Apply directly to the recruiting team for these positions.
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full glass-surface-1 text-indigo-300 font-semibold border border-indigo-500/30">
              {companyJobs.length} Open
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="glass-surface-2 p-6 rounded-3xl animate-pulse space-y-3 border border-white/10">
                  <div className="h-5 bg-white/5 rounded w-1/3" />
                  <div className="h-4 bg-white/5 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : companyJobs.length > 0 ? (
            <div className="space-y-4">
              {companyJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onQuickApply={(j) => setQuickApplyJob(j)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-14 px-4 glass-surface-2 glass-specular rounded-3xl border border-white/10 shadow-xl">
              <FaBriefcase className="text-3xl text-slate-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">No active listings</p>
              <p className="text-xs text-slate-400 mt-1">
                This company currently has no published openings. Check back soon.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Quick Apply Modal */}
      {quickApplyJob && (
        <Modal
          isOpen={Boolean(quickApplyJob)}
          onClose={() => setQuickApplyJob(null)}
          title={`Apply for ${quickApplyJob.position}`}
          subtitle={`At ${quickApplyJob.companyName}`}
          maxWidth="max-w-2xl"
        >
          <ApplyJob
            job={quickApplyJob}
            onSuccess={() => {
              setQuickApplyJob(null);
              navigate('/thank-you', {
                state: {
                  jobPosition: quickApplyJob.position,
                  companyName: quickApplyJob.companyName,
                },
              });
            }}
          />
        </Modal>
      )}

    </div>
  );
};

export default CompanyProfile;
