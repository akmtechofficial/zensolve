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

import { useAuth } from '../../components/useAuth';

const statusOptions = ['All', 'Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn'];

const DashboardApplicants = () => {
  const { user, isAdmin } = useAuth();
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApps = async () => {
    if (!user) return;
    setLoading(true);
    // HR users only see applications for their company; superadmins see all
    const data = await getJobApplications(isAdmin ? {} : { companyId: user.uid });
    setApplications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, [user, isAdmin]);

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
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search by candidate name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedStatus === status
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'glass-surface-1 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Applicants Table */}
        <div className="glass-surface-2 glass-specular rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs text-slate-500 uppercase glass-surface-1 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5">Candidate</th>
                  <th className="py-3.5 px-4">Applied Role</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4">Resume / CV</th>
                  <th className="py-3.5 px-5">Hiring Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                          {app.applicantName ? app.applicantName.charAt(0) : <FaUser size={11} />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 font-display">{app.applicantName || 'Applicant'}</div>
                          <a
                            href={`mailto:${app.applicantEmail}`}
                            className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 mt-0.5"
                          >
                            <FaEnvelope size={10} />
                            <span>{app.applicantEmail}</span>
                          </a>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">{app.jobPosition || 'General Role'}</div>
                      <div className="text-xs text-slate-500">{app.companyName}</div>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500">
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-surface-1 text-indigo-600 border border-indigo-200 hover:border-indigo-400 text-xs font-semibold transition shadow-xs"
                        >
                          <FaFileAlt size={12} />
                          <span>View Resume</span>
                          <FaExternalLinkAlt size={9} />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">No file</span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <select
                        value={app.status || 'Pending'}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={updatingId === app.id}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border focus:outline-none transition cursor-pointer shadow-xs ${
                          app.status === 'Shortlisted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : app.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : app.status === 'Reviewed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : app.status === 'Hired'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="Pending" className="bg-white text-slate-900">Pending</option>
                        <option value="Reviewed" className="bg-white text-slate-900">Reviewed</option>
                        <option value="Shortlisted" className="bg-white text-slate-900">Shortlisted</option>
                        <option value="Rejected" className="bg-white text-slate-900">Rejected</option>
                        <option value="Hired" className="bg-white text-slate-900">Hired</option>
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
