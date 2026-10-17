import React, { useState, useEffect } from 'react';
import {
  FaLaptop,
  FaClock,
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
  FaBriefcase,
  FaCalendarAlt,
  FaArrowRight,
  FaBuilding,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { isJobSaved, saveJobToUser } from '../firebaseUtils';
import { Badge, VerifiedBadge } from './ui/Badge';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

const JobCard = ({ job, onQuickApply }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(job?.saveCount || 0);

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
      navigate('/apply-job', { state: { job } });
    }
  };

  const handleCardClick = () => {
    navigate('/job-details', { state: { job } });
  };

  const toggleSave = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isSaved) {
      await saveJobToUser(user.uid, job.id);
      setIsSaved(true);
      setSaveCount((prev) => prev + 1);
    }
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
      className="group relative rounded-3xl glass-surface-2 glass-specular glass-card-interactive p-5 sm:p-6 cursor-pointer flex flex-col justify-between border border-slate-200/90 shadow-sm hover:shadow-md"
    >
      <div>
        {/* Header: Company Logo & Details + Save Button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {job?.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={`${job.companyName} logo`}
                className="w-12 h-12 rounded-2xl object-cover bg-white border border-slate-200 p-1 flex-shrink-0 group-hover:border-indigo-400 transition shadow-xs"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={cn(
                "w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-xs",
                job?.companyLogo ? "hidden" : "flex"
              )}
            >
              {companyInitial}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={`/company/${encodeURIComponent(job.companyName || 'zen')}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition truncate flex items-center gap-1.5"
                >
                  <FaBuilding className="text-xs text-slate-400 flex-shrink-0" />
                  <span className="truncate">{job?.companyName || 'Verified Employer'}</span>
                </Link>
                {job?.verified !== false && <VerifiedBadge text="Verified" size="sm" />}
              </div>

              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition tracking-tight mt-0.5 truncate font-display">
                {job?.position || 'Job Opening'}
              </h3>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={toggleSave}
            className={cn(
              "w-9 h-9 rounded-2xl flex items-center justify-center transition border flex-shrink-0",
              isSaved
                ? "bg-rose-50 border-rose-200 text-rose-500"
                : "glass-surface-1 border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200"
            )}
            title={isSaved ? "Saved" : "Save Job"}
          >
            {isSaved ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
          </button>
        </div>

        {/* Tags / Pills */}
        <div className="flex flex-wrap gap-2 my-4">
          <Badge variant="primary" size="sm" icon={<FaBriefcase className="text-xs" />}>
            {job?.category || 'General'}
          </Badge>

          <Badge variant="default" size="sm" icon={<FaClock className="text-xs" />}>
            {job?.jobType || 'Full-time'}
          </Badge>

          <Badge variant="default" size="sm" icon={<FaMapMarkerAlt className="text-xs" />}>
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

      {/* Footer: Salary & Action CTA */}
      <div className="pt-3.5 border-t border-slate-200/80 flex items-center justify-between gap-2 mt-2">
        <div>
          <span className="text-[11px] text-slate-500 block font-medium">Compensation</span>
          <span className="text-sm font-bold text-emerald-600">
            {formattedSalary}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/job-details', { state: { job } });
            }}
            className="text-xs px-2.5 py-1.5 glass-surface-1 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl shadow-xs"
          >
            Details
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<FaArrowRight className="text-xs" />}
            iconPosition="right"
            onClick={handleApply}
            className="text-xs px-3.5 py-1.5 rounded-xl shadow-glow-sm"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
