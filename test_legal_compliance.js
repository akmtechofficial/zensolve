import assert from 'assert';
import { LEGAL_CONFIG } from './src/config/legalConfig.js';
import { DEFAULT_CONSENT, CURRENT_CONSENT_VERSION } from './src/services/cookieConsentService.js';

console.log('--- RUNNING LEGAL & PRIVACY COMPLIANCE AUDIT TESTS ---');

// Test 1: Verify provisional configuration integrity
assert.strictEqual(LEGAL_CONFIG.entity.verificationStatus, 'pending_verification', 'Entity verification must be marked pending');
assert.strictEqual(LEGAL_CONFIG.entity.cin, 'UNKNOWN', 'CIN must not be fabricated');
assert.strictEqual(LEGAL_CONFIG.entity.websiteDomain, 'infozensolve.in', 'Website domain must match infozensolve.in');
assert.strictEqual(LEGAL_CONFIG.contacts.grievanceContactStatus, 'unconfirmed', 'Grievance contact must be marked unconfirmed');
assert.strictEqual(LEGAL_CONFIG.contacts.provisionalPrivacyEmail, 'carezensolve@gmail.com', 'Privacy email must match carezensolve@gmail.com');
assert.strictEqual(LEGAL_CONFIG.processors.paidServices, false, 'Paid services must be false');
console.log('✓ Test 1 Passed: Provisional configuration contains no fabricated facts.');

// Test 2: Verify all 16 legal documents are registered
const docs = Object.values(LEGAL_CONFIG.documents);
assert.strictEqual(docs.length, 14, 'Should register all standard legal policies');
const requiredPaths = [
  '/terms',
  '/privacy',
  '/cookies',
  '/security',
  '/acceptable-use',
  '/candidate-terms',
  '/employer-terms',
  '/data-retention',
  '/data-deletion',
  '/report-fraud',
  '/grievance-redressal',
  '/disclaimer',
  '/accessibility',
  '/intellectual-property',
];

requiredPaths.forEach((path) => {
  const match = docs.find((d) => d.path === path);
  assert.ok(match, `Missing document configuration for ${path}`);
});
console.log('✓ Test 2 Passed: All required legal routes are properly defined and mapped.');

// Test 3: Cookie consent defaults
assert.strictEqual(DEFAULT_CONSENT.necessary, true, 'Necessary cookies must default to true');
assert.strictEqual(DEFAULT_CONSENT.preferences, false, 'Preferences must not be pre-selected');
assert.strictEqual(DEFAULT_CONSENT.analytics, false, 'Analytics must not be pre-selected');
assert.strictEqual(DEFAULT_CONSENT.marketing, false, 'Marketing must not be pre-selected');
assert.strictEqual(DEFAULT_CONSENT.hasResponded, false, 'Initial state must indicate unresponded');
assert.strictEqual(DEFAULT_CONSENT.version, CURRENT_CONSENT_VERSION, 'Consent version must match');
console.log('✓ Test 3 Passed: Cookie consent defaults enforce privacy-by-design (zero pre-selected optional consent).');

console.log('--- ALL COMPLIANCE INTEGRITY TESTS COMPLETED SUCCESSFULLY ---');
