import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { getJobs, getJobApplications } from '../../services/recruitmentService';
import { useAuth } from '../../components/useAuth';
import { Button } from '../../components/ui/Button';
import { Badge, VerifiedBadge } from '../../components/ui/Badge';
import {
  FaBriefcase,
  FaUsers,
  FaCheckCircle,
  FaPlus,
  FaFileAlt,
  FaClock,
  FaExternalLinkAlt,
  FaArrowRight,
  FaBolt,
} from 'react-icons/fa';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      setLoading(true);
      const [jobsData, appsData] = await Promise.all([
        getJobs(),
        getJobApplications(),
      ]);
      if (isMounted) {
        setJobs(jobsData);
        setApplications(appsData);
        setLoading(false);
      }
    };
    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalJobs = jobs.length;
  const totalApps = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;
  const pendingCount = applications.filter((a) => !a.status || a.status === 'Pending').length;

  return (
    <DashboardLayout
      title="Recruitment Console Overview"
      subtitle="Monitor active openings, track incoming candidate applications, and accelerate hiring."
      actions={
        <Button
          variant="primary"
          size="md"
          icon={<FaPlus className="text-xs" />}
          onClick={() => navigate('/dashboard/post-job')}
          className="rounded-2xl shadow-glow-sm"
        >
          Post New Opening
        </Button>
      }
    >
      <div className="space-y-8">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-surface-2 glass-specular p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Active Openings
              </span>
              <div className="w-9 h-9 rounded-2xl glass-surface-1 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <FaBriefcase size={14} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-display">
              {loading ? '...' : totalJobs}
            </div>
            <p className="text-xs text-slate-400 mt-1">Live published positions</p>
          </div>

          <div className="glass-surface-2 glass-specular p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Total Applicants
              </span>
              <div className="w-9 h-9 rounded-2xl glass-surface-1 border border-blue-500/30 text-sky-400 flex items-center justify-center">
                <FaUsers size={14} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-display">
              {loading ? '...' : totalApps}
            </div>
            <p className="text-xs text-slate-400 mt-1">Submissions received</p>
          </div>

          <div className="glass-surface-2 glass-specular p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Shortlisted
              </span>
              <div className="w-9 h-9 rounded-2xl glass-surface-1 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <FaCheckCircle size={14} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-display">
              {loading ? '...' : shortlistedCount}
            </div>
            <p className="text-xs text-slate-400 mt-1">Candidates in pipeline</p>
          </div>

          <div className="glass-surface-2 glass-specular p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Pending Review
              </span>
              <div className="w-9 h-9 rounded-2xl glass-surface-1 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <FaClock size={14} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-display">
              {loading ? '...' : pendingCount}
            </div>
            <p className="text-xs text-slate-400 mt-1">Awaiting evaluation</p>
          </div>
        </div>

        {/* Recent Applications Table */}
        <div className="glass-surface-2 glass-specular rounded-3xl border border-white/10 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight font-display">Recent Applications</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Latest candidates who submitted their resume to published openings.
              </p>
            </div>
            <Link
              to="/dashboard/applicants"
              className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 flex items-center gap-1.5 transition"
            >
              <span>View All Applicants</span>
              <FaArrowRight size={10} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="text-xs text-slate-400 uppercase glass-surface-1 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Candidate</th>
                  <th className="py-3 px-4">Role Applied</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl">Resume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:glass-surface-1 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>{app.applicantName || 'Anonymous'}</div>
                      <div className="text-xs text-slate-400 font-normal">{app.applicantEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {app.jobPosition || 'General Application'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {app.companyName || 'ZenSolve'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          app.status === 'Shortlisted'
                            ? 'success'
                            : app.status === 'Rejected'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {app.status || 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      {app.resume ? (
                        <a
                          href={app.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 font-semibold"
                        >
                          <FaFileAlt size={11} />
                          <span>View</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">None</span>
                      )}
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                      No applications recorded yet. Applications submitted to your jobs will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Openings Overview */}
        <div className="glass-surface-2 glass-specular rounded-3xl border border-white/10 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight font-display">Active Job Listings</h3>
              <p className="text-xs text-slate-300 mt-0.5">Manage positions currently visible on the public discovery portal.</p>
            </div>
            <Link
              to="/dashboard/jobs"
              className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 flex items-center gap-1.5 transition"
            >
              <span>Manage All Jobs</span>
              <FaArrowRight size={10} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl glass-surface-1 border border-white/10 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-indigo-300">{job.category || 'General'}</span>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                  <h4 className="text-base font-bold text-white tracking-tight font-display">{job.position}</h4>
                  <p className="text-xs text-slate-400">{job.companyName} • {job.location}</p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400">
                    ₹{job.salaryFrom} - ₹{job.salaryTo}
                  </span>
                  <Link
                    to="/dashboard/jobs"
                    className="text-indigo-300 hover:text-indigo-200 font-medium"
                  >
                    Edit / Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
