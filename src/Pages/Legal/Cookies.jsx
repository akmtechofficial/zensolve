import React from 'react';
import LegalLayout from './LegalLayout';
import { Link } from 'react-router-dom';
import { LEGAL_CONFIG } from '../../config/legalConfig';
import { Button } from '../../components/ui/Button';

const Cookies = () => {
  const openBanner = () => {
    window.dispatchEvent(new CustomEvent('zensolve_open_cookie_modal'));
  };

  const toc = [
    { id: 'what-are-cookies', title: '1. What Are Cookies & Local Storage?' },
    { id: 'categories', title: '2. Cookie Categories Used on ZenSolve' },
    { id: 'third-parties', title: '3. Third-Party Scripts & Analytics' },
    { id: 'managing', title: '4. How to Control Your Consent' },
    { id: 'updates', title: '5. Policy Updates' },
  ];

  return (
    <LegalLayout
      title="Cookie Policy & Tracking Technologies"
      docId="cookies"
      version="1.0-published"
      status="published"
      toc={toc}
    >
      <div className="space-y-6">
        <p className="lead font-medium text-slate-800">
          This Cookie Policy explains how <strong>{LEGAL_CONFIG.entity.provisionalLegalName}</strong> uses cookies, localStorage, and similar tracking technologies on <strong>{LEGAL_CONFIG.entity.websiteDomain}</strong>.
        </p>

        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-indigo-950 font-medium">
            You can modify or withdraw your cookie consent choices at any time.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={openBanner}
            className="text-xs bg-white text-indigo-700 border-indigo-300 font-bold"
          >
            Open Cookie Settings
          </Button>
        </div>

        <section id="what-are-cookies" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">1. What Are Cookies & Local Storage?</h2>
          <p>
            Cookies are small text files placed on your browser or device when you visit a website. Local Storage and Session Storage are modern HTML5 mechanisms that allow web applications to store structured data locally on your device without sending it with every HTTP request.
          </p>
        </section>

        <section id="categories" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">2. Cookie Categories Used on ZenSolve</h2>
          
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">A. Strictly Necessary (Always Active)</strong>
              <p className="text-slate-600 leading-relaxed">
                Required to maintain your authenticated candidate or employer session (Firebase Auth token storage), prevent CSRF attacks, and safeguard protected portal dashboards. These do not require user consent under DPDP Act 2023.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">B. Functional & Preference Cookies (Optional)</strong>
              <p className="text-slate-600 leading-relaxed">
                Stores your preferred job search keyword history, active location filters, and dark/light UI mode preferences. Active only when opted into.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">C. Performance & Analytics Cookies (Optional)</strong>
              <p className="text-slate-600 leading-relaxed">
                Helps us count page visits and understand user navigation paths. Operates only when enabled by user consent. IP addresses are anonymized.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">D. Marketing & Advertising Technologies (Optional)</strong>
              <p className="text-slate-600 leading-relaxed">
                ZenSolve does not currently host commercial third-party advertising banners. If job alert marketing is launched in the future, it will remain strictly opt-in.
              </p>
            </div>
          </div>
        </section>

        <section id="third-parties" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">3. Third-Party Scripts & Analytics</h2>
          <p>
            ZenSolve uses Google Firebase services. If Google Analytics is configured, tracking scripts are gated and will not initialize until you grant explicit consent via our cookie banner.
          </p>
        </section>

        <section id="managing" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">4. How to Control Your Consent</h2>
          <p>
            You can update your choices anytime on our{' '}
            <Link to="/consent-preferences" className="text-indigo-600 underline">
              Consent Preferences Page
            </Link>{' '}
            or by clicking "Cookie Settings" in the platform footer. You may also configure your web browser (Chrome, Edge, Firefox, Safari) to block or delete cookies.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default Cookies;
