import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../components/useAuth';
import { getUserSavedJobs, toggleSaveJob } from '../../services/recruitmentService';
import CandidateLayout from './CandidateLayout';
import { Button } from '../../components/ui/Button';
import { Badge, VerifiedBadge } from '../../components/ui/Badge';
import {
  FaBookmark,
  FaArrowRight,
  FaBriefcase,
  FaTrashAlt,
  FaClock,
  FaMapMarkerAlt,
  FaBuilding,
  FaExclamationCircle,
} from 'react-icons/fa';

const CandidateSavedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSaved = async () => {
    if (user?.uid) {
      setLoading(true);
      setErrorMsg('');
      try {
        const jobs = await getUserSavedJobs(user.uid);
        setSavedJobs(jobs);
      } catch (err) {
        console.error('Error fetching saved jobs:', err);
        setErrorMsg('Unable to load saved positions. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [user?.uid]);

  const handleRemove = async (jobId, jobTitle) => {
    if (!user?.uid || removingId) return;

    setRemovingId(jobId);
    setErrorMsg('');

    // Optimistic removal from local UI
    const previousSaved = [...savedJobs];
    setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));

    try {
      const result = await toggleSaveJob(user.uid, jobId);
      if (!result.success) {
        // Rollback if database update failed
        setSavedJobs(previousSaved);
        setErrorMsg(`Failed to remove "${jobTitle}". Please try again.`);
      }
    } catch (err) {
      console.error('Error removing saved job:', err);
      setSavedJobs(previousSaved);
      setErrorMsg(`Failed to remove "${jobTitle}". Please try again.`);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <CandidateLayout
      title="Saved Bookmarks"
      subtitle="Manage your bookmarked career opportunities and apply directly."
    >
      <div className="space-y-6">
        
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaExclamationCircle className="text-sm flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={fetchSaved}
              className="underline hover:text-rose-900 ml-4 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading your bookmarked jobs...</p>
          </div>
        ) : savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedJobs.map((job) => {
              const formattedSalary =
                job?.salaryFrom && job?.salaryTo
                  ? `₹${Number(job.salaryFrom).toLocaleString('en-IN')} - ₹${Number(job.salaryTo).toLocaleString('en-IN')}`
                  : job?.salaryFrom
                  ? `₹${Number(job.salaryFrom).toLocaleString('en-IN')}`
                  : 'Competitive';

              const companyInitial = job?.companyName ? job.companyName.charAt(0).toUpperCase() : 'Z';
              const isClosed = job.status === 'Closed' || job.status === 'Draft';

              return (
                <div
                  key={job.id}
                  className="rounded-2xl bg-white p-5 sm:p-6 flex flex-col justify-between border border-slate-200/90 shadow-xs hover:border-slate-300 transition duration-200"
                >
                  <div>
                    {/* Header: Company & Title */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {job?.companyLogo ? (
                          <img
                            src={job.companyLogo}
                            alt={`${job.companyName} logo`}
                            className="w-11 h-11 rounded-xl object-contain bg-white border border-slate-200 p-1 flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center flex-shrink-0 ${
                            job?.companyLogo ? "hidden" : "flex"
                          }`}
                        >
                          {companyInitial}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-slate-600 truncate flex items-center gap-1">
                              <FaBuilding className="text-[10px] text-slate-400 flex-shrink-0" />
                              <span className="truncate">{job?.companyName || 'Verified Employer'}</span>
                            </span>
                            {job?.verified !== false && <VerifiedBadge text="Verified" size="sm" />}
                          </div>

                          <Link
                            to={`/jobs/${job.id}`}
                            state={{ job }}
                            className="text-base font-bold text-slate-900 hover:text-indigo-600 transition tracking-tight mt-0.5 truncate block font-display"
                          >
                            {job?.position || 'Job Opening'}
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap gap-1.5 my-3.5">
                      <Badge variant="primary" size="sm" icon={<FaBriefcase className="text-[9px]" />}>
                        {job?.category || 'General'}
                      </Badge>
                      <Badge variant="default" size="sm" icon={<FaClock className="text-[9px]" />}>
                        {job?.jobType || 'Full-time'}
                      </Badge>
                      <Badge variant="default" size="sm" icon={<FaMapMarkerAlt className="text-[9px]" />}>
                        {job?.location || 'India'}
                      </Badge>
                      {job?.experience && (
                        <Badge variant="default" size="sm">
                          Exp: {job.experience}
                        </Badge>
                      )}
                    </div>

                    {isClosed && (
                      <span className="inline-block text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md mb-2">
                        Position Closed
                      </span>
                    )}
                  </div>

                  {/* Actions & Explicit Remove Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">Compensation</span>
                      <span className="text-xs font-bold text-emerald-600">
                        {formattedSalary}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Explicit Remove Button with accessible labeling */}
                      <button
                        type="button"
                        onClick={() => handleRemove(job.id, job.position)}
                        disabled={removingId === job.id}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition active:scale-95 disabled:opacity-50"
                        title={`Remove saved job: ${job.position}`}
                        aria-label={`Remove saved job: ${job.position}`}
                      >
                        <FaTrashAlt className="text-[11px]" />
                        <span>{removingId === job.id ? 'Removing...' : 'Remove'}</span>
                      </button>

                      {isClosed ? (
                        <span className="text-xs text-slate-400 font-semibold px-2 py-1">
                          Closed
                        </span>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<FaArrowRight className="text-[10px]" />}
                          iconPosition="right"
                          onClick={() => navigate(`/jobs/${job.id}/apply`, { state: { job } })}
                          className="text-xs px-3 py-1.5 rounded-xl font-bold"
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-12 sm:p-16 rounded-3xl border border-slate-200 text-center max-w-md mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xl mx-auto mb-4 shadow-2xs">
              <FaBookmark />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">No Saved Jobs Yet</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              When exploring positions, click the bookmark icon on any job card to save it here for fast comparison and application.
            </p>
            <Button
              variant="primary"
              size="md"
              icon={<FaArrowRight className="text-xs" />}
              iconPosition="right"
              onClick={() => navigate('/jobs')}
              className="rounded-xl shadow-xs"
            >
              Browse Open Positions
            </Button>
          </div>
        )}

      </div>
    </CandidateLayout>
  );
};

export default CandidateSavedJobs;
