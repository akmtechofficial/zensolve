import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import {
  FaFileAlt,
  FaSearch,
  FaFilePdf,
  FaBuilding,
  FaUser,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaEnvelope,
} from 'react-icons/fa';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const appsRef = collection(db, 'jobApplications');
      const snap = await getDocs(appsRef);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (app.applicantName || '').toLowerCase().includes(q) ||
      (app.applicantEmail || '').toLowerCase().includes(q) ||
      (app.jobTitle || '').toLowerCase().includes(q) ||
      (app.companyName || '').toLowerCase().includes(q);

    if (!matchSearch) return false;
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;

    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Selected':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Withdrawn':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <AdminLayout
      title="Platform Applications Inspector"
      subtitle="Super-admin oversight of all candidate submissions, interview statuses, and recruiter activity across all organizations."
    >
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 glass-surface-2 rounded-2xl border border-slate-200/90 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'Applied', label: 'Applied' },
            { id: 'Under Review', label: 'Under Review' },
            { id: 'Shortlisted', label: 'Shortlisted' },
            { id: 'Selected', label: 'Selected' },
            { id: 'Rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, job, company..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl glass-input text-xs text-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="glass-surface-2 glass-specular rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-600 font-medium">
            Loading candidate applications...
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto text-lg">
              <FaFileAlt />
            </div>
            <div className="text-sm font-bold text-slate-800">No applications match criteria</div>
            <p className="text-xs text-slate-600">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3.5 px-6">Candidate Details</th>
                  <th className="py-3.5 px-4">Applied Job Role</th>
                  <th className="py-3.5 px-4">Target Company</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date Submitted</th>
                  <th className="py-3.5 px-6 text-right">Resume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/90">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">
                        {app.applicantName || 'Anonymous Candidate'}
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <FaEnvelope className="text-[10px] text-slate-400" />
                        <span>{app.applicantEmail}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{app.jobTitle || 'Role'}</div>
                      <div className="text-[11px] text-slate-600">{app.experience || 'Experience listed'}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <FaBuilding className="text-slate-400 text-xs" />
                        <span>{app.companyName || '—'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {app.status || 'Applied'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-600 text-[11px]">
                      {app.appliedAt?.toDate
                        ? app.appliedAt.toDate().toLocaleDateString()
                        : 'Recent'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {app.resumeUrl ? (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors"
                        >
                          <FaFilePdf className="text-xs text-rose-500" />
                          <span>View</span>
                          <FaExternalLinkAlt className="text-[9px]" />
                        </a>
                      ) : (
                        <span className="text-slate-600 text-[11px] italic">No resume</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminApplications;
