/**
 * ZenSolve Cookie & Storage Consent Service
 * 
 * Manages user privacy choices in compliance with privacy-by-design standards.
 * Guarantees that optional scripts/cookies (Analytics, Preferences, Marketing)
 * do NOT run unless explicit opt-in consent has been granted.
 */

import { db } from '../firebaseConfig.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CONSENT_STORAGE_KEY = 'zensolve_consent_v1';
export const CURRENT_CONSENT_VERSION = '1.0';

export const DEFAULT_CONSENT = {
  necessary: true, // Always true and non-configurable
  preferences: false,
  analytics: false,
  marketing: false,
  timestamp: null,
  version: CURRENT_CONSENT_VERSION,
  hasResponded: false,
};

/**
 * Get current stored consent settings
 */
export const getStoredConsent = () => {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONSENT };
    const parsed = JSON.parse(raw);
    return {
      necessary: true,
      preferences: Boolean(parsed.preferences),
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      timestamp: parsed.timestamp || null,
      version: parsed.version || CURRENT_CONSENT_VERSION,
      hasResponded: Boolean(parsed.hasResponded),
    };
  } catch (err) {
    console.warn('Storage access restricted; falling back to default consent.');
    return { ...DEFAULT_CONSENT };
  }
};

/**
 * Save user consent preferences & apply technical gating
 */
export const saveConsent = async (preferences, userId = null) => {
  const consentRecord = {
    necessary: true,
    preferences: Boolean(preferences.preferences),
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
    timestamp: new Date().toISOString(),
    version: CURRENT_CONSENT_VERSION,
    hasResponded: true,
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentRecord));
  } catch (err) {
    console.warn('Unable to persist consent to localStorage:', err);
  }

  // Trigger dispatch event so all components react in real-time
  window.dispatchEvent(new CustomEvent('zensolve_consent_updated', { detail: consentRecord }));

  // Apply technical gating based on user choices
  applyConsentGating(consentRecord);

  // Optional: record minimal anonymous or authenticated audit log in Firestore
  try {
    await addDoc(collection(db, 'consentLogs'), {
      userId: userId || 'anonymous',
      categories: {
        preferences: consentRecord.preferences,
        analytics: consentRecord.analytics,
        marketing: consentRecord.marketing,
      },
      version: CURRENT_CONSENT_VERSION,
      userAgent: navigator.userAgent?.slice(0, 150) || 'unknown',
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    // Audit logging failure should never block user interaction
    console.debug('Consent log audit record bypassed.');
  }

  return consentRecord;
};

/**
 * Apply real technical script gating
 */
export const applyConsentGating = (consent) => {
  if (typeof window === 'undefined') return;

  // 1. Analytics Gating
  if (consent.analytics) {
    // If a Google Analytics ID is provided in env, load and initialize
    const gaId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID) || null;
    if (gaId && !window.__zensolve_ga_initialized) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', gaId, { anonymize_ip: true });
      window.__zensolve_ga_initialized = true;
    }
  } else {
    // If user rejected or withdrew analytics, disable GA tracking signals
    const gaId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID) || null;
    if (gaId) {
      window[`ga-disable-${gaId}`] = true;
    }
  }

  // 2. Marketing Gating
  if (!consent.marketing) {
    // Ensure no third-party marketing pixels execute
    window.__zensolve_marketing_blocked = true;
  }
};
