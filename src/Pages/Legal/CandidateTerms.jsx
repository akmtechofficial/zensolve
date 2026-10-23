import React from 'react';
import LegalLayout from './LegalLayout';
import { Link } from 'react-router-dom';

const CandidateTerms = () => {
  const toc = [
    { id: 'candidate-profile', title: '1. Candidate Registration & Profile Accuracy' },
    { id: 'resume-locker', title: '2. Private Resume Storage & Access Rules' },
    { id: 'application-submission', title: '3. Application Routing & Recruiter Access' },
    { id: 'zero-fees', title: '4. Candidate Zero-Fee Guarantee' },
    { id: 'withdrawal-deletion', title: '5. Application Withdrawal & Account Erasure' },
  ];

  return (
    <LegalLayout
      title="Candidate Terms & Resume Sharing Policy"
      docId="candidate-terms"
      version="1.0-draft"
      status="needs_legal_review"
      toc={toc}
    >
      <div className="space-y-6">
        <p className="lead font-medium text-slate-800">
          These Candidate Terms govern your use of the candidate dashboard, resume management, and job application features on ZenSolve.
        </p>

        <section id="candidate-profile" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">1. Candidate Registration & Profile Accuracy</h2>
          <p>
            When creating a candidate profile, you agree to provide truthful and verifiable information regarding your education, professional experience, and technical competencies. Misrepresenting credentials or submitting falsified certificates may result in immediate suspension.
          </p>
        </section>

        <section id="resume-locker" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">2. Private Resume Storage & Access Rules</h2>
          <p className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-700">
            <strong>Private by Default:</strong> When you upload a resume PDF to your candidate profile, it is stored in an encrypted private Storage bucket. Other candidates cannot view or download your resume. Companies cannot search or harvest resumes across the candidate database.
          </p>
        </section>

        <section id="application-submission" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">3. Application Routing & Recruiter Access</h2>
          <p>
            When you voluntarily click "Apply" on a job opening, your candidate profile, resume attachment, and contact email are securely shared with the authorized recruiter of that specific company. The employer is bound by our{' '}
            <Link to="/employer-terms" className="text-indigo-600 underline">Employer Terms</Link>{' '}
            to use your data exclusively for evaluating your application.
          </p>
        </section>

        <section id="zero-fees" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">4. Candidate Zero-Fee Guarantee</h2>
          <p>
            Candidate accounts, job searching, resume uploading, and application submissions on ZenSolve are <strong>100% free of charge</strong>. If any employer or agent asks you for money in connection with a job on ZenSolve, refuse and{' '}
            <Link to="/report-fraud" className="text-indigo-600 underline">report them immediately</Link>.
          </p>
        </section>

        <section id="withdrawal-deletion" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">5. Application Withdrawal & Account Erasure</h2>
          <p>
            You can withdraw active applications directly from your Candidate Portal. To permanently delete your candidate profile, resume file, and account history, visit our{' '}
            <Link to="/data-deletion" className="text-indigo-600 underline">Data Erasure Request Page</Link>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default CandidateTerms;
