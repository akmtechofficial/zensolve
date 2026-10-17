import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getCompanyDetails, getJobs, updateCompanyApproval } from '../../services/recruitmentService';
import { useAuth } from '../../components/useAuth';
import {
  FaArrowLeft,
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaGlobe,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaCalendarAlt,
  FaClock,
} from 'react-icons/fa';

const AdminCompanyDetail = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [decisionNote, setDecisionNote] = useState('');

  const fetchDossier = async () => {
    setLoading(true);
    try {
      const details = await getCompanyDetails(companyId);
      setCompany(details);

      if (details) {
        const allJobs = await getJobs();
        const matched = allJobs.filter(
          (j) => j.companyId === companyId || j.companyName?.toLowerCase() === details.companyName?.toLowerCase()
        );
        setCompanyJobs(matched);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier();
  }, [companyId]);

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      const res = await updateCompanyApproval(
        companyId,
        newStatus,
        decisionNote || `Admin updated status to ${newStatus}`,
        user?.email || 'admin@zensolve.com'
      );
      if (res.success) {
        setCompany((prev) => ({
          ...prev,
          status: newStatus,
          approved: newStatus === 'approved',
          approvalNote: decisionNote,
          reviewedBy: user?.email,
          reviewedAt: new Date(),
        }));
        setDecisionNote('');
      } else {
        alert(res.error || 'Failed to update company.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Company Registration Dossier">
        <div className="py-20 text-center text-xs text-slate-600 font-medium">
          Retrieving corporate registration documents...
        </div>
      </AdminLayout>
    );
  }

  if (!company) {
    return (
      <AdminLayout title="Company Not Found">
        <div className="py-16 text-center space-y-4">
          <p className="text-sm font-semibold text-slate-700">Company registration ID not found.</p>
          <Link
            to="/admin/companies"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            <FaArrowLeft /> Back to Company Directory
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const isApproved = company.status === 'approved' || company.approved === true;
  const isSuspended = company.status === 'suspended';
  const isPending = !isApproved && !isSuspended;

  return (
    <AdminLayout
      title={`Company Dossier: ${company.companyName || 'Corporate Entity'}`}
      subtitle="Comprehensive corporate registration records and administrative governance."
    >
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          to="/admin/companies"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <FaArrowLeft /> Back to Companies
        </Link>

        {/* Company Header Card */}
        <div className="glass-surface-2 glass-specular p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.companyName}
                className="w-20 h-20 rounded-2xl object-contain bg-white border border-slate-200 p-2 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-3xl shrink-0">
                {(company.companyName || 'C').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900 font-display">
                  {company.companyName || 'Unnamed Company'}
                </h2>
                {isApproved && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <FaCheckCircle className="text-emerald-500" /> Approved
                  </span>
                )}
                {isPending && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <FaClock className="text-amber-500" /> Pending Review
                  </span>
                )}
                {isSuspended && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                    <FaBan className="text-rose-500" /> Suspended
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2 font-medium">
                {company.location && (
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-slate-400" /> {company.location}
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <FaGlobe className="text-slate-400" /> {company.website}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <FaBuilding className="text-slate-400" /> {company.companyType || 'Corporate'} • {company.industry || 'Technology'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {!isApproved && (
              <button
                onClick={() => handleStatusChange('approved')}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Approve Company
              </button>
            )}
            {isApproved && (
              <button
                onClick={() => handleStatusChange('suspended')}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors"
              >
                Suspend Company
              </button>
            )}
            {isSuspended && (
              <button
                onClick={() => handleStatusChange('approved')}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition-colors"
              >
                Reactivate Company
              </button>
            )}
            {isPending && (
              <button
                onClick={() => handleStatusChange('rejected')}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Reject
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Company Registration Details (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-surface-2 glass-specular p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <FaBuilding className="text-indigo-600" />
                <span>Business & Contact Registration Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <span className="text-[11px] font-medium text-slate-600 block">HR Lead Name</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{company.hrName || '—'}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <span className="text-[11px] font-medium text-slate-600 block">Business Email</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block flex items-center gap-1.5">
                    <FaEnvelope className="text-slate-400 text-xs" /> {company.email || '—'}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <span className="text-[11px] font-medium text-slate-600 block">Mobile Contact</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block flex items-center gap-1.5">
                    <FaPhone className="text-slate-400 text-xs" /> {company.mobile || '—'}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <span className="text-[11px] font-medium text-slate-600 block">Company Type</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{company.companyType || 'Corporate'}</span>
                </div>
              </div>

              {company.description && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-700 block mb-1">Company Description</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                    {company.description}
                  </p>
                </div>
              )}
            </div>

            {/* Jobs Posted by This Company */}
            <div className="glass-surface-2 glass-specular p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                  <FaBriefcase className="text-indigo-600" />
                  <span>Job Listings by this Company ({companyJobs.length})</span>
                </h3>
              </div>

              {companyJobs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-600">
                  No job openings published by this company yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {companyJobs.map((job) => (
                    <div key={job.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{job.position}</div>
                        <div className="text-[11px] text-slate-600">
                          {job.location} • {job.jobType} • {job.category}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {job.status || 'Active'}
                        </span>
                        <Link
                          to={`/jobs/${job.id}`}
                          target="_blank"
                          className="text-indigo-600 hover:underline font-semibold"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Decision Box and Administrative Notes (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-surface-2 glass-specular p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 font-display">Administrative Governance</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Record Decision / Audit Note
                  </label>
                  <textarea
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    placeholder="Enter reason for approval, suspension, or compliance note..."
                    rows="3"
                    className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs text-slate-900"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange('approved')}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Confirm Approval
                  </button>
                  <button
                    onClick={() => handleStatusChange('suspended')}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Suspend Entity
                  </button>
                </div>
              </div>

              {company.approvalNote && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="font-semibold text-slate-900">Latest Recorded Note</div>
                  <p className="text-slate-600 italic">"{company.approvalNote}"</p>
                  <div className="text-[10px] text-slate-600 pt-1">
                    Reviewed by: {company.reviewedBy || 'Admin'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCompanyDetail;
