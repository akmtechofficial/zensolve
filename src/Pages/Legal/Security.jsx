import React from 'react';
import LegalLayout from './LegalLayout';
import { Link } from 'react-router-dom';
import { LEGAL_CONFIG } from '../../config/legalConfig';
import { FaShieldAlt, FaLock, FaKey, FaBug, FaServer } from 'react-icons/fa';

const Security = () => {
  const toc = [
    { id: 'overview', title: '1. Security Philosophy & Architecture' },
    { id: 'controls', title: '2. Implemented Technical Controls' },
    { id: 'resume-protection', title: '3. Candidate Resume Access Restrictions' },
    { id: 'responsible-disclosure', title: '4. Vulnerability Disclosure Program' },
    { id: 'reporting', title: '5. How to Report a Vulnerability' },
  ];

  return (
    <LegalLayout
      title="Security & Responsible Vulnerability Disclosure"
      docId="security"
      version="1.0-draft"
      status="needs_legal_review"
      toc={toc}
    >
      <div className="space-y-6">
        <p className="lead font-medium text-slate-800">
          At <strong>{LEGAL_CONFIG.entity.provisionalLegalName}</strong>, the security and confidentiality of candidate resumes, authentication tokens, and employer communications are foundational to our mission.
        </p>

        <section id="overview" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">1. Security Philosophy & Architecture</h2>
          <p>
            ZenSolve utilizes a privacy-by-design approach built upon Google Cloud Platform and Firebase infrastructure. We do not claim external certifications (such as ISO 27001 or SOC-2) until formal independent third-party audits are completed. Instead, we enforce transparent, rigorous application-level access controls and least-privilege principles.
          </p>
        </section>

        <section id="controls" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">2. Implemented Technical Controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FaLock className="text-indigo-600" />
                Encryption in Transit & at Rest
              </span>
              <p className="text-slate-600">
                All data transmitted between browsers and ZenSolve is encrypted via TLS 1.3. Stored database collections and resume objects are encrypted at rest using AES-256 in Google Cloud.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FaKey className="text-indigo-600" />
                Passwordless Authentication
              </span>
              <p className="text-slate-600">
                We eliminate credential stuffing and dictionary attacks by employing cryptographic email magic link verification and Google OAuth identity providers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FaServer className="text-indigo-600" />
                Database Rule Enforced Authorization
              </span>
              <p className="text-slate-600">
                Cloud Firestore and Storage security rules validate every read and write request server-side, preventing candidates or companies from accessing records outside their verified role.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FaShieldAlt className="text-indigo-600" />
                Administrative Audit Logging
              </span>
              <p className="text-slate-600">
                Sensitive operations (e.g. company approvals, account suspensions, job deletions) generate immutable audit logs for regulatory accountability.
              </p>
            </div>
          </div>
        </section>

        <section id="resume-protection" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">3. Candidate Resume Access Restrictions</h2>
          <p>
            Candidate resumes are classified as private documents in Cloud Storage. Storage security rules strictly prohibit unauthenticated or arbitrary candidate browsing. A resume is accessible exclusively to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>The candidate who uploaded the file.</li>
            <li>The verified recruiter associated with a specific job application.</li>
            <li>Super-administrators for platform moderation and security review.</li>
          </ul>
        </section>

        <section id="responsible-disclosure" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">4. Vulnerability Disclosure Program</h2>
          <p>
            We welcome responsible security research from developers and ethical hackers. If you discover a vulnerability in our application, API, or infrastructure, please disclose it to us privately so we can patch the issue before public disclosure.
          </p>
          <p className="text-xs text-slate-600">
            Researchers must not exploit vulnerabilities to access unauthorized candidate data, disrupt production services (no DDoS), or degrade database integrity.
          </p>
        </section>

        <section id="reporting" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">5. How to Report a Vulnerability</h2>
          <p>
            Send detailed vulnerability reports, steps to reproduce, and proof-of-concept payloads directly to:
          </p>
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-mono text-indigo-900">
            Email: {LEGAL_CONFIG.contacts.securityEmail}
            <br />
            Subject: [Security Vulnerability Report] &lt;Component Name&gt;
          </div>
          <p className="text-xs text-slate-500">
            You may also use our secure{' '}
            <Link to="/grievance-redressal" className="text-indigo-600 underline">
              Grievance & Vulnerability Ticket Form
            </Link>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default Security;
