import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBuilding,
  FaBriefcase,
  FaClock,
  FaCalendarAlt,
  FaArrowLeft,
  FaBookmark,
  FaRegBookmark,
  FaCheckCircle,
  FaUsers,
  FaShieldAlt,
  FaFileContract,
  FaExclamationCircle,
  FaGraduationCap,
  FaLaptopHouse,
  FaCalendarCheck,
  FaBullseye,
  FaInfoCircle,
  FaMoneyBillAlt,
} from 'react-icons/fa';
import { useAuth } from './useAuth';
import { isJobSaved } from '../firebaseUtils';
import { getJobById, toggleSaveJob, getCandidateApplications } from '../services/recruitmentService';
import { VerifiedBadge, Badge } from './ui/Badge';
import { Button } from './ui/Button';

const JobDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: paramId, jobId: paramJobId } = useParams();
  const { user } = useAuth();

  const [job, setJob] = useState(location.state?.job || null);
  const [loading, setLoading] = useState(!job);
  const [isSaved, setIsSaved] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // If job wasn't passed via state, load from params or search params
  useEffect(() => {
    let isMounted = true;
    const loadJob = async () => {
      if (!job) {
        const queryParams = new URLSearchParams(location.search);
        const resolvedJobId = paramJobId || paramId || queryParams.get('id');
        if (resolvedJobId) {
          const fetched = await getJobById(resolvedJobId);
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
  }, [location.search, paramJobId, paramId, job]);

  // Check saved state
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

  // Check if candidate already applied
  useEffect(() => {
    let isMounted = true;
    const checkApplied = async () => {
      if (user?.uid && job?.id) {
        const userApps = await getCandidateApplications({ userId: user.uid, applicantEmail: user.email });
        const applied = userApps.some((app) => app.jobId === job.id);
        if (isMounted) setHasApplied(applied);
      }
    };
    checkApplied();
    return () => {
      isMounted = false;
    };
  }, [user?.uid, user?.email, job?.id]);

  const handleApply = () => {
    if (job?.status === 'Closed') return;
    if (!user) {
      navigate(`/login?returnUrl=/jobs/${job.id}/apply`, {
        state: { from: location, returnUrl: `/jobs/${job.id}/apply` },
      });
      return;
    }
    navigate(`/jobs/${job.id}/apply`, { state: { job } });
  };

  const toggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isToggling || !job?.id) return;

    setIsToggling(true);
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);

    const res = await toggleSaveJob(user.uid, job.id);
    if (res.success) {
      setIsSaved(res.isSaved);
    } else {
      setIsSaved(prevSaved);
    }
    setIsToggling(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading position details...</span>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <FaBriefcase className="text-4xl text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2 font-display">Job Opening Not Found</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            The job you are looking for may have been filled, closed, or removed by the hiring company.
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/jobs')} className="rounded-xl shadow-xs">
            Browse All Jobs
          </Button>
        </div>
      </div>
    );
  }

  const isClosed = job.status === 'Closed' || job.status === 'Draft';

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
    return 'Disclosed on application';
  })();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 transition bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs"
        >
          <FaArrowLeft className="text-[10px]" />
          <span>Back to Jobs</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Job Content (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              
              {isClosed && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                  <FaExclamationCircle className="text-amber-600 text-sm flex-shrink-0" />
                  <span>This position is closed or inactive. Applications are no longer accepted.</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center font-bold text-indigo-600 text-2xl flex-shrink-0 shadow-xs">
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
                      {job?.clientCompanyName ? (
                        <>
                          <span className="text-sm sm:text-base font-extrabold text-slate-900">
                            {job.clientCompanyName}
                          </span>
                          <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-medium">
                            Hiring Client
                          </span>
                          <span className="text-xs text-slate-400">â€¢</span>
                          <span className="text-xs text-slate-500 font-medium">
                            via Staffing Partner:
                          </span>
                          <Link
                            to={`/company/${encodeURIComponent(job.companyName || '')}`}
                            className="text-xs font-semibold text-slate-700 hover:text-indigo-600 transition underline underline-offset-2"
                          >
                            {job.companyName}
                          </Link>
                        </>
                      ) : (
                        <Link
                          to={`/company/${encodeURIComponent(job.companyName || '')}`}
                          className="text-sm sm:text-base font-bold text-slate-700 hover:text-indigo-600 transition"
                        >
                          {job.companyName}
                        </Link>
                      )}
                      {job.verified !== false && <VerifiedBadge text="Verified Partner" size="sm" />}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 font-display">
                      {job.position}
                    </h1>
                  </div>
                </div>

                {/* Bookmark Toggle Button */}
                <button
                  onClick={toggleSave}
                  disabled={isToggling}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition border flex-shrink-0 shadow-xs ${
                    isSaved
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200'
                  }`}
                  title={isSaved ? 'Remove bookmark' : 'Save position'}
                  aria-label={isSaved ? `Remove bookmark for ${job?.position}` : `Save ${job?.position}`}
                >
                  {isSaved ? <FaBookmark size={15} /> : <FaRegBookmark size={15} />}
                </button>

              </div>

              {/* Tags Grid */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                <Badge variant="primary" size="md" icon={<FaBriefcase className="text-xs" />}>
                  {job.category || 'General'}
                </Badge>
                <Badge variant="default" size="md" icon={<FaClock className="text-xs" />}>
                  {job.jobType || 'Full-time'}
                </Badge>
                {job.workMode && (
                  <Badge variant="default" size="md" icon={<FaLaptopHouse className="text-xs" />}>
                    {job.workMode}
                  </Badge>
                )}
                <Badge variant="default" size="md" icon={<FaMapMarkerAlt className="text-xs" />}>
                  {job.location || 'India'}
                </Badge>
                {job.qualification && (
                  <Badge variant="default" size="md" icon={<FaGraduationCap className="text-xs" />}>
                    {job.qualification}
                  </Badge>
                )}
                {job.weekdays && (
                  <Badge variant="default" size="md" icon={<FaCalendarCheck className="text-xs" />}>
                    {job.weekdays}
                  </Badge>
                )}
                {job.experience && (
                  <Badge variant="default" size="md">
                    Exp: {job.experience}
                  </Badge>
                )}
                {job.vacancies && (
                  <Badge variant="default" size="md" icon={<FaUsers className="text-xs" />}>
                    {job.vacancies} Vacanc{Number(job.vacancies) === 1 ? 'y' : 'ies'}
                  </Badge>
                )}
                {job.registrationFeeType && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                    job.registrationFeeType.includes('Free')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {job.registrationFeeType}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Job Overview & Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Work Mode</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <FaLaptopHouse className="text-indigo-600 text-xs" />
                    {job.workMode || 'In-Office'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Working Days / Shifts</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <FaCalendarCheck className="text-indigo-600 text-xs" />
                    {job.weekdays || 'Regular Schedule'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Min. Qualification</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <FaGraduationCap className="text-indigo-600 text-xs" />
                    {job.qualification || 'Not Specified'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Daily Target / Work</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <FaBullseye className="text-indigo-600 text-xs" />
                    {job.dailyTarget || 'No Target'}
                  </span>
                  {job.dailyTargetDetails && (
                    <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                      {job.dailyTargetDetails}
                    </span>
                  )}
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Total Open Seats</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <FaUsers className="text-indigo-600 text-xs" />
                    {job.vacancies || '1'} Positions
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Registration / Fee</span>
                  <span className={`text-sm font-bold mt-0.5 flex items-center gap-1.5 ${
                    !job.registrationFeeType || job.registrationFeeType.includes('Free')
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}>
                    <FaMoneyBillWave className="text-xs" />
                    {job.registrationFeeType || '100% Free'}
                  </span>
                </div>
              </div>

              {/* If registration fee has note or amount */}
              {job.registrationFeeType && !job.registrationFeeType.includes('Free') && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <FaInfoCircle className="text-amber-600" />
                    <span>Fee / Deposit Notice: {job.registrationFeeType} {job.registrationFeeAmount ? `(₹${job.registrationFeeAmount})` : ''}</span>
                  </div>
                  {job.registrationFeeNote && (
                    <p className="text-amber-800 leading-relaxed pl-5">
                      {job.registrationFeeNote}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Branch / Multi-Location Breakdown */}
            {job.locationsList && job.locationsList.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FaMapMarkerAlt className="text-indigo-600" />
                    <span>Openings By Location / Branch ({job.locationsList.length})</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    Total: {job.vacancies || job.locationsList.reduce((acc, curr) => acc + (Number(curr.seats) || 1), 0)} Seats
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {job.locationsList.map((loc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {loc.city || 'City Location'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-extrabold flex-shrink-0 ml-2">
                        {loc.seats || 1} {Number(loc.seats) === 1 ? 'Seat' : 'Seats'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements & Skills */}
            {job.requirements && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                  <FaCheckCircle className="text-indigo-600 text-base" />
                  <span>Candidate Requirements & Eligibility</span>
                </h3>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  {job.requirements}
                </div>
              </div>
            )}

            {/* Description & Overview */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">Role Overview & Responsibilities</h3>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line font-normal">
                {job.description ? (
                  <p>{job.description}</p>
                ) : (
                  <p className="text-slate-500 italic">
                    Detailed responsibilities and requirement criteria will be shared directly by the recruiter during initial screening. Please review the role title, category, and compensation provided above.
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Sticky Sidebar (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 space-y-6">
              
              {/* Application Action Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                    Offered Compensation
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 font-display">
                    {formattedSalary}
                  </div>
                  <span className="text-[11px] text-slate-500">Gross Annual CTC</span>
                </div>

                {hasApplied ? (
                  <div className="w-full py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold flex items-center justify-center gap-2">
                    <FaCheckCircle className="text-emerald-600" />
                    <span>Application Submitted</span>
                  </div>
                ) : isClosed ? (
                  <button
                    disabled
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-100 text-slate-400 text-sm font-bold cursor-not-allowed border border-slate-200"
                  >
                    Applications Closed
                  </button>
                ) : (
                  <Button
                    variant="primary"
                    size="xl"
                    onClick={handleApply}
                    className="w-full text-base font-bold rounded-xl shadow-xs"
                  >
                    Apply For This Job
                  </Button>
                )}

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <FaShieldAlt className="text-indigo-600 flex-shrink-0" />
                    <span>Direct submission to recruiting team</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-600 flex-shrink-0" />
                    <span>Zero candidate charges or deduction</span>
                  </div>
                </div>
              </div>

              {/* Company Info Box */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900">
                  {job.clientCompanyName ? 'Hiring & Placement Details' : 'About The Company'}
                </h4>
                {job.clientCompanyName ? (
                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                    <p>
                      <strong className="text-slate-800">Target Employer:</strong> {job.clientCompanyName}
                    </p>
                    <p>
                      <strong className="text-slate-800">Manpower / Staffing Partner:</strong> {job.companyName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Applications will be managed and reviewed by {job.companyName} for placement at {job.clientCompanyName}.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {job.companyName} is a verified employer actively expanding their organization on ZenSolve.
                  </p>
                )}
                <Link
                  to={`/company/${encodeURIComponent(job.companyName || '')}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 block pt-1"
                >
                  View Agency Profile & All Openings →
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
