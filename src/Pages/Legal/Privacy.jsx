import React from 'react';
import LegalLayout from './LegalLayout';
import { Link } from 'react-router-dom';
import { LEGAL_CONFIG } from '../../config/legalConfig';

const Privacy = () => {
  const toc = [
    { id: 'introduction', title: '1. Introduction & Statutory Framework' },
    { id: 'data-collected', title: '2. Personal Data Inventory' },
    { id: 'purpose', title: '3. Purposes of Processing & Legal Basis' },
    { id: 'resume-sharing', title: '4. Candidate Resume & Application Sharing' },
    { id: 'subprocessors', title: '5. Technical Infrastructure & Sub-processors' },
    { id: 'security', title: '6. Security Safeguards & Encryption' },
    { id: 'retention', title: '7. Data Retention & Storage Schedule' },
    { id: 'user-rights', title: '8. Your Rights Under DPDP Act, 2023' },
    { id: 'contact', title: '9. Privacy Contact & Grievance Mechanism' },
  ];

  return (
    <LegalLayout
      title="Privacy Notice & Data Protection Policy"
      docId="privacy"
      version="1.0-draft"
      status="needs_legal_review"
      toc={toc}
    >
      <div className="space-y-6">
        <p className="lead font-medium text-slate-800">
          This Privacy Notice explains how <strong>{LEGAL_CONFIG.entity.provisionalLegalName}</strong> ("ZenSolve", "we", "us", or "our") collects, uses, stores, and protects personal data provided by candidates and employers on <strong>{LEGAL_CONFIG.entity.websiteDomain}</strong>.
        </p>

        <section id="introduction" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">1. Introduction & Statutory Framework</h2>
          <p>
            ZenSolve operates as a Data Fiduciary under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and complies with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011. We collect only the minimum personal information required to deliver recruitment and job-matching services.
          </p>
        </section>

        <section id="data-collected" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">2. Personal Data Inventory</h2>
          <p>
            Depending on your role and engagement on the portal, we collect the following categories of data:
          </p>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">A. Candidate Profile Information</strong>
              <span>Full name, email address, mobile phone number, current city/location, headline, skills tags, and educational background.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">B. Resume / Curriculum Vitae Documents</strong>
              <span>PDF and Word documents uploaded to your candidate locker. Stored securely in Google Cloud Storage with private access controls.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">C. Job Applications & Recruiter Communications</strong>
              <span>Applications submitted, cover notes, salary expectations, interview schedules, and recruiter evaluation notes.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">D. Employer & Organization Records</strong>
              <span>HR representative name, corporate email, business address, company registration details, industry, and job vacancy postings.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">E. Security & Authentication Telemetry</strong>
              <span>Firebase Auth UIDs, passwordless login tokens, IP addresses, device user-agents, and timestamped security audit logs.</span>
            </div>
          </div>
        </section>

        <section id="purpose" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">3. Purposes of Processing & Legal Basis</h2>
          <p>We process your personal data for:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>Facilitating job discovery, search filtering, and candidate profile creation.</li>
            <li>Routing submitted applications directly to the hiring recruiter.</li>
            <li>Authenticating user sessions and safeguarding accounts against unauthorized access.</li>
            <li>Detecting and preventing job fraud, scam postings, and fee extortion.</li>
            <li>Complying with statutory requirements under Indian law.</li>
          </ul>
        </section>

        <section id="resume-sharing" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">4. Candidate Resume & Application Sharing</h2>
          <p className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 text-xs leading-relaxed">
            <strong>Key Privacy Guarantee:</strong> Your uploaded resume and contact details are NEVER publicly accessible. Your resume is shared ONLY with the specific verified hiring company when you voluntarily click "Apply" on their job opening. Unrelated companies, search engine scrapers, and third-party marketers cannot access your resume documents.
          </p>
        </section>

        <section id="subprocessors" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">5. Technical Infrastructure & Sub-processors</h2>
          <p>
            ZenSolve utilizes enterprise cloud infrastructure provided by Google Cloud Platform / Firebase:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li><strong>Firebase Authentication:</strong> Passwordless login and identity token validation.</li>
            <li><strong>Cloud Firestore:</strong> NoSQL database storage for candidate profiles, job postings, and applications.</li>
            <li><strong>Cloud Storage:</strong> Encrypted object storage for private resumes and verified company logos.</li>
            <li><strong>Firebase Hosting:</strong> Global content delivery network (CDN) delivering frontend code.</li>
          </ul>
          <p className="text-xs text-slate-500">
            We do not sell, rent, or trade your personal data with third-party data brokers or advertisement networks.
          </p>
        </section>

        <section id="security" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">6. Security Safeguards & Encryption</h2>
          <p>
            ZenSolve implements defense-in-depth security including TLS 1.3 encryption in transit, AES-256 encryption at rest in Firebase Cloud Storage, granular Firestore security rules, role-based access control, and an immutable administrative audit logging framework.
          </p>
        </section>

        <section id="retention" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">7. Data Retention & Storage Schedule</h2>
          <p>
            Personal data is retained only as long as necessary to fulfill recruitment purposes or satisfy legal obligations. Users can request immediate deletion at any time via our{' '}
            <Link to="/data-deletion" className="text-indigo-600 underline">Data Erasure Portal</Link>. See our{' '}
            <Link to="/data-retention" className="text-indigo-600 underline">Data Retention Schedule</Link> for detailed timelines.
          </p>
        </section>

        <section id="user-rights" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">8. Your Rights Under DPDP Act, 2023</h2>
          <p>Under Indian data protection law, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li><strong>Right to Access:</strong> View a summary of your personal data processed by ZenSolve.</li>
            <li><strong>Right to Correction:</strong> Update outdated profile details, skills, or resume attachments.</li>
            <li><strong>Right to Erasure:</strong> Request permanent deletion of your candidate profile and applications.</li>
            <li><strong>Right to Grievance Redressal:</strong> Register complaints with our data protection desk.</li>
            <li><strong>Right to Nominate:</strong> Nominate an individual to exercise rights on your behalf in the event of incapacity.</li>
          </ul>
        </section>

        <section id="contact" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">9. Privacy Contact & Grievance Mechanism</h2>
          <p>
            To exercise your data protection rights, submit a formal request via our{' '}
            <Link to="/grievance-redressal" className="text-indigo-600 underline">Grievance Portal</Link>{' '}
            or email our privacy desk directly at{' '}
            <a href={`mailto:${LEGAL_CONFIG.contacts.provisionalPrivacyEmail}`} className="text-indigo-600 underline">
              {LEGAL_CONFIG.contacts.provisionalPrivacyEmail}
            </a>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default Privacy;
