import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { LEGAL_CONFIG } from '../../config/legalConfig';
import { db } from '../../firebaseConfig';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Button } from '../../components/ui/Button';
import {
  FaBalanceScale,
  FaShieldAlt,
  FaTrashAlt,
  FaExclamationTriangle,
  FaEnvelope,
  FaCheckCircle,
  FaClock,
  FaExternalLinkAlt,
  FaSearch,
  FaRegCheckSquare,
} from 'react-icons/fa';

const AdminLegalCenter = () => {
  const [activeTab, setActiveTab] = useState('checklist'); // checklist | deletions | grievances | fraud | documents

  // Queues State
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [grievanceRequests, setGrievanceRequests] = useState([]);
  const [fraudReports, setFraudReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status update tracking
  const [updatingId, setUpdatingId] = useState(null);

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const [delSnap, grvSnap, frdSnap] = await Promise.all([
        getDocs(collection(db, 'deletionRequests')),
        getDocs(collection(db, 'grievanceRequests')),
        getDocs(collection(db, 'fraudReports')),
      ]);

      const dels = delSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const grvs = grvSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const frds = frdSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      dels.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      grvs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      frds.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

      setDeletionRequests(dels);
      setGrievanceRequests(grvs);
      setFraudReports(frds);
    } catch (err) {
      console.error('Error fetching admin legal queues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const handleUpdateDeletionStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, 'deletionRequests', id), {
        status: newStatus,
        reviewedAt: serverTimestamp(),
      });
      setDeletionRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error('Error updating deletion status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateGrievanceStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, 'grievanceRequests', id), {
        status: newStatus,
        reviewedAt: serverTimestamp(),
      });
      setGrievanceRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error('Error updating grievance status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateFraudStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, 'fraudReports', id), {
        status: newStatus,
        reviewedAt: serverTimestamp(),
      });
      setFraudReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error('Error updating fraud status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const checklistItems = [
    {
      title: 'Exact Legal Entity Name',
      value: LEGAL_CONFIG.entity.provisionalLegalName,
      status: LEGAL_CONFIG.entity.verificationStatus,
      badge: 'Pending Verification',
      actionNote: 'Obtain Certificate of Incorporation (MCA / ROC) to verify exact corporate legal entity name.',
    },
    {
      title: 'Corporate Identity Number (CIN)',
      value: LEGAL_CONFIG.entity.cin,
      status: LEGAL_CONFIG.entity.cinStatus,
      badge: 'Unknown',
      actionNote: 'Retrieve and audit 21-digit CIN from MCA portal before publishing statutory footer notice.',
    },
    {
      title: 'Registered Office Address',
      value: LEGAL_CONFIG.entity.registeredOfficeAddress,
      status: LEGAL_CONFIG.entity.addressStatus,
      badge: 'Pending Verification',
      actionNote: 'Verify electricity bill / lease agreement for Godda office to confirm ROC registered address.',
    },
    {
      title: 'Statutory Grievance Officer Appointment',
      value: LEGAL_CONFIG.contacts.grievanceContactPerson,
      status: LEGAL_CONFIG.contacts.grievanceContactStatus,
      badge: 'Unconfirmed',
      actionNote: 'Formally appoint a named Grievance Officer and publish full contact details per IT Rules 2021.',
    },
    {
      title: 'Google Analytics Measurement ID',
      value: LEGAL_CONFIG.processors.analyticsMeasurementId || 'Not Configured (Gated)',
      status: LEGAL_CONFIG.processors.analyticsStatus,
      badge: LEGAL_CONFIG.processors.analyticsMeasurementId ? 'Configured' : 'Unconfigured',
      actionNote: 'Ensure analytics tags strictly observe the consent banner and ga-disable signals.',
    },
    {
      title: 'Data Retention Schedule Review',
      value: 'Draft Schedule (24-month candidate retention)',
      status: LEGAL_CONFIG.policies.dataRetention.status,
      badge: 'Requires Review',
      actionNote: 'Review retention schedules against DPDP Act 2023 Rules once notified by MEITY.',
    },
    {
      title: 'Age Eligibility Rule Enforcement',
      value: LEGAL_CONFIG.policies.ageEligibility.intendedAudience,
      status: LEGAL_CONFIG.policies.ageEligibility.status,
      badge: 'Requires Confirmation',
      actionNote: 'Confirm whether adult-only (18+) is strictly required or if internship ages 16-17 will be supported.',
    },
  ];

  return (
    <AdminLayout
      title="Legal, Privacy & Compliance Management"
      subtitle="Corporate identity audit, user erasure requests, grievance queues, and fraud investigation."
    >
      <div className="space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FaRegCheckSquare />
            <span>Verification Checklist ({checklistItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deletions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'deletions'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FaTrashAlt />
            <span>Erasure Requests ({deletionRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('grievances')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'grievances'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FaEnvelope />
            <span>Grievance Tickets ({grievanceRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fraud')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'fraud'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FaExclamationTriangle />
            <span>Job Fraud Reports ({fraudReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'documents'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FaBalanceScale />
            <span>Policies Registry</span>
          </button>
        </div>

        {/* TAB 1: Verification Checklist */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <strong>Mandatory Compliance Rule:</strong> Values listed as "Pending Verification" or "Unknown" must NOT be displayed on public marketing pages as certified facts until supporting evidence (MCA certificates, formal appointments) is verified.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checklistItems.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'configured' || item.status === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-indigo-700 bg-slate-50 p-2 rounded-lg border border-slate-100 truncate">
                    {item.value}
                  </p>

                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                    {item.actionNote}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Data Deletion Queue */}
        {activeTab === 'deletions' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Data Erasure Requests ({deletionRequests.length})
              </h3>
              <Button variant="outline" size="sm" onClick={fetchQueues} className="text-xs">
                Refresh Queue
              </Button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading requests...</div>
            ) : deletionRequests.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {deletionRequests.map((req) => (
                  <div key={req.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{req.referenceId}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-semibold uppercase">
                          {req.role}
                        </span>
                        <span className="text-[11px] text-slate-500">Scope: {req.erasureScope}</span>
                      </div>
                      <p className="text-slate-800 font-medium">
                        {req.fullName} • <span className="font-mono text-indigo-600">{req.email}</span>
                      </p>
                      {req.reason && <p className="text-slate-500 italic text-[11px]">Reason: "{req.reason}"</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={req.status}
                        disabled={updatingId === req.id}
                        onChange={(e) => handleUpdateDeletionStatus(req.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                      >
                        <option value="Received">Received</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 italic">No erasure requests found.</div>
            )}
          </div>
        )}

        {/* TAB 3: Grievance Tickets Queue */}
        {activeTab === 'grievances' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Official Grievance Tickets ({grievanceRequests.length})
              </h3>
              <Button variant="outline" size="sm" onClick={fetchQueues} className="text-xs">
                Refresh Queue
              </Button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading tickets...</div>
            ) : grievanceRequests.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {grievanceRequests.map((grv) => (
                  <div key={grv.id} className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{grv.referenceId}</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                          {grv.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{grv.subject}</h4>
                      <p className="text-slate-600 leading-relaxed text-[11px] whitespace-pre-line bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {grv.description}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Complainant: <span className="font-semibold text-slate-800">{grv.fullName}</span> ({grv.email})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={grv.status}
                        disabled={updatingId === grv.id}
                        onChange={(e) => handleUpdateGrievanceStatus(grv.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                      >
                        <option value="Received">Received</option>
                        <option value="In Review">In Review</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 italic">No grievance tickets found.</div>
            )}
          </div>
        )}

        {/* TAB 4: Fraud Reports Queue */}
        {activeTab === 'fraud' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Job Scam & Fraud Reports ({fraudReports.length})
              </h3>
              <Button variant="outline" size="sm" onClick={fetchQueues} className="text-xs">
                Refresh Queue
              </Button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading fraud reports...</div>
            ) : fraudReports.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {fraudReports.map((frd) => (
                  <div key={frd.id} className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{frd.referenceId}</span>
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold">
                          {frd.violationType}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">
                        Target Employer: <span className="text-indigo-600">{frd.companyName}</span>
                        {frd.jobTitle && ` • Role: ${frd.jobTitle}`}
                      </p>
                      <p className="text-slate-600 leading-relaxed text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {frd.description}
                      </p>
                      {frd.jobLinkOrId && (
                        <p className="text-indigo-600 text-[11px] font-mono">Job Reference: {frd.jobLinkOrId}</p>
                      )}
                      <p className="text-slate-400 text-[10px]">
                        Reported by: {frd.reporterName} ({frd.reporterEmail})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={frd.status}
                        disabled={updatingId === frd.id}
                        onChange={(e) => handleUpdateFraudStatus(frd.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                      >
                        <option value="Received">Received</option>
                        <option value="Investigating">Investigating</option>
                        <option value="Action Taken">Action Taken (Suspended)</option>
                        <option value="Dismissed">Dismissed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 italic">No fraud reports logged.</div>
            )}
          </div>
        )}

        {/* TAB 5: Policies Registry Table */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Policy Title</th>
                  <th className="p-3">Path</th>
                  <th className="p-3">Version</th>
                  <th className="p-3">Effective Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.values(LEGAL_CONFIG.documents).map((docItem) => (
                  <tr key={docItem.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{docItem.title}</td>
                    <td className="p-3 font-mono text-indigo-600">
                      <a href={docItem.path} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                        <span>{docItem.path}</span>
                        <FaExternalLinkAlt className="text-[9px]" />
                      </a>
                    </td>
                    <td className="p-3 font-mono text-slate-500">v{docItem.version}</td>
                    <td className="p-3 text-slate-600">{docItem.effectiveDate}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          docItem.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {docItem.status === 'published' ? 'Published' : 'Needs Review'}
                      </span>
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

export default AdminLegalCenter;
