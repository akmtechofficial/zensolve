import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/useAuth';
import {
  getCandidateApplications,
  getUserSavedJobs,
  getJobs,
} from '../../services/recruitmentService';
import CandidateLayout from './CandidateLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  FaBriefcase,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaBookmark,
  FaArrowRight,
  FaCalendarCheck,
  FaSearch,
  FaUserEdit,
} from 'react-icons/fa';

const CandidateHome = () => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        const [apps, saved, allJobs] = await Promise.all([
          getCandidateApplications(user?.uid, user?.email),
          getUserSavedJobs(user?.uid),
          getJobs({ onlyActive: true }),
        ]);

        if (isMounted) {
          setApplications(apps);
          setSavedJobs(saved);
          setRecommendedJobs(allJobs.slice(0, 3));
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading candidate dashboard:', err);
        if (isMounted) setLoading(false);
      }
    };

    if (user?.uid) {
      loadDashboardData();
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Metric counts
  const totalApps = applications.length;
  const underReviewCount = applications.filter(
    (a) => a.status === 'Under Review' || a.status === 'Applied'
  ).length;
  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;
  const interviewCount = applications.filter(
    (a) => a.status === 'Interview Scheduled'
  ).length;

  // Profile strength calculation
  let profileScore = 20; // base account
  if (userData?.phone) profileScore += 20;
  if (userData?.headline) profileScore += 20;
  if (userData?.resume || userData?.resumeURL) profileScore += 20;
  if (userData?.skills && userData.skills.length > 0) profileScore += 20;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Shortlisted':
        return <Badge variant="success">Shortlisted</Badge>;
      case 'Interview Scheduled':
        return <Badge variant="purple">Interview Scheduled</Badge>;
      case 'Selected':
        return <Badge variant="verified">Selected</Badge>;
      case 'Under Review':
        return <Badge variant="warning">Under Review</Badge>;
      case 'Rejected':
        return <Badge variant="danger">Not Selected</Badge>;
      case 'Withdrawn':
        return <Badge variant="default">Withdrawn</Badge>;
      default:
        return <Badge variant="primary">Applied</Badge>;
    }
  };

  return (
    <CandidateLayout
      title={`Hello, ${userData?.displayName || user?.displayName || 'Candidate'} 👋`}
      subtitle="Track your applications, interview schedules, and personalized job matches."
    >
      {/* Top Banner: Profile Completion */}
      <div className="glass-surface-3 glass-specular p-6 rounded-3xl border border-slate-200/90 shadow-sm mb-8 bg-white/95 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-xl font-bold font-display shadow-xs flex-shrink-0">
            {profileScore}%
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight font-display">
              Candidate Profile Strength
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {profileScore >= 80
                ? 'Your profile is highly optimized for verified corporate recruiters.'
                : 'Complete your bio, skills, and resume to improve visibility to recruiters.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            icon={<FaUserEdit className="text-xs" />}
            onClick={() => navigate('/candidate/profile')}
            className="flex-1 md:flex-initial"
          >
            Edit Profile
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<FaFileAlt className="text-xs" />}
            onClick={() => navigate('/candidate/resume')}
            className="flex-1 md:flex-initial shadow-xs"
          >
            Manage Resume
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Total Applications */}
        <div className="glass-surface-2 p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs bg-white/90">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Applied
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm border border-indigo-100">
              <FaBriefcase />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            {loading ? '...' : totalApps}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Submitted roles</span>
        </div>

        {/* Under Review */}
        <div className="glass-surface-2 p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs bg-white/90">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In Review
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm border border-amber-100">
              <FaClock />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            {loading ? '...' : underReviewCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Awaiting recruiter action</span>
        </div>

        {/* Shortlisted */}
        <div className="glass-surface-2 p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs bg-white/90">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Shortlisted
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm border border-emerald-100">
              <FaCheckCircle />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            {loading ? '...' : shortlistedCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Profile selected</span>
        </div>

        {/* Interview Scheduled */}
        <div className="glass-surface-2 p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs bg-white/90">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Interviews
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-sm border border-violet-100">
              <FaCalendarCheck />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            {loading ? '...' : interviewCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active rounds scheduled</span>
        </div>
      </div>

      {/* 2-Column Section: Recent Applications & Recommended Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Applications (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight font-display">
              Recent Applications
            </h3>
            <Link
              to="/candidate/applications"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <span>View All ({totalApps})</span>
              <FaArrowRight size={10} />
            </Link>
          </div>

          <div className="glass-surface-2 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden bg-white/95">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs">Loading applications...</div>
            ) : applications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-900 block font-display">
                        {app.jobPosition || 'Role Position'}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                        <span className="font-medium text-indigo-600">{app.companyName}</span>
                        <span>•</span>
                        <span>{app.location || 'India'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(app.status)}
                      <Link
                        to={`/candidate/applications/${app.id}`}
                        className="text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center space-y-3">
                <FaBriefcase className="text-3xl text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Applications Submitted Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse open positions from verified companies and submit your application with one click.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/jobs')}
                  className="mt-2"
                >
                  Explore Jobs
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Saved Jobs & Quick Shortcuts (Span 1) */}
        <div className="space-y-6">
          {/* Saved Jobs Card */}
          <div className="glass-surface-2 p-6 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <FaBookmark className="text-indigo-600 text-sm" />
                <span>Saved Jobs ({savedJobs.length})</span>
              </h3>
              <Link
                to="/candidate/saved-jobs"
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                View
              </Link>
            </div>

            {savedJobs.length > 0 ? (
              <div className="space-y-3">
                {savedJobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-indigo-300 transition flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block truncate max-w-[160px]">
                        {job.position}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[160px]">
                        {job.companyName}
                      </span>
                    </div>
                    <Link
                      to={`/job-details/${job.id}`}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Apply
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                You haven't bookmarked any jobs yet. When exploring, click the bookmark icon to save roles.
              </p>
            )}
          </div>

          {/* Quick Support / Contact Card */}
          <div className="glass-surface-2 p-6 rounded-3xl border border-slate-200/90 shadow-sm bg-indigo-50/50 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 font-display">Need Career Assistance?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our placement coordinators assist candidates with resume reviews and interview preparation.
            </p>
            <Link to="/contactus">
              <Button variant="outline" size="sm" className="w-full bg-white">
                Contact Recruitment Desk
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </CandidateLayout>
  );
};

export default CandidateHome;
