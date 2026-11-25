import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getJobs, moderateJob } from '../../services/recruitmentService';
import { useAuth } from '../../components/useAuth';
import {
  FaBriefcase,
  FaSearch,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaBuilding,
  FaShieldAlt,
  FaPlus,
  FaUserShield,
} from 'react-icons/fa';

const AdminJobs = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [moderationModal, setModerationModal] = useState(null); // { job, action: 'Approved' | 'Rejected' | 'delete' }
  const [moderationReason, setModerationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [flashMessage, setFlashMessage] = useState(location.state?.successMessage || null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleModerate = async () => {
    if (!moderationModal) return;
    const { job, action } = moderationModal;
    setActionLoading(true);

    try {
      const res = await moderateJob(
        job.id,
        action,
        moderationReason || `Super-Admin action: ${action}`,
        user?.email || 'admin@zensolve.com'
      );

      if (res.success) {
        if (action === 'delete') {
          setJobs((prev) => prev.filter((j) => j.id !== job.id));
        } else {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === job.id
                ? {
                    ...j,
                    status: action === 'Approved' ? 'Active' : 'Closed',
                    moderationStatus: action,
                  }
                : j
            )
          );
        }
        setModerationModal(null);
        setModerationReason('');
      } else {
        alert(res.error || 'Failed to moderate job.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const query = searchQuery.toLowerCase();
    const matchSearch =
      (j.position || '').toLowerCase().includes(query) ||
      (j.companyName || '').toLowerCase().includes(query) ||
      (j.location || '').toLowerCase().includes(query) ||
      (j.category || '').toLowerCase().includes(query);

    if (!matchSearch) return false;

    if (statusFilter === 'active') return j.status === 'Active' || !j.status;
    if (statusFilter === 'closed') return j.status === 'Closed';
    return true;
  });

  return (
    <AdminLayout
      title="Job Moderation & Listings Catalog"
      subtitle="Supervise published job listings across all companies, detect fraudulent posts, and publish jobs on behalf of registered employers."
    >
      {/* Success Flash Toast */}
      {flashMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-emerald-600 text-sm" />
            <span>{flashMessage}</span>
          </div>
          <button
            onClick={() => setFlashMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-4 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Top Actions & Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <FaPlus className="text-[10px]" />
            <span>Post Job for a Company</span>
          </Link>

          <div className="flex items-center gap-1.5 p-1 glass-surface-2 rounded-2xl border border-slate-200/90 overflow-x-auto">
            {[
              { id: 'all', label: 'All Listings', count: jobs.length },
              {
                id: 'active',
                label: 'Active',
                count: jobs.filter((j) => j.status === 'Active' || !j.status).length,
              },
              {
                id: 'closed',
                label: 'Closed',
                count: jobs.filter((j) => j.status === 'Closed').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    statusFilter === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full lg:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search job title, company, city..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl glass-input text-xs text-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="glass-surface-2 glass-specular rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-600 font-medium">
            Fetching job postings...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto text-lg">
              <FaBriefcase />
            </div>
            <div className="text-sm font-bold text-slate-800">No jobs found</div>
            <p className="text-xs text-slate-600">No listings match your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3.5 px-6">Job Position</th>
                  <th className="py-3.5 px-4">Company Entity</th>
                  <th className="py-3.5 px-4">Category & Type</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/90">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 font-display text-sm flex items-center gap-2">
                        <span>{job.position}</span>
                        {job.postedByAdmin && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200"
                            title={`Posted on behalf of ${job.companyName || 'company'} by Super-Admin`}
                          >
                            <FaUserShield className="text-[9px]" />
                            <span>Posted by Admin</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Exp: {job.experience || 'Not specified'} • Vacancies: {job.vacancies || 1}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {job.clientCompanyName ? (
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <FaBuilding className="text-indigo-600 text-xs shrink-0" />
                            <span className="truncate max-w-[180px]">{job.clientCompanyName}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Agency: {job.companyName || 'Unknown'}
                          </div>
                        </div>
                      ) : (
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <FaBuilding className="text-slate-400 text-xs shrink-0" />
                          <span>{job.companyName || 'Confidential'}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      <div className="font-medium text-slate-900">{job.category || 'General'}</div>
                      <div className="text-[11px] text-slate-600">{job.jobType || 'Full-time'}</div>
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-center gap-1 text-slate-700">
                        <FaMapMarkerAlt className="text-slate-400 text-[10px]" />
                        <span>{job.location || 'Remote'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          job.status === 'Closed'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {job.status || 'Active'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/jobs/${job.id}`}
                          target="_blank"
                          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                          title="View Live Listing"
                        >
                          <FaEye />
                        </Link>

                        <button
                          onClick={() => setModerationModal({ job, action: 'delete' })}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete / Take Down Job"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Moderation Confirmation Modal */}
      {moderationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <FaShieldAlt className="text-rose-600" />
              <span>Confirm Listing Removal / Moderation</span>
            </h3>
            <p className="text-xs text-slate-600">
              You are removing listing <strong className="text-slate-900">{moderationModal.job.position}</strong> by{' '}
              <strong className="text-slate-900">{moderationModal.job.companyName}</strong>.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Reason for Moderation / Take-down
              </label>
              <textarea
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="e.g. Non-compliant salary disclosures, duplicate listing, policy violation..."
                rows="3"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setModerationModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleModerate}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                {actionLoading ? 'Removing...' : 'Confirm Take-Down'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminJobs;
