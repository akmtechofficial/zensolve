/**
 * Utility functions for serverless endpoints
 */

/**
 * Escapes HTML characters in user-controlled strings to prevent HTML injection & email phishing (S14)
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  const text = String(str);
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Validates that an external URL is safe (http/https only, no javascript: or data: URIs)
 */
export function isSafeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
