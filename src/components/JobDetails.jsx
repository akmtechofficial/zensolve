import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBuilding,
  FaBriefcase,
  FaClock,
  FaCalendarAlt,
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaCheckCircle,
  FaUsers,
  FaShieldAlt,
  FaFileContract,
} from 'react-icons/fa';
import { useAuth } from './useAuth';
import { isJobSaved, saveJobToUser } from '../firebaseUtils';
import { getJobById } from '../services/recruitmentService';
import { VerifiedBadge, Badge } from './ui/Badge';
import { Button } from './ui/Button';

const JobDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(location.state?.job || null);
  const [loading, setLoading] = useState(!job);
  const [isSaved, setIsSaved] = useState(false);

  // If job wasn't passed via state, try to get ID from search params
  useEffect(() => {
    let isMounted = true;
    const loadJob = async () => {
      if (!job) {
        const queryParams = new URLSearchParams(location.search);
        const jobId = queryParams.get('id');
        if (jobId) {
          const fetched = await getJobById(jobId);
          if (isMounted) {
            setJob(fetched);
            setLoading(false);
          }
        } else {
          if (isMounted) setLoading(false);
        }
      }
    };
    loadJob();
    return () => {
      isMounted = false;
    };
  }, [location.search, job]);

  useEffect(() => {
    let isMounted = true;
    const checkSaved = async () => {
      if (user?.uid && job?.id) {
        const saved = await isJobSaved(user.uid, job.id);
        if (isMounted) setIsSaved(saved);
      }
    };
    checkSaved();
    return () => {
      isMounted = false;
    };
  }, [user?.uid, job?.id]);

  const handleApply = () => {
    navigate('/apply-job', { state: { job } });
  };

  const toggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isSaved && job?.id) {
      await saveJobToUser(user.uid, job.id);
      setIsSaved(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="glass-surface-2 p-8 rounded-3xl border border-white/10 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading position details...</span>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-20 px-4 text-center">
        <div className="max-w-md mx-auto glass-surface-2 glass-specular p-8 rounded-3xl border border-white/10 shadow-2xl">
          <FaBriefcase className="text-4xl text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2 font-display">Job Opening Not Found</h2>
          <p className="text-slate-300 text-sm mb-6">
            The job you are looking for may have been filled or expired.
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/jobs')} className="rounded-xl">
            Browse All Jobs
          </Button>
        </div>
      </div>
    );
  }

  const formattedSalary =
    job?.salaryFrom && job?.salaryTo
      ? `₹${Number(job.salaryFrom).toLocaleString('en-IN')} - ₹${Number(job.salaryTo).toLocaleString('en-IN')}`
      : job?.salaryFrom
      ? `₹${Number(job.salaryFrom).toLocaleString('en-IN')}`
      : 'Competitive';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 relative overflow-hidden">
      {/* Background Ambient Glass Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.10] bg-cover bg-center mix-blend-screen z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white mb-6 transition glass-surface-1 px-3.5 py-1.5 rounded-full border border-white/10"
        >
          <FaArrowLeft />
          <span>Back to Jobs</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Job Content (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Card */}
            <div className="glass-surface-2 glass-specular p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl glass-surface-1 border border-white/15 p-2 flex items-center justify-center font-bold text-indigo-400 text-2xl flex-shrink-0 shadow-inner">
                    {job?.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt={job.companyName}
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.textContent = job.companyName?.charAt(0) || 'Z';
                        }}
                      />
                    ) : (
                      job.companyName?.charAt(0) || 'Z'
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/company/${encodeURIComponent(job.companyName || '')}`}
                        className="text-base font-bold text-slate-200 hover:text-indigo-300 transition"
                      >
                        {job.companyName}
                      </Link>
                      {job.verified !== false && <VerifiedBadge text="Verified Partner" size="sm" />}
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1 font-display">
                      {job.position}
                    </h1>
                  </div>
                </div>

                <button
                  onClick={toggleSave}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition border flex-shrink-0 shadow-md ${
                    isSaved
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      : 'glass-surface-1 border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30'
                  }`}
                  title={isSaved ? 'Saved' : 'Save Opening'}
                >
                  {isSaved ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                </button>

              </div>

              {/* Tags Grid */}
              <div className="flex flex-wrap gap-2.5 pt-4 border-t border-white/10">
                <Badge variant="primary" size="md" icon={<FaBriefcase className="text-xs" />}>
                  {job.category || 'General'}
                </Badge>
                <Badge variant="default" size="md" icon={<FaClock className="text-xs" />}>
                  {job.jobType || 'Full-time'}
                </Badge>
                <Badge variant="default" size="md" icon={<FaMapMarkerAlt className="text-xs" />}>
                  {job.location || 'India'}
                </Badge>
                {job.experience && (
                  <Badge variant="default" size="md">
                    Experience: {job.experience}
                  </Badge>
                )}
                {job.vacancies && (
                  <Badge variant="default" size="md">
                    {job.vacancies} Vacanc{Number(job.vacancies) === 1 ? 'y' : 'ies'}
                  </Badge>
                )}
              </div>
            </div>

            {/* Description & Overview */}
            <div className="glass-surface-2 glass-specular p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl">
              <div>
                <h3 className="text-xl font-bold text-white mb-4 font-display">Role Overview & Responsibilities</h3>
                <div className="text-sm text-slate-200 leading-relaxed space-y-4 whitespace-pre-line font-normal">
                  {job.description || (
                    <>
                      <p>
                        We are seeking a talented professional to join our team as a {job.position}. In this role, you will collaborate closely with cross-functional stakeholders to deliver exceptional outcomes and drive high-impact initiatives.
                      </p>
                      <h4 className="font-semibold text-white pt-2">Key Responsibilities:</h4>
                      <ul className="list-disc list-inside space-y-2 text-slate-300">
                        <li>Execute day-to-day strategic and technical objectives for the organization.</li>
                        <li>Maintain quality benchmarks and adhere to corporate best practices.</li>
                        <li>Collaborate with cross-departmental leads to resolve operational challenges.</li>
                        <li>Contribute towards continuous workflow enhancements and team performance.</li>
                      </ul>
                      <h4 className="font-semibold text-white pt-2">Requirements:</h4>
                      <ul className="list-disc list-inside space-y-2 text-slate-300">
                        <li>Relevant professional experience in {job.category || 'this domain'}.</li>
                        <li>Strong problem-solving, communication, and collaborative abilities.</li>
                        <li>Self-driven orientation with accountability for project outcomes.</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Sidebar (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 space-y-6">
              
              {/* Application Action Card */}
              <div className="glass-surface-3 glass-specular p-6 rounded-3xl border border-white/15 space-y-5 shadow-2xl">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Offered Compensation
                  </span>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-1 font-display">
                    {formattedSalary}
                  </div>
                  <span className="text-[11px] text-slate-400">Gross Annual CTC</span>
                </div>

                <Button
                  variant="primary"
                  size="xl"
                  onClick={handleApply}
                  className="w-full text-base font-bold shadow-glow-sm rounded-2xl"
                >
                  Apply For This Job
                </Button>

                <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <FaShieldAlt className="text-indigo-400 flex-shrink-0" />
                    <span>Direct submission to recruiting team</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-400 flex-shrink-0" />
                    <span>Zero candidate charges or deduction</span>
                  </div>
                </div>
              </div>

              {/* Company Info Box */}
              <div className="glass-surface-2 glass-specular p-6 rounded-3xl border border-white/10 space-y-3 shadow-xl">
                <h4 className="text-sm font-bold text-white">About The Company</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {job.companyName} is a verified employer actively expanding their organization on ZenSolve.
                </p>
                <Link
                  to={`/company/${encodeURIComponent(job.companyName || '')}`}
                  className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 block pt-1"
                >
                  View Company Profile & All Openings →
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default JobDetails;
