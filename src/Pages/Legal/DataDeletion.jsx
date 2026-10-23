import React, { useState, useEffect } from 'react';
import LegalLayout from './LegalLayout';
import { useAuth } from '../../components/useAuth';
import { db } from '../../firebaseConfig';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { Button } from '../../components/ui/Button';
import {
  FaTrashAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaHistory,
} from 'react-icons/fa';

const DataDeletion = () => {
  const { user, userData } = useAuth();

  const [formData, setFormData] = useState({
    fullName: userData?.displayName || user?.displayName || '',
    email: user?.email || '',
    role: userData?.role || 'candidate',
    erasureScope: 'full_account', // full_account | resume_only | applications_only
    reason: '',
    confirmed: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [successReference, setSuccessReference] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [userRequests, setUserRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Fetch candidate's prior requests if authenticated
  const fetchMyRequests = async () => {
    if (user?.uid) {
      setLoadingRequests(true);
      try {
        const q = query(collection(db, 'deletionRequests'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setUserRequests(list);
      } catch (err) {
        console.error('Error fetching deletion requests:', err);
      } finally {
        setLoadingRequests(false);
      }
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [user?.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setErrorMsg('Full name and account email are required.');
      return;
    }

    if (!formData.confirmed) {
      setErrorMsg('Please confirm that you acknowledge the consequences of data erasure.');
      return;
    }

    setSubmitting(true);
    const referenceId = `DEL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      await addDoc(collection(db, 'deletionRequests'), {
        referenceId,
        userId: user?.uid || null,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        erasureScope: formData.erasureScope,
        reason: formData.reason.trim(),
        status: 'Received', // Received | Under Review | Processing | Completed | Rejected
        adminNotes: '',
        createdAt: serverTimestamp(),
      });

      setSuccessReference(referenceId);
      setFormData({
        fullName: '',
        email: '',
        role: 'candidate',
        erasureScope: 'full_account',
        reason: '',
        confirmed: false,
      });
      fetchMyRequests();
    } catch (err) {
      console.error('Error submitting deletion request:', err);
      setErrorMsg('Unable to submit deletion request. Please check connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LegalLayout
      title="Data Erasure & Account Deletion Request"
      docId="data-deletion"
      version="1.0"
      status="published"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Exercise Your Right to Erasure (DPDP Act, 2023)
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
            As a registered job seeker or employer on ZenSolve, you have the right to request the deletion of your personal data, resume documents, and account credentials.
          </p>
        </div>

        {/* Success Confirmation Alert */}
        {successReference && (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <FaCheckCircle className="text-emerald-600" />
              <span>Deletion Request Logged Successfully</span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-800">
              Your formal data erasure request reference number is{' '}
              <strong className="font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-950">
                {successReference}
              </strong>
              . Our compliance desk will review and initiate erasure of the requested scope within 30 days pursuant to Indian data protection regulations.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <FaExclamationTriangle className="text-sm flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-slate-50/70 p-6 sm:p-8 rounded-2xl border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Candidate or HR Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Registered Account Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Account Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="candidate">Candidate / Job Seeker</option>
                <option value="company">Employer / HR Recruiter</option>
                <option value="other">Other / Unregistered Inquirer</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Scope of Requested Erasure *
              </label>
              <select
                value={formData.erasureScope}
                onChange={(e) => setFormData({ ...formData, erasureScope: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="full_account">Complete Account & All Associated Data</option>
                <option value="resume_only">Uploaded Resume / CV Documents Only</option>
                <option value="applications_only">Historical Job Application Records</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Reason / Additional Context (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g. Secured a role elsewhere, closing profile, GDPR/DPDP request..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="deletion-confirm"
                checked={formData.confirmed}
                onChange={(e) => setFormData({ ...formData, confirmed: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded mt-0.5"
              />
              <label htmlFor="deletion-confirm" className="cursor-pointer leading-relaxed text-[11px]">
                I acknowledge that account erasure is irreversible. Deleting my candidate account will remove my resume, saved bookmarks, and active application review history. Certain audit logs may be retained as required by statutory law.
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={submitting}
            className="w-full sm:w-auto font-bold text-xs px-6 py-2.5 rounded-xl"
          >
            {submitting ? 'Submitting Request...' : 'Submit Data Erasure Request'}
          </Button>
        </form>

        {/* User's Previous Requests Queue (if authenticated) */}
        {user?.uid && (
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <FaHistory className="text-indigo-600" />
              <span>Your Submitted Deletion Requests</span>
            </h3>

            {loadingRequests ? (
              <p className="text-xs text-slate-500">Checking request records...</p>
            ) : userRequests.length > 0 ? (
              <div className="space-y-3">
                {userRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{req.referenceId}</span>
                        <span className="text-[10px] text-slate-400">
                          {req.erasureScope === 'full_account' ? 'Full Account' : req.erasureScope}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Target Email: {req.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          req.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">You have no active data erasure requests on file.</p>
            )}
          </div>
        )}

      </div>
    </LegalLayout>
  );
};

export default DataDeletion;
