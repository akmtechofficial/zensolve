import React, { useEffect, useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { getJobApplications, updateApplicationStatus } from '../../services/recruitmentService';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  FaSearch,
  FaFileAlt,
  FaEnvelope,
  FaExternalLinkAlt,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';

const statusOptions = ['All', 'Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'];

const DashboardApplicants = () => {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApps = async () => {
    setLoading(true);
    const data = await getJobApplications();
    setApplications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    const res = await updateApplicationStatus(appId, newStatus);
    if (res.success) {
      setApplications(
        applications.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } else {
      alert('Failed to update status: ' + res.error);
    }
    setUpdatingId(null);
  };

  const filtered = applications.filter((app) => {
    if (selectedStatus !== 'All') {
      const current = app.status || 'Pending';
      if (current.toLowerCase() !== selectedStatus.toLowerCase()) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      return (
        (app.applicantName && app.applicantName.toLowerCase().includes(s)) ||
        (app.applicantEmail && app.applicantEmail.toLowerCase().includes(s)) ||
        (app.jobPosition && app.jobPosition.toLowerCase().includes(s)) ||
        (app.companyName && app.companyName.toLowerCase().includes(s))
      );
    }
    return true;
  });

  return (
    <DashboardLayout
      title="Candidate Applications"
      subtitle="Review submissions, inspect candidate resumes, and manage pipeline progression."
    >
      <div className="space-y-6">
        
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by candidate name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Applicants Table */}
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Candidate</th>
                  <th className="py-3.5 px-4">Applied Role</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4">Resume / CV</th>
                  <th className="py-3.5 px-5">Hiring Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                          {app.applicantName ? app.applicantName.charAt(0) : <FaUser size={11} />}
                        </div>
                        <div>
                          <div className="font-bold text-white">{app.applicantName || 'Applicant'}</div>
                          <a
                            href={`mailto:${app.applicantEmail}`}
                            className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 mt-0.5"
                          >
                            <FaEnvelope size={10} />
                            <span>{app.applicantEmail}</span>
                          </a>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{app.jobPosition || 'General Role'}</div>
                      <div className="text-xs text-slate-500">{app.companyName}</div>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-400">
                      {app.appliedAt?.toDate
                        ? app.appliedAt.toDate().toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Recently'}
                    </td>

                    <td className="py-4 px-4">
                      {app.resume ? (
                        <a
                          href={app.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 text-xs font-semibold transition"
                        >
                          <FaFileAlt size={12} />
                          <span>View Resume</span>
                          <FaExternalLinkAlt size={9} />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">No file</span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <select
                        value={app.status || 'Pending'}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={updatingId === app.id}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border focus:outline-none transition cursor-pointer ${
                          app.status === 'Shortlisted'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : app.status === 'Rejected'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : app.status === 'Reviewed'
                            ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                            : app.status === 'Hired'
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <option value="Pending" className="bg-slate-900 text-white">Pending</option>
                        <option value="Reviewed" className="bg-slate-900 text-white">Reviewed</option>
                        <option value="Shortlisted" className="bg-slate-900 text-white">Shortlisted</option>
                        <option value="Rejected" className="bg-slate-900 text-white">Rejected</option>
                        <option value="Hired" className="bg-slate-900 text-white">Hired</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500 text-sm">
                      No applications found matching this status or search.
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

export default DashboardApplicants;
