import React from 'react';
import LegalLayout from './LegalLayout';
import { Link } from 'react-router-dom';

const EmployerTerms = () => {
  const toc = [
    { id: 'verification', title: '1. Company Registration & Verification Audit' },
    { id: 'job-posting-rules', title: '2. Job Publishing Standards & Accuracy' },
    { id: 'candidate-privacy', title: '3. Candidate Data Handling & Confidentiality' },
    { id: 'fee-prohibition', title: '4. Absolute Prohibition on Candidate Fees' },
    { id: 'suspension', title: '5. Account Suspension & Breach Liabilities' },
  ];

  return (
    <LegalLayout
      title="Employer & Recruiter Service Terms"
      docId="employer-terms"
      version="1.0-draft"
      status="needs_legal_review"
      toc={toc}
    >
      <div className="space-y-6">
        <p className="lead font-medium text-slate-800">
          These Employer Terms govern all organizations, HR leaders, and recruiting agencies registering on ZenSolve to publish vacancies or review candidate applications.
        </p>

        <section id="verification" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">1. Company Registration & Verification Audit</h2>
          <p>
            When registering an employer account, you must provide valid business details, official corporate email, and genuine office address. ZenSolve administrators review every employer profile before job publishing capabilities are granted. Accounts with incomplete, deceptive, or non-verifiable credentials will remain restricted.
          </p>
        </section>

        <section id="job-posting-rules" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">2. Job Publishing Standards & Accuracy</h2>
          <p>
            Every vacancy published must represent an authentic, open employment role with disclosed responsibilities, location, and legitimate compensation. Expired or filled roles must be promptly marked "Closed" in the HR Console.
          </p>
        </section>

        <section id="candidate-privacy" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">3. Candidate Data Handling & Confidentiality</h2>
          <p>
            As an employer receiving candidate resumes through ZenSolve, you act as a Data Fiduciary under the <strong>DPDP Act, 2023</strong> regarding candidate data in your custody. You agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>Process candidate resumes exclusively for evaluating suitability for the applied vacancy.</li>
            <li>Maintain technical security measures to prevent unauthorized disclosure of applicant contacts.</li>
            <li>Never sell, broker, or transmit candidate databases to third-party marketing networks.</li>
            <li>Honor candidate erasure requests when formally notified.</li>
          </ul>
        </section>

        <section id="fee-prohibition" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">4. Absolute Prohibition on Candidate Fees</h2>
          <p className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
            Employers are strictly forbidden from demanding fees, training costs, software deposit charges, or security amounts from job applicants. Any violation leads to immediate company suspension and reporting to cybercrime authorities.
          </p>
        </section>

        <section id="suspension" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">5. Account Suspension & Breach Liabilities</h2>
          <p>
            ZenSolve reserves the right to suspend any employer profile that breaches these Terms, receives candidate fraud complaints, or violates Indian recruitment regulations.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default EmployerTerms;
