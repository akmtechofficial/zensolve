import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getStoredConsent,
  saveConsent,
  applyConsentGating,
} from '../services/cookieConsentService';
import { useAuth } from './useAuth';
import {
  FaCookieBite,
  FaShieldAlt,
  FaCheck,
  FaTimes,
  FaSlidersH,
  FaExternalLinkAlt,
} from 'react-icons/fa';

const CookieConsentBanner = () => {
  const { user } = useAuth();
  const [consent, setConsent] = useState(getStoredConsent());
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Custom preferences draft state
  const [customPrefs, setCustomPrefs] = useState({
    preferences: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const current = getStoredConsent();
    setConsent(current);
    applyConsentGating(current);

    if (!current.hasResponded) {
      // Delay slightly for smooth page load experience
      const timer = setTimeout(() => setShowBanner(true), 700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for external requests to reopen modal (e.g. from footer link)
  useEffect(() => {
    const handleOpen = () => {
      const current = getStoredConsent();
      setCustomPrefs({
        preferences: current.preferences,
        analytics: current.analytics,
        marketing: current.marketing,
      });
      setShowModal(true);
    };

    window.addEventListener('zensolve_open_cookie_modal', handleOpen);
    return () => window.removeEventListener('zensolve_open_cookie_modal', handleOpen);
  }, []);

  const handleAcceptAll = async () => {
    const updated = await saveConsent(
      { preferences: true, analytics: true, marketing: true },
      user?.uid
    );
    setConsent(updated);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleRejectOptional = async () => {
    const updated = await saveConsent(
      { preferences: false, analytics: false, marketing: false },
      user?.uid
    );
    setConsent(updated);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSaveCustom = async () => {
    const updated = await saveConsent(customPrefs, user?.uid);
    setConsent(updated);
    setShowBanner(false);
    setShowModal(false);
  };

  const openCustomizeModal = () => {
    setCustomPrefs({
      preferences: consent.preferences,
      analytics: consent.analytics,
      marketing: consent.marketing,
    });
    setShowBanner(false);
    setShowModal(true);
  };

  return (
    <>
      {/* 1. Sleek Floating Consent Card (Bottom-Right) */}
      {showBanner && (
        <aside
          role="region"
          aria-label="Privacy and Cookie Choices"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-md w-[calc(100%-2rem)] transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 font-sans"
        >
          <div className="relative rounded-2xl sm:rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-white/10 p-5 sm:p-6 shadow-2xl shadow-black/60 text-white">
            
            {/* Close / Dismiss button (Rejects optional by default) */}
            <button
              type="button"
              onClick={handleRejectOptional}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
              aria-label="Dismiss banner"
              title="Reject optional & dismiss"
            >
              <FaTimes size={14} />
            </button>

            {/* Header with Icon */}
            <div className="flex items-start gap-3.5 pr-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                <FaCookieBite size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  Privacy Choices
                </span>
                <h3 className="text-sm font-bold text-white font-display tracking-tight">
                  Your Privacy & Cookie Choices
                </h3>
              </div>
            </div>

            {/* Content Body */}
            <p className="text-xs text-slate-300 leading-relaxed mt-3">
              We use strictly necessary cookies to keep ZenSolve secure and authenticated. We also request your consent for optional analytical and preference cookies to improve recruitment workflows. Read our{' '}
              <Link
                to="/cookies"
                className="text-indigo-400 hover:text-indigo-300 underline font-medium inline-flex items-center gap-0.5"
              >
                <span>Cookie Policy</span>
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="text-indigo-400 hover:text-indigo-300 underline font-medium inline-flex items-center gap-0.5"
              >
                <span>Privacy Notice</span>
              </Link>.
            </p>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={openCustomizeModal}
                className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1.5 transition py-1.5 px-2 rounded-lg hover:bg-white/5"
              >
                <FaSlidersH size={11} className="text-indigo-400" />
                <span>Customize</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Reject Optional
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition active:scale-[0.98]"
                >
                  Accept All
                </button>
              </div>
            </div>

          </div>
        </aside>
      )}

      {/* 2. Detailed Customization Modal (Dark Themed to Match Platform) */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans"
        >
          <div className="bg-slate-900 border border-white/10 text-slate-100 rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-sm font-bold">
                  <FaSlidersH />
                </div>
                <div>
                  <h2 id="cookie-modal-title" className="text-base sm:text-lg font-bold text-white font-display">
                    Cookie & Privacy Preferences
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Control which data and cookies you allow ZenSolve to use.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition"
                aria-label="Close modal"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Strictly necessary cookies cannot be disabled as they are required for security, authentication, and core job portal navigation. Optional cookies run only with your consent.
            </p>

            {/* Categories List */}
            <div className="space-y-3">
              
              {/* Category 1: Strictly Necessary */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-white/5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">1. Strictly Necessary Cookies</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Always Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    Essential for Firebase session authentication, role-based route protection, resume download security, and CSRF defense.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="w-4 h-4 accent-indigo-600 rounded cursor-not-allowed mt-1 opacity-70"
                  aria-label="Strictly necessary cookies always enabled"
                />
              </div>

              {/* Category 2: Functional / Preferences */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 flex items-start justify-between gap-4 hover:border-white/10 transition">
                <div>
                  <span className="text-xs font-bold text-white block">2. Functional & Preference Cookies</span>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    Remembers your applied job search filters, preferred candidate category, and language preferences across sessions.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={customPrefs.preferences}
                  onChange={(e) => setCustomPrefs({ ...customPrefs, preferences: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer mt-1"
                  aria-label="Toggle preferences cookies"
                />
              </div>

              {/* Category 3: Analytics */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 flex items-start justify-between gap-4 hover:border-white/10 transition">
                <div>
                  <span className="text-xs font-bold text-white block">3. Performance & Analytics Cookies</span>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    Allows anonymous statistical measurement of page views, Core Web Vitals, and job seeker journey metrics to help us fix errors.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={customPrefs.analytics}
                  onChange={(e) => setCustomPrefs({ ...customPrefs, analytics: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer mt-1"
                  aria-label="Toggle analytics cookies"
                />
              </div>

              {/* Category 4: Marketing / Advertising */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 flex items-start justify-between gap-4 hover:border-white/10 transition">
                <div>
                  <span className="text-xs font-bold text-white block">4. Marketing & Targeted Advertisements</span>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    Used to display relevant career advice or sponsored vacancies. Currently, ZenSolve runs zero third-party advertisement networks.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={customPrefs.marketing}
                  onChange={(e) => setCustomPrefs({ ...customPrefs, marketing: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer mt-1"
                  aria-label="Toggle marketing cookies"
                />
              </div>

            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                Reject All Optional
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="py-2 px-3.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:text-white transition"
                >
                  Save My Choices
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition"
                >
                  Accept All
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsentBanner;
