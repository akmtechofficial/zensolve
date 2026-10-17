import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getAuditLogs, getPlatformReports } from '../../services/recruitmentService';
import {
  FaShieldAlt,
  FaExclamationTriangle,
  FaHistory,
  FaCheckCircle,
  FaSearch,
  FaFilter,
} from 'react-icons/fa';

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'reports'
  const [auditLogs, setAuditLogs] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [logs, reportsData] = await Promise.all([
          getAuditLogs(50),
          getPlatformReports(),
        ]);
        setAuditLogs(logs);
        setReports(reportsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredLogs = auditLogs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const actionMatch = (log.action || '').toLowerCase().includes(q);
    const emailMatch = (log.adminEmail || '').toLowerCase().includes(q);
    return actionMatch || emailMatch;
  });

  return (
    <AdminLayout
      title="Platform Reports & Audit Logs"
      subtitle="Immutable security trail of administrative interventions, verification decisions, and user reports."
    >
      {/* Tabs and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 glass-surface-2 rounded-2xl border border-slate-200/90">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <FaHistory />
            <span>Administrative Audit Log ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <FaExclamationTriangle />
            <span>Reported Entities ({reports.length})</span>
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit actions..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl glass-input text-xs text-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {activeTab === 'audit' && (
        <div className="glass-surface-2 glass-specular rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-600 font-medium">
              Loading security audit stream...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto text-base">
                <FaShieldAlt />
              </div>
              <div className="text-sm font-bold text-slate-800">No audit records match</div>
              <p className="text-xs text-slate-600">Administrative activity will appear here in real-time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-4">Action Event</th>
                    <th className="py-3.5 px-4">Admin Actor</th>
                    <th className="py-3.5 px-4">Target Entity ID</th>
                    <th className="py-3.5 px-6">Details / Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/90">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {log.timestamp?.toDate
                          ? log.timestamp.toDate().toLocaleString()
                          : 'Recent'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {log.adminEmail || 'admin@zensolve.com'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {log.targetId ? `${log.targetId.slice(0, 12)}...` : '—'}
                      </td>
                      <td className="py-3.5 px-6 text-slate-700 font-mono text-[11px]">
                        {log.details ? (
                          <span className="truncate block max-w-xs">
                            {JSON.stringify(log.details)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="glass-surface-2 glass-specular rounded-3xl border border-slate-200/90 shadow-xs p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl border border-emerald-100">
            <FaCheckCircle />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">No Flagged Entities or Fraud Reports</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Zero active complaints or policy violations currently filed against employers or job listings.
          </p>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReports;
