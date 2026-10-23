import React from 'react';
import LegalLayout from './LegalLayout';
import { Link } from 'react-router-dom';
import { LEGAL_CONFIG } from '../../config/legalConfig';

const Terms = () => {
  const toc = [
    { id: 'acceptance', title: '1. Acceptance & Eligibility' },
    { id: 'accounts', title: '2. User Accounts & Passwordless Authentication' },
    { id: 'candidate-obligations', title: '3. Candidate Obligations & Representations' },
    { id: 'employer-obligations', title: '4. Employer Obligations & Job Posting Integrity' },
    { id: 'application-flow', title: '5. Application Routing & Resume Disclosure' },
    { id: 'prohibited-conduct', title: '6. Prohibited Activities & Job Fraud' },
    { id: 'suspension', title: '7. Account Moderation, Suspension & Termination' },
    { id: 'intellectual-property', title: '8. Content Rights & Intellectual Property' },
    { id: 'availability', title: '9. Service Limitations & No Employment Guarantee' },
    { id: 'governing-law', title: '10. Dispute Redressal & Applicable Law' },
  ];

  return (
    <LegalLayout
      title="Terms and Conditions of Service"
      docId="terms"
      version="1.0-draft"
      status="needs_legal_review"
      toc={toc}
    >
      <div className="space-y-6">
        <p className="lead font-medium text-slate-800">
          Welcome to ZenSolve. These Terms and Conditions of Service ("Terms") govern your access to and use of the website <strong>{LEGAL_CONFIG.entity.websiteDomain}</strong> and all associated recruitment, applicant tracking, and candidate discovery tools operated by <strong>{LEGAL_CONFIG.entity.provisionalLegalName}</strong> ("ZenSolve", "we", "us", or "our").
        </p>

        <section id="acceptance" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">1. Acceptance & Eligibility</h2>
          <p>
            By accessing or registering an account on ZenSolve, you agree to be bound by these Terms, our{' '}
            <Link to="/privacy" className="text-indigo-600 underline">Privacy Notice</Link>, and our{' '}
            <Link to="/acceptable-use" className="text-indigo-600 underline">Acceptable Use Policy</Link>. If you do not agree to these Terms, you must immediately discontinue use of the platform.
          </p>
          <p>
            The platform is intended exclusively for individuals aged 18 years and older who can form legally binding contracts under the Indian Contract Act, 1872. By creating a profile, you certify that you meet these eligibility criteria.
          </p>
        </section>

        <section id="accounts" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">2. User Accounts & Passwordless Authentication</h2>
          <p>
            ZenSolve utilizes secure passwordless email magic link and Google OAuth authentication managed through Firebase. You are solely responsible for safeguarding the email account associated with your ZenSolve profile. Any action performed through your verified authentication link will be deemed authorized by you.
          </p>
          <p>
            You agree to provide accurate, current, and verifiable contact information and to promptly update your profile in the event of changes.
          </p>
        </section>

        <section id="candidate-obligations" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">3. Candidate Obligations & Representations</h2>
          <p>
            Candidates using ZenSolve agree that all resumes, education records, skill credentials, and employment history submitted through the portal are truthful and accurate. Candidates must not submit plagiarized materials, impersonate other individuals, or use automated scrapers or bots to mass-apply for positions.
          </p>
          <p>
            ZenSolve provides a digital conduit connecting job seekers with recruiting organizations. <strong>ZenSolve does not guarantee job placement, interview callbacks, minimum compensation, or career advancement.</strong>
          </p>
        </section>

        <section id="employer-obligations" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">4. Employer Obligations & Job Posting Integrity</h2>
          <p>
            Employers and recruiters registering on ZenSolve must represent legitimate corporate entities. All employer profiles are subjected to administrative review before job publishing privileges are activated.
          </p>
          <p>
            Employers explicitly warrant that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>All job openings reflect genuine, current, and funded employment vacancies.</li>
            <li>No job posting demands application fees, security deposits, examination charges, or paid training from candidates.</li>
            <li>Candidate resumes and contact details obtained via ZenSolve will be used solely for evaluating candidates for the specified vacancy.</li>
            <li>Candidate personal data will not be resold, transferred, or harvested for commercial marketing.</li>
          </ul>
        </section>

        <section id="application-flow" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">5. Application Routing & Resume Disclosure</h2>
          <p>
            When a candidate submits an application for a specific vacancy, their resume, contact email, phone number, and cover pitch are securely shared with the verified employer managing that listing. This transmission is governed by our{' '}
            <Link to="/candidate-terms" className="text-indigo-600 underline">Candidate Terms & Resume Sharing Policy</Link>.
          </p>
          <p>
            Unrelated employers cannot browse or download private candidate resumes without a direct application.
          </p>
        </section>

        <section id="prohibited-conduct" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">6. Prohibited Activities & Job Fraud</h2>
          <p>
            Users of ZenSolve shall not:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>Post discriminatory, fraudulent, deceptive, or misleading job descriptions.</li>
            <li>Attempt to harvest passwords, OTPs, Aadhaar numbers, or financial account details.</li>
            <li>Circumvent or attempt to tamper with Firebase security rules, role restrictions, or API limits.</li>
            <li>Reverse-engineer, decompile, or scrape platform data.</li>
            <li>Upload malicious software, virus-infected documents, or malicious external redirect links.</li>
          </ul>
        </section>

        <section id="suspension" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">7. Account Moderation, Suspension & Termination</h2>
          <p>
            ZenSolve reserves the right to suspend, restrict, or permanently terminate user accounts that violate these Terms, engage in job scams, demand candidate fees, or receive verified fraud reports. Moderation decisions are logged in our internal audit engine.
          </p>
          <p>
            Users may close their account anytime or request complete data erasure via our{' '}
            <Link to="/data-deletion" className="text-indigo-600 underline">Data Erasure Portal</Link>.
          </p>
        </section>

        <section id="intellectual-property" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">8. Content Rights & Intellectual Property</h2>
          <p>
            The ZenSolve platform, branding, user interface, and proprietary software are owned by {LEGAL_CONFIG.entity.provisionalLegalName}. Users retain ownership of their personal resumes, trademarks, and profile content, granting ZenSolve a limited, non-exclusive license to host and transmit this information to facilitate recruitment.
          </p>
        </section>

        <section id="availability" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">9. Service Limitations & No Employment Guarantee</h2>
          <p>
            The platform is provided on an "as is" and "as available" basis. While we enforce strict validation and employer screening, ZenSolve does not warrant that the portal will be uninterrupted or error-free, nor do we endorse any employer or candidate.
          </p>
        </section>

        <section id="governing-law" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">10. Dispute Redressal & Applicable Law</h2>
          <p>
            These Terms shall be interpreted and governed by the laws of India, including the Information Technology Act, 2000, Consumer Protection Act, 2019, and Digital Personal Data Protection Act, 2023. Any dispute arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the competent courts in Jharkhand, India.
          </p>
          <p>
            For support or complaints, contact our compliance desk at{' '}
            <a href={`mailto:${LEGAL_CONFIG.contacts.provisionalPrivacyEmail}`} className="text-indigo-600 underline">
              {LEGAL_CONFIG.contacts.provisionalPrivacyEmail}
            </a>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default Terms;
