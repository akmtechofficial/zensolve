import React, { useState, useEffect } from 'react';
import {
  FaBookmark,
  FaRegBookmark,
  FaMapMarkerAlt,
  FaBriefcase,
  FaClock,
  FaTrashAlt,
  FaArrowRight,
  FaCheckCircle,
  FaLaptopHouse,
  FaGraduationCap,
} from 'react-icons/fa';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './useAuth';
import { toggleSaveJob } from '../services/recruitmentService';
import { isJobSaved } from '../firebaseUtils';

const JobCard = ({ job, onQuickApply, showRemoveAction = false, onRemove }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
    if (!user) {
      navigate(`/login?returnUrl=/jobs/${job.id}/apply`, {
        state: { from: location, returnUrl: `/jobs/${job.id}/apply` },
      });
      return;
    }
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
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);

    const res = await toggleSaveJob(user.uid, job.id);
    if (res.success) {
      setIsSaved(res.isSaved);
      if (onRemove && !res.isSaved) {
        onRemove(job.id);
      }
    } else {
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

  const formattedSalary = (() => {
    if (job?.salaryMin !== undefined && job?.salaryMax !== undefined) {
      const min = Number(job.salaryMin);
      const max = Number(job.salaryMax);
      if (max <= 100) return `₹${min} - ₹${max} LPA`;
      return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`;
    }
    if (job?.salaryFrom && job?.salaryTo) {
      const from = Number(job.salaryFrom);
      const to = Number(job.salaryTo);
      if (to <= 100) return `₹${from} - ₹${to} LPA`;
      return `₹${from.toLocaleString('en-IN')} - ₹${to.toLocaleString('en-IN')} / mo`;
    }
    if (job?.salaryFrom) {
      const from = Number(job.salaryFrom);
      return from <= 100 ? `₹${from} LPA` : `₹${from.toLocaleString('en-IN')} / mo`;
    }
    if (job?.salary) return job.salary;
    return null;
  })();

  const hiringCompany = job?.clientCompanyName || job?.companyName || 'Verified Company';
  const agencyName = job?.clientCompanyName ? (job?.companyName || null) : null;
  const companyInitial = hiringCompany.charAt(0).toUpperCase();

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:border-indigo-400 hover:shadow-xs transition duration-150 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top: Logo, Company & Save */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {job?.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={`${hiringCompany} logo`}
                className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200 p-0.5 flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center flex-shrink-0 ${
                job?.companyLogo ? 'hidden' : 'flex'
              }`}
            >
              {companyInitial}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  to={`/company/${encodeURIComponent(job.companyName || 'zen')}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-semibold text-slate-700 hover:text-indigo-600 transition flex items-center gap-1 truncate"
                >
                  <span className="font-bold text-slate-900 truncate">{hiringCompany}</span>
                  {job?.verified !== false && (
                    <FaCheckCircle className="text-emerald-500 text-[10px] flex-shrink-0" title="Verified" />
                  )}
                </Link>
                {agencyName && (
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium truncate">
                    via {agencyName}
                  </span>
                )}
              </div>
              
              <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition tracking-tight mt-0.5 truncate">
                {job?.position || 'Job Opening'}
              </h2>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={toggleSave}
            disabled={isToggling}
            className={`p-2 rounded-lg border transition flex-shrink-0 cursor-pointer ${
              isSaved
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={isSaved ? 'Remove bookmark' : 'Save job'}
            aria-label={isSaved ? 'Remove bookmark' : 'Save job'}
          >
            {isSaved ? <FaBookmark size={12} /> : <FaRegBookmark size={12} />}
          </button>
        </div>

        {/* Middle: Badges */}
        <div className="flex flex-wrap items-center gap-1.5 my-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
            <FaMapMarkerAlt className="text-[10px] text-slate-400" />
            <span>{job?.location || 'Pan India'}</span>
          </span>

          {job?.workMode && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
              <FaLaptopHouse className="text-[10px] text-indigo-500" />
              <span>{job.workMode}</span>
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
            <FaClock className="text-[10px] text-slate-400" />
            <span>{job?.jobType || job?.type || 'Full-time'}</span>
          </span>

          {job?.qualification && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
              <FaGraduationCap className="text-[10px] text-slate-400" />
              <span>{job.qualification}</span>
            </span>
          )}

          {job?.category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
              <FaBriefcase className="text-[10px] text-slate-400" />
              <span>{job.category}</span>
            </span>
          )}

          {job?.vacancies && (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 font-bold text-[11px]">
              {job.vacancies} Openings
            </span>
          )}

          {job?.registrationFeeType && job.registrationFeeType.includes('Free') && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold text-[10px]">
              Free Apply
            </span>
          )}
        </div>
      </div>

      {/* Footer: Salary & Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-1">
        <div>
          {formattedSalary ? (
            <span className="text-xs sm:text-sm font-bold text-emerald-700">
              {formattedSalary}
            </span>
          ) : (
            <span className="text-xs text-slate-500 font-medium">Disclosed on apply</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {showRemoveAction && (
            <button
              type="button"
              onClick={handleExplicitRemove}
              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs transition"
              title="Remove from saved"
            >
              <FaTrashAlt size={11} />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/jobs/${job.id}`, { state: { job } });
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            Details
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <span>Apply</span>
            <FaArrowRight className="text-[9px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
