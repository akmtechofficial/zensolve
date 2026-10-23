import React, { useState } from 'react';
import LegalLayout from './LegalLayout';
import { useAuth } from '../../components/useAuth';
import { db } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../../components/ui/Button';
import {
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaMoneyBillWave,
  FaKey,
  FaBuilding,
  FaFileAlt,
} from 'react-icons/fa';

const ReportFraud = () => {
  const { user, userData } = useAuth();

  const [formData, setFormData] = useState({
    reporterName: userData?.displayName || user?.displayName || '',
    reporterEmail: user?.email || '',
    companyName: '',
    jobTitle: '',
    jobLinkOrId: '',
    violationType: 'fee_demand', // fee_demand | impersonation | credential_harvesting | phishing_links | harassment | other
    description: '',
    evidenceDetails: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successReference, setSuccessReference] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.companyName.trim() || !formData.description.trim()) {
      setErrorMsg('Employer/Job name and a clear description of the incident are required.');
      return;
    }

    setSubmitting(true);
    const referenceId = `FRD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      await addDoc(collection(db, 'fraudReports'), {
        referenceId,
        userId: user?.uid || 'anonymous',
        reporterName: formData.reporterName.trim() || 'Anonymous',
        reporterEmail: formData.reporterEmail.trim() || 'not_provided',
        companyName: formData.companyName.trim(),
        jobTitle: formData.jobTitle.trim(),
        jobLinkOrId: formData.jobLinkOrId.trim(),
        violationType: formData.violationType,
        description: formData.description.trim(),
        evidenceDetails: formData.evidenceDetails.trim(),
        status: 'Received', // Received | Investigating | Action Taken | Dismissed
        adminNotes: '',
        createdAt: serverTimestamp(),
      });

      setSuccessReference(referenceId);
      setFormData({
        reporterName: '',
        reporterEmail: '',
        companyName: '',
        jobTitle: '',
        jobLinkOrId: '',
        violationType: 'fee_demand',
        description: '',
        evidenceDetails: '',
      });
    } catch (err) {
      console.error('Error submitting fraud report:', err);
      setErrorMsg('Unable to submit report. Please check connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LegalLayout
      title="Report Job Fraud & Candidate Safety Guide"
      docId="report-fraud"
      version="1.0"
      status="published"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            ZenSolve Candidate Safety & Anti-Scam Shield
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
            <strong>ZenSolve never charges candidates fees for job applications, interviews, or hiring tests.</strong> Genuine recruitment partners on our platform are strictly prohibited from demanding money, training fees, or OTP verification.
          </p>
        </div>

        {/* Candidate Protection Golden Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-900 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <FaMoneyBillWave className="text-rose-600" />
              <span>Never Pay Money</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-800">
              Never pay for job offers, registration charges, laptop security deposits, or uniform fees. Legitimate employers pay you.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <FaKey className="text-amber-600" />
              <span>Never Share OTPs</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Never share bank credentials, UPI PINs, Aadhaar OTPs, or passwords with anyone claiming to be a recruiter or interviewer.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-indigo-900 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <FaBuilding className="text-indigo-600" />
              <span>Report Suspicious Roles</span>
            </div>
            <p className="text-[11px] leading-relaxed text-indigo-800">
              If an employer uses unverified personal emails, sends dubious Telegram links, or makes unrealistic promises, report them below immediately.
            </p>
          </div>
        </div>

        {/* Success Confirmation Alert */}
        {successReference && (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <FaCheckCircle className="text-emerald-600" />
              <span>Fraud Report Received by Trust Desk</span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-800">
              Your confidential fraud report tracking ID is{' '}
              <strong className="font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-950">
                {successReference}
              </strong>
              . Our compliance moderation team will inspect the employer record, review job postings, and take disciplinary measures including company suspension if verified.
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

        {/* Report Form */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-slate-50/70 p-6 sm:p-8 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Submit Incident or Job Listing for Investigation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Employer / Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Apex Technologies / Recruiter Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Reported Job Title (if applicable)
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="e.g. Software Engineer / Data Entry"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Violation Category *
              </label>
              <select
                value={formData.violationType}
                onChange={(e) => setFormData({ ...formData, violationType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="fee_demand">Demand for Money / Registration Fee / Security Deposit</option>
                <option value="impersonation">Fake Company / Impersonation of Legitimate Brand</option>
                <option value="credential_harvesting">Harvesting Bank Details / Aadhaar / OTPs</option>
                <option value="phishing_links">Suspicious Telegram / External Payment Links</option>
                <option value="harassment">Discriminatory, Abusive, or Harassing Listing</option>
                <option value="other">Other Suspicious Activity</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Job Posting URL or Reference ID (Optional)
              </label>
              <input
                type="text"
                value={formData.jobLinkOrId}
                onChange={(e) => setFormData({ ...formData, jobLinkOrId: e.target.value })}
                placeholder="infozensolve.in/jobs/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Detailed Description of Scam / Violation *
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain exactly what happened, what the recruiter requested, contact channels used (WhatsApp/Email), and timestamps..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Your Contact Email (Optional for updates)
              </label>
              <input
                type="email"
                value={formData.reporterEmail}
                onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                placeholder="reporter@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={formData.reporterName}
                onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                placeholder="Anonymous or Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={submitting}
            className="w-full sm:w-auto font-bold text-xs px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 border-none shadow-xs"
          >
            {submitting ? 'Transmitting Report...' : 'Submit Confidential Fraud Report'}
          </Button>
        </form>
      </div>
    </LegalLayout>
  );
};

export default ReportFraud;
