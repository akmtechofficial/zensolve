import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAdminCompanies, updateCompanyApproval } from '../../services/recruitmentService';
import { useAuth } from '../../components/useAuth';
import {
  FaBuilding,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaEye,
  FaClock,
  FaGlobe,
  FaMapMarkerAlt,
} from 'react-icons/fa';

const AdminCompanies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'all' | 'pending' | 'approved' | 'suspended'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [decisionModal, setDecisionModal] = useState(null); // { company, action: 'approve' | 'reject' | 'suspend' }
  const [decisionNote, setDecisionNote] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await getAdminCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleStatusChange = async (companyId, newStatus) => {
    setActionLoading(companyId);
    try {
      const res = await updateCompanyApproval(
        companyId,
        newStatus,
        decisionNote || `Admin updated status to ${newStatus}`,
        user?.email || 'admin@zensolve.com'
      );
      if (res.success) {
        setCompanies((prev) =>
          prev.map((c) =>
            c.id === companyId
              ? { ...c, status: newStatus, approved: newStatus === 'approved' }
              : c
          )
        );
        setDecisionModal(null);
        setDecisionNote('');
      } else {
        alert(res.error || 'Failed to update company status.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      (c.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.hrName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.industry || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'pending') {
      return c.status === 'pending' || c.approved === false;
    }
    if (activeTab === 'approved') {
      return c.status === 'approved' || c.approved === true;
    }
    if (activeTab === 'suspended') {
      return c.status === 'suspended';
    }
    return true; // 'all'
  });

  const counts = {
    all: companies.length,
    pending: companies.filter((c) => c.status === 'pending' || c.approved === false).length,
    approved: companies.filter((c) => c.status === 'approved' || c.approved === true).length,
    suspended: companies.filter((c) => c.status === 'suspended').length,
  };

  return (
    <AdminLayout
      title="Company Registration Approvals"
      subtitle="Verify employer registrations, enforce verification standards, and manage corporate authorizations."
    >
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Filters */}
        <div className="flex items-center gap-2 p-1.5 glass-surface-2 rounded-2xl border border-slate-200/90 overflow-x-auto">
          {[
            { id: 'pending', label: 'Pending Review', count: counts.pending, color: 'text-amber-600' },
            { id: 'approved', label: 'Approved Active', count: counts.approved, color: 'text-emerald-600' },
            { id: 'suspended', label: 'Suspended', count: counts.suspended, color: 'text-rose-600' },
            { id: 'all', label: 'All Registrations', count: counts.all, color: 'text-slate-600' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, HR, email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl glass-input text-xs text-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Companies Table */}
      <div className="glass-surface-2 glass-specular rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-600 font-medium">
            Fetching company registrations from Firestore...
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto text-lg">
              <FaBuilding />
            </div>
            <div className="text-sm font-bold text-slate-800">No companies found</div>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              {activeTab === 'pending'
                ? 'No employers currently waiting for administrative verification.'
                : 'No companies match your current search criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3.5 px-6">Company Identity</th>
                  <th className="py-3.5 px-4">HR Contact</th>
                  <th className="py-3.5 px-4">Industry & Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Active Jobs</th>
                  <th className="py-3.5 px-6 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/90">
                {filteredCompanies.map((c) => {
                  const isApproved = c.status === 'approved' || c.approved === true;
                  const isSuspended = c.status === 'suspended';
                  const isPending = !isApproved && !isSuspended;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Company Name & Logo */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {c.logo ? (
                            <img
                              src={c.logo}
                              alt={c.companyName}
                              className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200/80 p-1 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                              {(c.companyName || 'C').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <Link
                              to={`/admin/companies/${c.id}`}
                              className="font-bold text-slate-900 hover:text-indigo-600 font-display block text-sm"
                            >
                              {c.companyName || 'Unnamed Entity'}
                            </Link>
                            <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-0.5">
                              {c.location && (
                                <span className="flex items-center gap-1">
                                  <FaMapMarkerAlt className="text-[10px]" /> {c.location}
                                </span>
                              )}
                              {c.website && (
                                <a
                                  href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:underline flex items-center gap-0.5"
                                >
                                  <FaGlobe className="text-[9px]" /> Website
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* HR Contact */}
                      <td className="py-4 px-4 text-slate-700">
                        <div className="font-semibold text-slate-900">{c.hrName || 'Primary HR'}</div>
                        <div className="text-[11px] text-slate-600 truncate max-w-[180px]">{c.email}</div>
                        {c.mobile && <div className="text-[10px] text-slate-600">{c.mobile}</div>}
                      </td>

                      {/* Industry */}
                      <td className="py-4 px-4 text-slate-600">
                        <div className="font-medium text-slate-900">{c.industry || 'Not specified'}</div>
                        <div className="text-[11px] text-slate-600">{c.companyType || 'Corporate'}</div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <FaClock className="text-[10px]" /> Pending Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <FaCheckCircle className="text-[10px]" /> Approved
                          </span>
                        )}
                        {isSuspended && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <FaBan className="text-[10px]" /> Suspended
                          </span>
                        )}
                      </td>

                      {/* Jobs count */}
                      <td className="py-4 px-4 font-semibold text-slate-900">
                        {c.totalJobs || 0}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/companies/${c.id}`}
                            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                            title="Inspect Detailed Dossier"
                          >
                            <FaEye />
                          </Link>

                          {isPending && (
                            <>
                              <button
                                onClick={() => setDecisionModal({ company: c, action: 'approved' })}
                                disabled={actionLoading === c.id}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setDecisionModal({ company: c, action: 'rejected' })}
                                disabled={actionLoading === c.id}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold text-xs transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => setDecisionModal({ company: c, action: 'suspended' })}
                              disabled={actionLoading === c.id}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors"
                            >
                              Suspend
                            </button>
                          )}

                          {isSuspended && (
                            <button
                              onClick={() => handleStatusChange(c.id, 'approved')}
                              disabled={actionLoading === c.id}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Confirmation Modal */}
      {decisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display">
              Confirm {decisionModal.action === 'approved' ? 'Company Approval' : decisionModal.action === 'rejected' ? 'Rejection' : 'Suspension'}
            </h3>
            <p className="text-xs text-slate-600">
              You are about to change the verification status of{' '}
              <strong className="text-slate-900">{decisionModal.company.companyName}</strong> to{' '}
              <span className="font-bold uppercase tracking-wider">{decisionModal.action}</span>.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Administrative Reason / Decision Note
              </label>
              <textarea
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Optional verification note recorded in audit log..."
                rows="3"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDecisionModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange(decisionModal.company.id, decisionModal.action)}
                disabled={actionLoading === decisionModal.company.id}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs ${
                  decisionModal.action === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading ? 'Processing...' : `Confirm ${decisionModal.action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCompanies;
