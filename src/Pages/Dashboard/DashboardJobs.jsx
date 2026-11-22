import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { getJobs, deleteJob, updateJob } from '../../services/recruitmentService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaEdit,
  FaEye,
  FaBriefcase,
  FaMapMarkerAlt,
} from 'react-icons/fa';

import { useAuth } from '../../components/useAuth';

const DashboardJobs = () => {
  const navigate = useNavigate();
  const { user, userData, isAdmin } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchJobsList = async () => {
    if (!user) return;
    setLoading(true);
    // HR users only see jobs belonging to their company; superadmins see all
    const data = await getJobs(isAdmin ? {} : { companyId: user.uid });
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobsList();
  }, [user, isAdmin]);

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job opening? This cannot be undone.')) {
      const res = await deleteJob(jobId);
      if (res.success) {
        setJobs(jobs.filter((j) => j.id !== jobId));
      } else {
        alert('Failed to delete job: ' + res.error);
      }
    }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'Closed' ? 'Active' : 'Closed';
    const res = await updateJob(job.id, { status: newStatus });
    if (res.success) {
      setJobs(
        jobs.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
      );
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (job.position && job.position.toLowerCase().includes(term)) ||
      (job.companyName && job.companyName.toLowerCase().includes(term)) ||
      (job.category && job.category.toLowerCase().includes(term)) ||
      (job.location && job.location.toLowerCase().includes(term))
    );
  });

  return (
    <DashboardLayout
      title="Job Listings Management"
      subtitle="View, edit, toggle visibility, or delete job positions published on the platform."
      actions={
        <Button
          variant="primary"
          size="md"
          icon={<FaPlus className="text-xs" />}
          onClick={() => navigate('/dashboard/post-job')}
        >
          Post New Opening
        </Button>
      }
    >
      <div className="space-y-6">
        
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search published roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium shadow-sm"
            />
          </div>
          <span className="text-xs text-slate-600 glass-surface-1 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
            Total Openings: <strong className="text-slate-900">{filteredJobs.length}</strong>
          </span>
        </div>

        {/* Data Table */}
        <div className="glass-surface-2 glass-specular rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs text-slate-500 uppercase glass-surface-1 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5">Position & Company</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Type & Location</th>
                  <th className="py-3.5 px-4">Salary Range</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 text-base tracking-tight font-display">{job.position}</div>
                      {job.clientCompanyName ? (
                        <div className="text-xs text-indigo-700 font-semibold mt-0.5">
                          Hiring for: <span className="font-bold text-slate-800">{job.clientCompanyName}</span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 mt-0.5">{job.companyName}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="primary" size="sm">
                        {job.category || 'General'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600">
                      <div>{job.jobType || 'Full-time'}</div>
                      <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                        <FaMapMarkerAlt size={10} className="text-indigo-600" />
                        <span>{job.location || 'India'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-emerald-600">
                      ₹{job.salaryFrom} - ₹{job.salaryTo}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(job)}
                        className="focus:outline-none"
                        title="Click to toggle status"
                      >
                        <Badge
                          variant={job.status === 'Closed' ? 'danger' : 'success'}
                          size="sm"
                        >
                          {job.status || 'Active'}
                        </Badge>
                      </button>
                    </td>
                    <td className="py-4 px-5 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/hr/jobs/${job.id}/edit`, { state: { job } })}
                        className="p-2 rounded-xl glass-surface-1 border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 transition shadow-xs"
                        title="Edit Job (Full Page)"
                      >
                        <FaEdit size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition shadow-xs"
                        title="Delete Job"
                      >
                        <FaTrash size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredJobs.length === 0 && !loading && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500 text-sm">
                      No jobs match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </DashboardLayout>
  );
};

export default DashboardJobs;
