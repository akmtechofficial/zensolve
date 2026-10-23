import React from 'react';
import LegalLayout from './LegalLayout';
import { LEGAL_CONFIG } from '../../config/legalConfig';

const Accessibility = () => {
  return (
    <LegalLayout
      title="Accessibility Statement"
      docId="accessibility"
      version="1.0-published"
      status="published"
    >
      <div className="space-y-6">
        <p className="lead font-medium text-slate-800">
          ZenSolve is committed to digital accessibility and ensuring that all candidates, including individuals with disabilities, can discover opportunities and manage job applications easily.
        </p>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">1. Conformance Standard & Goals</h2>
          <p>
            We continually work to align our portal with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA and the Rights of Persons with Disabilities Act, 2016.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">2. Implemented Accessibility Features</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li><strong>High-Contrast Color Palette:</strong> Deep navy typography against clean white surfaces ensuring WCAG compliant contrast ratios.</li>
            <li><strong>Keyboard Accessibility:</strong> Form inputs, buttons, and navigation dropdowns support standard Tab and Enter key operation.</li>
            <li><strong>Semantic HTML5 Structure:</strong> Clear heading levels, ARIA landmarks, and descriptive button labels.</li>
            <li><strong>Responsive Scaling:</strong> UI cleanly scales across mobile viewports (320px to 430px) without horizontal clipping.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">3. Accessibility Feedback</h2>
          <p>
            If you encounter an accessibility barrier on our website, please notify us at{' '}
            <a href={`mailto:${LEGAL_CONFIG.contacts.provisionalPrivacyEmail}`} className="text-indigo-600 underline">
              {LEGAL_CONFIG.contacts.provisionalPrivacyEmail}
            </a>
            . We prioritize accessibility bug reports and aim to rectify them promptly.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default Accessibility;
