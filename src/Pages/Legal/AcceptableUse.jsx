import React from 'react';
import LegalLayout from './LegalLayout';
import { Link } from 'react-router-dom';

const AcceptableUse = () => {
  const toc = [
    { id: 'purpose', title: '1. Purpose & Scope' },
    { id: 'job-posting-rules', title: '2. Job Posting Standards & Prohibited Listings' },
    { id: 'scams-fee-demands', title: '3. Zero Tolerance for Candidate Fees' },
    { id: 'system-abuse', title: '4. System Integrity & Anti-Scraping' },
    { id: 'reporting-violations', title: '5. Reporting Violations & Enforcement' },
  ];

  return (
    <LegalLayout
      title="Job Posting & Acceptable Use Policy"
      docId="acceptable-use"
      version="1.0-draft"
      status="needs_legal_review"
      toc={toc}
    >
      <div className="space-y-6">
        <p className="lead font-medium text-slate-800">
          This Acceptable Use Policy defines the standards for all recruiters, employers, and candidates publishing content or interacting on ZenSolve.
        </p>

        <section id="purpose" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">1. Purpose & Scope</h2>
          <p>
            ZenSolve maintains a high-trust talent ecosystem. Every job posting, candidate pitch, and message must reflect lawful, professional, and non-exploitative recruitment practices.
          </p>
        </section>

        <section id="job-posting-rules" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">2. Job Posting Standards & Prohibited Listings</h2>
          <p>
            Employers are strictly prohibited from publishing listings that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>Promote multi-level marketing (MLM), pyramid schemes, or cryptocurrency investments.</li>
            <li>Involve illegal acts, adult entertainment, gambling, or hazardous labor.</li>
            <li>Discriminate on the basis of caste, religion, gender, sexual orientation, disability, or marital status.</li>
            <li>Contain vague titles or intentionally conceal the true identity of the employer.</li>
            <li>Require candidates to buy products or pay for training materials as a prerequisite for employment.</li>
          </ul>
        </section>

        <section id="scams-fee-demands" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">3. Zero Tolerance for Candidate Fees</h2>
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
            <strong className="block text-sm">STRICT BAN ON RECRUITMENT FEES</strong>
            <p className="leading-relaxed">
              Any employer, agency, or user that solicits registration charges, interview gate fees, laptop deposits, or test fees from candidates will be permanently banned from ZenSolve, and their profile details will be forwarded to law enforcement authorities.
            </p>
          </div>
        </section>

        <section id="system-abuse" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">4. System Integrity & Anti-Scraping</h2>
          <p>
            Users must not attempt to scrape candidate profiles, flood the platform with automated applications, bypass rate limits, or probe endpoints for vulnerabilities.
          </p>
        </section>

        <section id="reporting-violations" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">5. Reporting Violations & Enforcement</h2>
          <p>
            If you encounter a job posting or user violating this policy, report it immediately through our{' '}
            <Link to="/report-fraud" className="text-indigo-600 underline">Fraud & Violation Reporting Form</Link>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default AcceptableUse;
