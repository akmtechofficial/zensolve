import React, { useState, useEffect } from 'react';
import LegalLayout from './LegalLayout';
import {
  getStoredConsent,
  saveConsent,
  CURRENT_CONSENT_VERSION,
} from '../../services/cookieConsentService';
import { useAuth } from '../../components/useAuth';
import { Button } from '../../components/ui/Button';
import { FaCookieBite, FaShieldAlt, FaCheckCircle, FaSlidersH } from 'react-icons/fa';

const ConsentPreferences = () => {
  const { user } = useAuth();
  const [consent, setConsent] = useState(getStoredConsent());
  const [prefs, setPrefs] = useState({
    preferences: false,
    analytics: false,
    marketing: false,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const current = getStoredConsent();
    setConsent(current);
    setPrefs({
      preferences: current.preferences,
      analytics: current.analytics,
      marketing: current.marketing,
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const updated = await saveConsent(prefs, user?.uid);
    setConsent(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleAcceptAll = async () => {
    const updated = await saveConsent(
      { preferences: true, analytics: true, marketing: true },
      user?.uid
    );
    setConsent(updated);
    setPrefs({ preferences: true, analytics: true, marketing: true });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleRejectOptional = async () => {
    const updated = await saveConsent(
      { preferences: false, analytics: false, marketing: false },
      user?.uid
    );
    setConsent(updated);
    setPrefs({ preferences: false, analytics: false, marketing: false });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <LegalLayout
      title="Consent Preferences & Cookie Controls"
      docId="consent-preferences"
      version={CURRENT_CONSENT_VERSION}
      status="published"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Manage Your Privacy & Storage Settings
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
            ZenSolve respects your privacy rights under India's Digital Personal Data Protection Act, 2023. You have full granular control over which storage technologies we employ on your browser.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <FaCheckCircle className="text-emerald-600 text-sm flex-shrink-0" />
            <span>Your privacy preferences have been updated and applied to active scripts.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* 1. Necessary */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">1. Strictly Necessary Technologies</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    Always Required
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Required for Firebase user authentication, role-guarded access, session maintenance, and security verification. Cannot be disabled.
                </p>
              </div>
              <input
                type="checkbox"
                checked
                disabled
                className="w-5 h-5 accent-indigo-600 rounded cursor-not-allowed mt-1"
              />
            </div>
          </div>

          {/* 2. Preferences */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-sm font-bold text-slate-900 block">2. Functional & Interface Preferences</span>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Remembers your active job search filters, preferred employment categories, and dashboard UI settings across page visits.
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.preferences}
                onChange={(e) => setPrefs({ ...prefs, preferences: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* 3. Analytics */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-sm font-bold text-slate-900 block">3. Performance & Web Analytics</span>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Allows anonymous measurement of platform usage, candidate funnel completion, and system responsiveness to help us resolve application bugs.
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* 4. Marketing */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-sm font-bold text-slate-900 block">4. Marketing & Career Opportunity Alerts</span>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Permission to receive tailored job alerts and career updates. ZenSolve does not sell your contact information to third-party ad brokers.
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleRejectOptional}
                className="text-xs border-slate-300 text-slate-700"
              >
                Reject All Optional
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleAcceptAll}
                className="text-xs border-slate-300 text-slate-700"
              >
                Accept All
              </Button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="text-xs font-bold px-6 shadow-xs"
            >
              Save Consent Preferences
            </Button>
          </div>
        </form>
      </div>
    </LegalLayout>
  );
};

export default ConsentPreferences;
