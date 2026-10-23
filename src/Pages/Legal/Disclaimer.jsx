import React from 'react';
import LegalLayout from './LegalLayout';
import { Link } from 'react-router-dom';
import { LEGAL_CONFIG } from '../../config/legalConfig';

const Disclaimer = () => {
  return (
    <LegalLayout
      title="Platform Disclaimer & Limitation of Liability"
      docId="disclaimer"
      version="1.0-published"
      status="published"
    >
      <div className="space-y-6">
        <p className="lead font-medium text-slate-800">
          This Disclaimer governs all representations, job listings, company profiles, and digital content accessible on <strong>{LEGAL_CONFIG.entity.websiteDomain}</strong>.
        </p>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">1. Digital Intermediary Status</h2>
          <p>
            ZenSolve operates as an online recruitment intermediary under Section 79 of the Information Technology Act, 2000. We provide digital infrastructure that facilitates connections between job seekers and recruiting employers. ZenSolve is not an employer, employment agent, or labor contractor, unless explicitly stated in a separate written agreement.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">2. No Guarantee of Employment</h2>
          <p>
            ZenSolve does not guarantee that browsing or applying for vacancies will result in job offers, interviews, or hiring callbacks. Hiring decisions, salary terms, background checks, and employment contracts are made solely between the candidate and the hiring company.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">3. Verification Limitations</h2>
          <p>
            While ZenSolve conducts administrative onboarding reviews of employer profiles, we cannot warrant the absolute accuracy of every company representation, financial stability, or working environment. Candidates are urged to exercise due diligence, never pay fees for jobs, and report suspicious recruiter conduct via our{' '}
            <Link to="/report-fraud" className="text-indigo-600 underline">Fraud Reporting Desk</Link>.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">4. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted under applicable Indian law, ZenSolve and its directors shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from your use of the platform, third-party interview interactions, or inability to access the service.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default Disclaimer;
