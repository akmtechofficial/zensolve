import React from 'react';
import LegalLayout from './LegalLayout';
import { Link } from 'react-router-dom';
import { LEGAL_CONFIG } from '../../config/legalConfig';

const DataRetention = () => {
  const toc = [
    { id: 'schedule-overview', title: '1. Retention Policy Framework' },
    { id: 'retention-periods', title: '2. Provisional Data Category Schedules' },
    { id: 'statutory-exceptions', title: '3. Legal & Regulatory Retention Exceptions' },
    { id: 'erasure-process', title: '4. Erasure & Deletion Workflow' },
  ];

  return (
    <LegalLayout
      title="Data Retention & Storage Schedule"
      docId="data-retention"
      version="1.0-draft"
      status="needs_legal_review"
      toc={toc}
    >
      <div className="space-y-6">
        <p className="lead font-medium text-slate-800">
          This Data Retention Schedule defines the operational storage timelines for personal information processed on ZenSolve.
        </p>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs">
          <strong>Compliance Review Notice:</strong> The timelines listed below reflect current platform operational defaults. They are currently categorized as <em>Pending Legal Review</em> under the upcoming Digital Personal Data Protection Rules, 2025.
        </div>

        <section id="schedule-overview" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">1. Retention Policy Framework</h2>
          <p>
            ZenSolve retains personal data only for as long as necessary to satisfy the purpose for which it was gathered—principally candidate discovery and recruitment management—unless a longer statutory retention period is mandated by Indian law (e.g. CERT-In cybersecurity log directions or Income Tax Act).
          </p>
        </section>

        <section id="retention-periods" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">2. Provisional Data Category Schedules</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-3 border-b border-slate-200">Data Category</th>
                  <th className="p-3 border-b border-slate-200">Storage Location</th>
                  <th className="p-3 border-b border-slate-200">Provisional Retention Schedule</th>
                  <th className="p-3 border-b border-slate-200">Review Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Active Candidate Profiles</td>
                  <td className="p-3 text-slate-600">Cloud Firestore</td>
                  <td className="p-3 text-slate-600">Duration of active account + 24 months of inactivity</td>
                  <td className="p-3 text-amber-700 font-semibold">Under Review</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Uploaded Resume Documents</td>
                  <td className="p-3 text-slate-600">Cloud Storage</td>
                  <td className="p-3 text-slate-600">Until candidate updates/deletes resume, or account closure</td>
                  <td className="p-3 text-amber-700 font-semibold">Under Review</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Submitted Applications</td>
                  <td className="p-3 text-slate-600">Cloud Firestore</td>
                  <td className="p-3 text-slate-600">36 months following recruitment conclusion for audit defense</td>
                  <td className="p-3 text-amber-700 font-semibold">Under Review</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Employer Organization Profiles</td>
                  <td className="p-3 text-slate-600">Cloud Firestore</td>
                  <td className="p-3 text-slate-600">Duration of corporate partnership</td>
                  <td className="p-3 text-emerald-700 font-semibold">Active</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Security & Authentication Logs</td>
                  <td className="p-3 text-slate-600">Firestore / GCP Logs</td>
                  <td className="p-3 text-slate-600">180 days in accordance with CERT-In directions</td>
                  <td className="p-3 text-emerald-700 font-semibold">Statutory Standard</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="statutory-exceptions" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">3. Legal & Regulatory Retention Exceptions</h2>
          <p>
            Notwithstanding a user's erasure request, ZenSolve may retain minimal necessary records where required by law, such as investigating job scams, complying with court summons, or defending against legal claims.
          </p>
        </section>

        <section id="erasure-process" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">4. Erasure & Deletion Workflow</h2>
          <p>
            Users wishing to initiate immediate purging of their candidate record ahead of scheduled retention expiration may submit a formal request via the{' '}
            <Link to="/data-deletion" className="text-indigo-600 underline">Data Erasure Portal</Link>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default DataRetention;
