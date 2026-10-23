import React, { useState } from 'react';
import LegalLayout from './LegalLayout';
import { useAuth } from '../../components/useAuth';
import { LEGAL_CONFIG } from '../../config/legalConfig';
import { db } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../../components/ui/Button';
import {
  FaShieldAlt,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBalanceScale,
  FaInfoCircle,
} from 'react-icons/fa';

const GrievanceRedressal = () => {
  const { user, userData } = useAuth();

  const [formData, setFormData] = useState({
    fullName: userData?.displayName || user?.displayName || '',
    email: user?.email || '',
    category: 'privacy_data', // privacy_data | account_access | fake_job | harassment | copyright_ip | security_vulnerability | general
    subject: '',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successReference, setSuccessReference] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.description.trim()) {
      setErrorMsg('All fields are required to process a formal grievance ticket.');
      return;
    }

    setSubmitting(true);
    const referenceId = `GRV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      await addDoc(collection(db, 'grievanceRequests'), {
        referenceId,
        userId: user?.uid || null,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        category: formData.category,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        status: 'Received', // Received | In Review | Resolved | Rejected
        adminNotes: '',
        createdAt: serverTimestamp(),
      });

      setSuccessReference(referenceId);
      setFormData({
        fullName: '',
        email: '',
        category: 'privacy_data',
        subject: '',
        description: '',
      });
    } catch (err) {
      console.error('Error submitting grievance:', err);
      setErrorMsg('Unable to submit grievance ticket. Please check connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LegalLayout
      title="Grievance Redressal & Support Escalation"
      docId="grievance-redressal"
      version="1.0-draft"
      status="needs_legal_review"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Statutory Grievance Redressal Mechanism
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
            In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and Digital Personal Data Protection Act, 2023, ZenSolve provides this official channel for candidate and employer concerns.
          </p>
        </div>

        {/* Provisional Officer Disclosure */}
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
            <FaInfoCircle className="text-amber-600" />
            <span>Formal Appointment Disclosure Notice</span>
          </div>
          <p className="leading-relaxed text-[11px] text-amber-800">
            Formal statutory designation of the named Grievance Officer is currently pending final corporate verification. All consumer grievances, data protection inquiries, and intellectual property complaints are handled directly by the central administration desk at{' '}
            <a href={`mailto:${LEGAL_CONFIG.contacts.provisionalPrivacyEmail}`} className="font-bold underline text-indigo-900">
              {LEGAL_CONFIG.contacts.provisionalPrivacyEmail}
            </a>
            .
          </p>
        </div>

        {/* Success Alert */}
        {successReference && (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <FaCheckCircle className="text-emerald-600" />
              <span>Grievance Ticket Registered Successfully</span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-800">
              Your grievance reference ticket number is{' '}
              <strong className="font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-950">
                {successReference}
              </strong>
              . You will receive an acknowledgment email at your registered address. Our compliance team will review and respond to the grievance in accordance with applicable statutory response timelines.
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

        {/* Grievance Ticket Form */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-slate-50/70 p-6 sm:p-8 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 font-display">
            File an Official Grievance Ticket
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Name of Complainant"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Your Email Address *
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
                Grievance Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="privacy_data">Data Protection / DPDP Privacy Inquiries</option>
                <option value="account_access">Account Access / Authentication Lockout</option>
                <option value="fake_job">Fake Employer / Job Scam / Fee Extortion</option>
                <option value="harassment">Harassment, Abuse, or Discrimination</option>
                <option value="copyright_ip">Copyright Infringement / Trademark Abuse</option>
                <option value="security_vulnerability">Security Vulnerability Disclosure</option>
                <option value="general">General Support Escalation</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Subject / Summary *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief summary of the issue"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Complete Description of Grievance *
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide exact facts, URLs, email timestamps, recruiter correspondence, and specific remedy sought..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={submitting}
            className="w-full sm:w-auto font-bold text-xs px-6 py-2.5 rounded-xl"
          >
            {submitting ? 'Registering Grievance...' : 'Submit Official Grievance'}
          </Button>
        </form>
      </div>
    </LegalLayout>
  );
};

export default GrievanceRedressal;
