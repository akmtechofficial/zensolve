import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJobs, getCompanies } from '../services/recruitmentService';
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
      try {
        const [allJobs, allCompanies] = await Promise.all([
          getJobs(),
          getCompanies(),
        ]);
        const matched = allJobs.filter(
          (j) =>
            j.companyName &&
            j.companyName.toLowerCase().trim() === decodedName.toLowerCase().trim()
        );
        const registered = allCompanies.find(
          (c) =>
            c.name &&
            c.name.toLowerCase().trim() === decodedName.toLowerCase().trim()
        );

        if (isMounted) {
          setCompanyJobs(matched);

          const firstJob = matched[0] || {};
          setCompanyData({
            name: registered?.name || decodedName,
            logo: registered?.logo || firstJob.companyLogo || null,
            location: registered?.location || firstJob.location || 'India',
            industry: registered?.industry || firstJob.category || 'Technology & Services',
            verified: registered ? registered.verified : firstJob.verified !== false,
            teamSize: registered?.teamSize || registered?.companyType || null,
            founded: registered?.founded || null,
            website: registered?.website || null,
            about:
              registered?.about ||
              firstJob.description ||
              `${decodedName} is an employer partner recruiting through ZenSolve.`,
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching company details:', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchCompanyInfo();
    return () => {
      isMounted = false;
    };
  }, [decodedName]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 relative overflow-hidden">
      {/* Background Ambient Glass Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />

      {/* Cover Header Banner */}
      <div className="relative h-64 sm:h-72 w-full bg-gradient-to-r from-indigo-100 via-indigo-50 to-slate-100 overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-grid-pattern opacity-50 mask-radial-top" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-start pt-6 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white/90 shadow-sm px-4 py-2 rounded-full border border-slate-200 transition"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Info (Overlapping Cover) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 mb-12">
        <div className="glass-surface-3 glass-specular border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl bg-white/95">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Company Logo */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-2 border-indigo-200 p-2 shadow-md flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                  <span className="text-4xl font-black text-indigo-600 font-display">
                    {decodedName.charAt(0)}
                  </span>
                )}
              </div>

              {/* Title & Metadata */}
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                    {decodedName}
                  </h1>
                  {companyData?.verified && <VerifiedBadge text="Verified Partner" size="md" />}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <FaBuilding className="text-indigo-600" />
                    <span>{companyData?.industry}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-indigo-600" />
                    <span>{companyData?.location}</span>
                  </div>
                  {companyData?.teamSize && (
                    <div className="flex items-center gap-1.5">
                      <FaUsers className="text-indigo-600" />
                      <span>{companyData.teamSize}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {companyData?.website && (
                <Button
                  variant="outline"
                  size="md"
                  icon={<FaGlobe className="text-xs" />}
                  onClick={() => window.open(companyData.website, '_blank')}
                  className="bg-white rounded-2xl border-slate-200 hover:border-indigo-400 text-slate-700 shadow-sm"
                >
                  Website
                </Button>
              )}
              <Button
                variant="primary"
                size="md"
                icon={<FaBriefcase className="text-xs" />}
                onClick={() => {
                  const el = document.getElementById('open-jobs-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-2xl shadow-md shadow-indigo-500/10"
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
          <div className="glass-surface-2 glass-specular p-6 rounded-3xl border border-slate-200/90 space-y-4 shadow-sm bg-white/90">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight font-display">About Company</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {companyData?.about}
            </p>
          </div>

          <div className="glass-surface-2 glass-specular p-6 rounded-3xl border border-slate-200/90 space-y-3.5 text-xs text-slate-600 shadow-sm bg-white/90">
            <h4 className="text-sm font-bold text-slate-900 mb-2 font-display">Company Overview</h4>
            {companyData?.founded && (
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Founded</span>
                <span className="font-semibold text-slate-900">{companyData.founded}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Headquarters</span>
              <span className="font-semibold text-slate-900">{companyData?.location}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Industry</span>
              <span className="font-semibold text-slate-900">{companyData?.industry}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Active Openings</span>
              <span className="font-bold text-indigo-600">{companyJobs.length} Roles</span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Jobs Published by this company */}
        <div id="open-jobs-section" className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                Active Openings at {decodedName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Apply directly to the recruiting team for these positions.
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              {companyJobs.length} Open
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="glass-surface-2 bg-white/80 p-6 rounded-3xl animate-pulse space-y-3 border border-slate-200">
                  <div className="h-5 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
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
            <div className="text-center py-14 px-4 glass-surface-2 glass-specular bg-white/95 rounded-3xl border border-slate-200/90 shadow-sm">
              <FaBriefcase className="text-3xl text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-900">No active listings</p>
              <p className="text-xs text-slate-500 mt-1">
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
