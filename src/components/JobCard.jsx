import React, { useState, useEffect } from 'react';
import {
  FaLaptop,
  FaClock,
  FaBookmark,
  FaRegBookmark,
  FaMapMarkerAlt,
  FaBriefcase,
  FaCalendarAlt,
  FaArrowRight,
  FaBuilding,
  FaTrashAlt,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { toggleSaveJob, getUserSavedJobs } from '../services/recruitmentService';
import { isJobSaved } from '../firebaseUtils';
import { Badge, VerifiedBadge } from './ui/Badge';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

const JobCard = ({ job, onQuickApply, showRemoveAction = false, onRemove }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

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

  const handleApply = (e) => {
    e.stopPropagation();
    if (onQuickApply) {
      onQuickApply(job);
    } else {
      navigate(`/jobs/${job.id}/apply`, { state: { job } });
    }
  };

  const handleCardClick = () => {
    navigate(`/jobs/${job.id}`, { state: { job } });
  };

  const toggleSave = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (isToggling) return;

    setIsToggling(true);
    // Optimistic toggle
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);

    const res = await toggleSaveJob(user.uid, job.id);
    if (res.success) {
      setIsSaved(res.isSaved);
      if (onRemove && !res.isSaved) {
        onRemove(job.id);
      }
    } else {
      // Revert if failed
      setIsSaved(prevSaved);
    }
    setIsToggling(false);
  };

  const handleExplicitRemove = async (e) => {
    e.stopPropagation();
    if (!user || isToggling) return;
    setIsToggling(true);
    const res = await toggleSaveJob(user.uid, job.id);
    if (res.success && onRemove) {
      onRemove(job.id);
    }
    setIsToggling(false);
  };

  const formattedSalary =
    job?.salaryFrom && job?.salaryTo
      ? `₹${Number(job.salaryFrom).toLocaleString('en-IN')} - ₹${Number(job.salaryTo).toLocaleString('en-IN')}`
      : job?.salaryFrom
      ? `₹${Number(job.salaryFrom).toLocaleString('en-IN')}`
      : 'Competitive';

  const companyInitial = job?.companyName ? job.companyName.charAt(0).toUpperCase() : 'Z';

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-2xl bg-white p-5 sm:p-6 cursor-pointer flex flex-col justify-between border border-slate-200/90 shadow-xs hover:border-indigo-400 hover:shadow-md transition duration-200"
    >
      <div>
        {/* Header: Company Logo & Details + Bookmark Toggle */}
        <div className="flex items-start justify-between gap-3.5">
          <div className="flex items-center gap-3 min-w-0">
            {job?.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={`${job.companyName} logo`}
                className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 p-1 flex-shrink-0 group-hover:border-indigo-300 transition"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={cn(
                "w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition",
                job?.companyLogo ? "hidden" : "flex"
              )}
            >
              {companyInitial}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  to={`/company/${encodeURIComponent(job.companyName || 'zen')}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition truncate flex items-center gap-1"
                >
                  <FaBuilding className="text-[11px] text-slate-400 flex-shrink-0" />
                  <span className="truncate">{job?.companyName || 'Verified Employer'}</span>
                </Link>
                {job?.verified !== false && <VerifiedBadge text="Verified" size="sm" />}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition tracking-tight mt-0.5 truncate font-display">
                {job?.position || 'Job Opening'}
              </h3>
            </div>
          </div>

          {/* Bookmark Toggle Icon */}
          <button
            onClick={toggleSave}
            disabled={isToggling}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition border flex-shrink-0 shadow-2xs",
              isSaved
                ? "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                : "bg-slate-50 border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50"
            )}
            title={isSaved ? "Remove bookmark" : "Save job"}
            aria-label={isSaved ? `Remove bookmark for ${job?.position}` : `Save ${job?.position}`}
          >
            {isSaved ? <FaBookmark size={13} /> : <FaRegBookmark size={13} />}
          </button>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 my-4">
          <Badge variant="primary" size="sm" icon={<FaBriefcase className="text-[10px]" />}>
            {job?.category || 'General'}
          </Badge>

          <Badge variant="default" size="sm" icon={<FaClock className="text-[10px]" />}>
            {job?.jobType || 'Full-time'}
          </Badge>

          <Badge variant="default" size="sm" icon={<FaMapMarkerAlt className="text-[10px]" />}>
            {job?.location || 'India'}
          </Badge>

          {job?.experience && (
            <Badge variant="default" size="sm">
              Exp: {job.experience}
            </Badge>
          )}
        </div>

        {/* Short description preview if available */}
        {job?.description && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {job.description}
          </p>
        )}
      </div>

      {/* Footer: Salary, Action CTA, and optional explicit Remove Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        <div>
          <span className="text-[10px] text-slate-500 block font-medium">Compensation</span>
          <span className="text-sm font-bold text-emerald-600">
            {formattedSalary}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {showRemoveAction && (
            <Button
              variant="outline"
              size="sm"
              icon={<FaTrashAlt className="text-[11px] text-rose-500" />}
              onClick={handleExplicitRemove}
              className="text-xs px-2.5 py-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 rounded-xl"
              aria-label={`Remove saved job: ${job?.position}`}
            >
              Remove
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/jobs/${job.id}`, { state: { job } });
            }}
            className="text-xs px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl"
          >
            Details
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<FaArrowRight className="text-xs" />}
            iconPosition="right"
            onClick={handleApply}
            className="text-xs px-3.5 py-1.5 rounded-xl font-bold shadow-xs"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
