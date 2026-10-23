import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getStoredConsent,
  saveConsent,
  applyConsentGating,
} from '../services/cookieConsentService';
import { useAuth } from './useAuth';
import { Button } from './ui/Button';
import { FaCookieBite, FaShieldAlt, FaCheck, FaTimes, FaSlidersH } from 'react-icons/fa';

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
      // Delay slightly for smooth page load
      const timer = setTimeout(() => setShowBanner(true), 600);
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
      {/* 1. Bottom Persistent Banner (Only if unresponded) */}
      {showBanner && (
        <div
          role="region"
          aria-label="Privacy and Cookie Consent"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-800 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom duration-300"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FaCookieBite size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white font-display">
                  Your Privacy & Cookie Choices
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We use strictly necessary cookies to keep ZenSolve secure and authenticated. We also request your consent for optional analytical and preference cookies to improve recruitment workflows. No optional scripts run without your explicit consent. Read our{' '}
                  <Link to="/cookies" className="text-indigo-400 hover:text-indigo-300 underline font-medium">
                    Cookie Policy
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300 underline font-medium">
                    Privacy Notice
                  </Link>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={openCustomizeModal}
                className="text-xs text-slate-300 border-slate-700 hover:border-slate-600 hover:bg-slate-800 rounded-xl px-3.5 py-2"
              >
                Customize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectOptional}
                className="text-xs text-slate-300 border-slate-700 hover:border-slate-600 hover:bg-slate-800 rounded-xl px-3.5 py-2"
              >
                Reject Optional
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptAll}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-4 py-2 shadow-sm"
              >
                Accept All
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* 2. Detailed Customization Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                  <FaSlidersH />
                </div>
                <h2 id="cookie-modal-title" className="text-lg font-bold text-slate-900 font-display">
                  Cookie & Privacy Preferences
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                aria-label="Close modal"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Customize which categories of tracking and storage technologies you permit. Strictly necessary cookies cannot be disabled as they are required for security, authentication, and core job portal navigation.
            </p>

            {/* Categories List */}
            <div className="space-y-4">
              
              {/* Category 1: Strictly Necessary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">1. Strictly Necessary Cookies</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Always Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                    Essential for Firebase session authentication, role-based route protection, resume download security, and CSRF defense.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="w-4 h-4 accent-indigo-600 rounded cursor-not-allowed mt-1"
                  aria-label="Strictly necessary cookies always enabled"
                />
              </div>

              {/* Category 2: Functional / Preferences */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start justify-between gap-4 hover:border-slate-300 transition">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">2. Functional & Preference Cookies</span>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
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
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start justify-between gap-4 hover:border-slate-300 transition">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">3. Performance & Analytics Cookies</span>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
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
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start justify-between gap-4 hover:border-slate-300 transition">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">4. Marketing & Targeted Advertisements</span>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
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
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectOptional}
                className="text-xs border-slate-300 text-slate-700"
              >
                Reject All Optional
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveCustom}
                  className="text-xs border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                >
                  Save My Choices
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAcceptAll}
                  className="text-xs font-bold"
                >
                  Accept All
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsentBanner;
