import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { getJobs, deleteJob, updateJob } from '../../services/recruitmentService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaEdit,
  FaEye,
  FaBriefcase,
  FaMapMarkerAlt,
} from 'react-icons/fa';

const DashboardJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchJobsList = async () => {
    setLoading(true);
    const data = await getJobs();
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobsList();
  }, []);

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

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingJob) return;
    setSavingEdit(true);
    const res = await updateJob(editingJob.id, editingJob);
    if (res.success) {
      setJobs(jobs.map((j) => (j.id === editingJob.id ? editingJob : j)));
      setEditingJob(null);
    } else {
      alert('Failed to update job: ' + res.error);
    }
    setSavingEdit(false);
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
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl glass-input text-sm text-white placeholder:text-slate-500 shadow-md"
            />
          </div>
          <span className="text-xs text-slate-300 glass-surface-1 px-3 py-1.5 rounded-full border border-white/10">
            Total Openings: <strong className="text-white">{filteredJobs.length}</strong>
          </span>
        </div>

        {/* Data Table */}
        <div className="glass-surface-2 glass-specular rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="text-xs text-slate-300 uppercase glass-surface-1 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-5">Position & Company</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Type & Location</th>
                  <th className="py-3.5 px-4">Salary Range</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:glass-surface-1 transition">
                    <td className="py-4 px-5">
                      <div className="font-bold text-white text-base tracking-tight font-display">{job.position}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{job.companyName}</div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="primary" size="sm">
                        {job.category || 'General'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-300">
                      <div>{job.jobType || 'Full-time'}</div>
                      <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                        <FaMapMarkerAlt size={10} className="text-indigo-400" />
                        <span>{job.location || 'India'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-emerald-400">
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
                        onClick={() => setEditingJob(job)}
                        className="p-2 rounded-xl glass-surface-1 border border-white/10 text-slate-300 hover:text-white hover:border-indigo-500/40 transition"
                        title="Edit Job"
                      >
                        <FaEdit size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:text-rose-200 transition"
                        title="Delete Job"
                      >
                        <FaTrash size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredJobs.length === 0 && !loading && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                      No jobs match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Edit Job Modal */}
      {editingJob && (
        <Modal
          isOpen={Boolean(editingJob)}
          onClose={() => setEditingJob(null)}
          title="Edit Job Opening"
          subtitle={`Updating details for ${editingJob.position}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Job Title</label>
                <input
                  type="text"
                  value={editingJob.position || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, position: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Company Name</label>
                <input
                  type="text"
                  value={editingJob.companyName || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <input
                  type="text"
                  value={editingJob.category || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Job Type</label>
                <select
                  value={editingJob.jobType || 'Full-time'}
                  onChange={(e) => setEditingJob({ ...editingJob, jobType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Remote">Remote</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Location</label>
                <input
                  type="text"
                  value={editingJob.location || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Salary From (₹)</label>
                <input
                  type="number"
                  value={editingJob.salaryFrom || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, salaryFrom: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Salary To (₹)</label>
                <input
                  type="number"
                  value={editingJob.salaryTo || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, salaryTo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Job Description</label>
              <textarea
                value={editingJob.description || ''}
                onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                rows="4"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="secondary" size="md" onClick={() => setEditingJob(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={savingEdit}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </DashboardLayout>
  );
};

export default DashboardJobs;
