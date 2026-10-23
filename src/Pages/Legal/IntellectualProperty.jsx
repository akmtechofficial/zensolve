import React from 'react';
import LegalLayout from './LegalLayout';
import { LEGAL_CONFIG } from '../../config/legalConfig';

const IntellectualProperty = () => {
  return (
    <LegalLayout
      title="Intellectual Property & Copyright Policy"
      docId="intellectual-property"
      version="1.0-published"
      status="published"
    >
      <div className="space-y-6">
        <p className="lead font-medium text-slate-800">
          This Intellectual Property Policy defines copyright ownership, user content licensing, and trademark protections for <strong>{LEGAL_CONFIG.entity.websiteDomain}</strong>.
        </p>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">1. ZenSolve Proprietary Property</h2>
          <p>
            All website software, algorithms, applicant tracking workflows, database schemas, logo designs, icons, and editorial text created by ZenSolve are protected by the Copyright Act, 1957 and Trade Marks Act, 1999 of India. No portion may be reproduced without prior written permission.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">2. User Content & Trademarks</h2>
          <p>
            Employers and candidates retain intellectual property rights to the resumes, corporate logos, and job descriptions they upload. By uploading materials, users grant ZenSolve a limited, royalty-free license to host, display, and index such content strictly to operate the recruitment service.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">3. Infringement Notices & Takedown Procedure</h2>
          <p>
            If you believe your trademark or copyrighted work has been improperly published on our platform without authorization, send a written takedown notice to{' '}
            <a href={`mailto:${LEGAL_CONFIG.contacts.provisionalPrivacyEmail}`} className="text-indigo-600 underline">
              {LEGAL_CONFIG.contacts.provisionalPrivacyEmail}
            </a>{' '}
            specifying the URL, proof of ownership, and exact description of the infringing asset.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default IntellectualProperty;
