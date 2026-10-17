import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getPlatformStats, getAuditLogs } from '../../services/recruitmentService';
import {
  FaBuilding,
  FaUsers,
  FaBriefcase,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaBan,
  FaArrowRight,
  FaShieldAlt,
  FaHistory,
} from 'react-icons/fa';

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    publishedJobs: 0,
    totalApplications: 0,
    totalUsers: 0,
    totalCandidates: 0,
    totalCompanies: 0,
    pendingCompanies: 0,
    approvedCompanies: 0,
    suspendedCompanies: 0,
    recentApplications: [],
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [statsData, logsData] = await Promise.all([
          getPlatformStats(),
          getAuditLogs(10),
        ]);
        setStats(statsData);
        setAuditLogs(logsData);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const statCards = [
    {
      label: 'Registered Companies',
      value: stats.totalCompanies,
      icon: FaBuilding,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
      sub: `${stats.pendingCompanies} pending approval`,
      link: '/admin/companies',
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingCompanies,
      icon: FaClock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200',
      sub: 'Action required',
      link: '/admin/companies',
      badge: stats.pendingCompanies > 0 ? 'Urgent' : null,
    },
    {
      label: 'Verified Candidates',
      value: stats.totalCandidates,
      icon: FaUsers,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      sub: 'Active job seekers',
      link: '/admin/users',
    },
    {
      label: 'Published Jobs',
      value: stats.publishedJobs,
      icon: FaBriefcase,
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-100',
      sub: `${stats.totalJobs} total listings`,
      link: '/admin/jobs',
    },
    {
      label: 'Total Applications',
      value: stats.totalApplications,
      icon: FaFileAlt,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
      sub: 'Platform-wide submissions',
      link: '/admin/applications',
    },
    {
      label: 'Suspended Accounts',
      value: stats.suspendedCompanies,
      icon: FaBan,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
      sub: 'Security restricted',
      link: '/admin/companies',
    },
  ];

  return (
    <AdminLayout
      title="Platform Operations Overview"
      subtitle="Super-Admin central command for company verifications, user moderation, and recruitment metrics."
    >
      {/* Pending Company Approval Banner */}
      {stats.pendingCompanies > 0 && (
        <div className="glass-surface-2 glass-specular p-6 rounded-3xl border border-amber-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-50/90 to-amber-100/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-md shrink-0">
              <FaClock />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-950 font-display">
                {stats.pendingCompanies} Company Registration{stats.pendingCompanies > 1 ? 's' : ''} Awaiting Review
              </h2>
              <p className="text-xs text-amber-800/90 mt-0.5">
                New employers cannot publish public job listings until their identity and business registration are approved.
              </p>
            </div>
          </div>
          <Link
            to="/admin/companies"
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 text-center flex items-center justify-center gap-2"
          >
            <span>Review Applications</span>
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      )}

      {/* Grid of Key Platform Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              to={card.link}
              className="glass-surface-2 glass-specular p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 transition-all group flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl ${card.bg} ${card.color} flex items-center justify-center text-sm border`}>
                    <Icon />
                  </div>
                  {card.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {card.badge}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black text-slate-900 font-display tracking-tight">
                  {loading ? '...' : card.value}
                </div>
                <div className="text-xs font-semibold text-slate-600 mt-1">{card.label}</div>
              </div>
              <div className="text-[11px] font-medium text-slate-600 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>{card.sub}</span>
                <FaArrowRight className="text-[9px] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-indigo-600" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Applications & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Applications Inspector (7 Cols) */}
        <div className="lg:col-span-7 glass-surface-2 glass-specular p-6 rounded-3xl border border-slate-200/90 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaFileAlt className="text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 font-display">Recent Submissions Across Platform</h3>
            </div>
            <Link to="/admin/applications" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              View All Applications
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-600">Loading recent submissions...</div>
          ) : stats.recentApplications && stats.recentApplications.length > 0 ? (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-600 uppercase tracking-wider font-semibold text-[10px] pb-2">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Applied Role</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">
                        {app.applicantName || app.applicantEmail || 'Candidate'}
                      </td>
                      <td className="py-3 text-slate-600">{app.jobTitle || 'Role'}</td>
                      <td className="py-3 text-slate-600 font-medium">{app.companyName || '—'}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {app.status || 'Applied'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-600">No applications registered yet.</div>
          )}
        </div>

        {/* Security Audit Feed (5 Cols) */}
        <div className="lg:col-span-5 glass-surface-2 glass-specular p-6 rounded-3xl border border-slate-200/90 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaHistory className="text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900 font-display">Administrative Audit Log</h3>
            </div>
            <Link to="/admin/reports" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              Audit Stream
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-600">Loading audit trail...</div>
          ) : auditLogs.length > 0 ? (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-xs mt-0.5">
                    <FaShieldAlt />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate">{log.action?.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-600 shrink-0">
                        {log.timestamp?.toDate
                          ? log.timestamp.toDate().toLocaleDateString()
                          : 'Recent'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                      By {log.adminEmail || 'admin@zensolve.com'}
                      {log.details?.newStatus ? ` • Set to ${log.details.newStatus}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-600">
              Platform audit log is clean. Actions taken will appear here.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminHome;
