import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig.js';
import { notifyAdminNewCompany } from './notificationService.js';

export const SUPER_ADMIN_EMAIL = 'admin@zensolve.in';
export const ADMIN_EMAILS = ['admin@zensolve.in'];

/**
 * Validates and normalizes email format
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email address is required.' };
  }
  const normalized = email.trim().toLowerCase();
  // Standard RFC 5322 compliant regex for practical email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  
  if (!emailRegex.test(normalized)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  return { valid: true, email: normalized };
};

/**
 * Checks whether an email belongs to an authorized super-admin
 */
export const isSuperAdminEmail = (email) => {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL;
};

/**
 * Dispatches a passwordless sign-in link via Firebase Authentication
 */
export const sendPasswordlessEmailLink = async (rawEmail, role = 'candidate', returnUrl = null) => {
  const validation = validateEmail(rawEmail);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const email = validation.email;

  // Sanitize role intent: strictly allow 'company' or 'candidate', never client-asserted 'admin'
  const sanitizedRole = role === 'company' || role === 'employer' ? 'company' : 'candidate';

  // Build the approval action code settings
  // The redirect URL points to /auth/callback with role intent and returnUrl preserved safely
  const origin = window.location.origin;
  const callbackUrl = new URL(`${origin}/auth/callback`);
  callbackUrl.searchParams.set('role', sanitizedRole);

  if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('/login') && !returnUrl.startsWith('/signup') && !returnUrl.startsWith('/register')) {
    callbackUrl.searchParams.set('returnUrl', returnUrl);
  }

  const actionCodeSettings = {
    url: callbackUrl.toString(),
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    // Save transient state in localStorage for callback resolution
    window.localStorage.setItem('emailForSignIn', email);
    window.localStorage.setItem('pendingAuthRole', sanitizedRole);
    window.localStorage.setItem('magicLinkSentTimestamp', Date.now().toString());

    return { success: true, email };
  } catch (error) {
    console.error('Firebase sendSignInLinkToEmail error:', error);
    let friendlyMessage = 'Unable to send sign-in link. Please verify your email and try again.';
    if (error.code === 'auth/invalid-email') {
      friendlyMessage = 'The provided email address is invalid.';
    } else if (error.code === 'auth/quota-exceeded') {
      friendlyMessage = 'Sign-in link quota exceeded for today. Please try again shortly or use Google Sign-In.';
    } else if (error.code === 'auth/too-many-requests') {
      friendlyMessage = 'Too many requests. Please wait a few moments before requesting another link.';
    } else if (error.code === 'auth/unauthorized-continue-uri') {
      friendlyMessage = 'Domain not authorized in Firebase Console. Please add this domain to Authorized Domains.';
    }
    const enhancedError = new Error(friendlyMessage);
    enhancedError.code = error.code;
    throw enhancedError;
  }
};

/**
 * Resolves or initializes user profile in Firestore.
 * - Idempotent: Never overwrites an existing user's role or organization profile.
 * - Validates role intent: Only sets 'company' or 'candidate' (or admin for verified admin emails).
 * - Flags errors explicitly instead of silently assigning an arbitrary fallback.
 */
export const resolveUserProfile = async (user, requestedRole = null) => {
  if (!user?.uid) return null;

  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const existingData = userSnap.data();
      // Ensure super-admin status is maintained only for designated super admin
      if (isSuperAdminEmail(user.email)) {
        return { ...existingData, role: 'admin' };
      }
      // If an unauthorized account has role 'admin' in Firestore, override to candidate
      if (existingData.role === 'admin') {
        return { ...existingData, role: 'candidate' };
      }
      // Return existing profile with its established role intact (no overwrite)
      return existingData;
    }

    // New User Profile Setup: Determine role from authorized intent
    const isAdmin = isSuperAdminEmail(user.email);
    const validRole = isAdmin
      ? 'admin'
      : requestedRole === 'company' || requestedRole === 'employer'
      ? 'company'
      : 'candidate';

    const newProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || '',
      role: validRole,
      savedJobs: [],
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    if (validRole === 'company') {
      newProfile.companyName = user.displayName || 'My Organization';
      newProfile.approved = false; // Requires admin verification
      newProfile.status = 'pending';
    }

    await setDoc(userRef, newProfile);

    if (validRole === 'company') {
      notifyAdminNewCompany({
        uid: user.uid,
        companyName: newProfile.companyName,
        hrName: user.displayName || 'HR User',
        email: user.email,
        phone: user.phoneNumber || '',
        companyType: 'Organization',
        industry: 'Not Specified',
        location: 'India',
      }).catch((e) => console.warn('Admin notification warning:', e));
    }

    return newProfile;
  } catch (err) {
    console.error('Error in resolveUserProfile:', err);
    const isAdmin = isSuperAdminEmail(user.email);
    // Explicit error flag: do NOT assume a role silently on failure
    return {
      uid: user.uid,
      email: user.email,
      role: isAdmin ? 'admin' : (requestedRole === 'company' ? 'company' : null),
      profileError: true,
      errorMessage: err.message,
    };
  }
};

/**
 * Completes email-link sign-in when the user lands on the callback route
 */
export const completeEmailLinkSignIn = async (providedEmail = null) => {
  const currentUrl = window.location.href;
  if (!isSignInWithEmailLink(auth, currentUrl)) {
    return { isEmailLink: false, error: 'URL is not a valid Firebase email sign-in link.' };
  }

  // Retrieve stored email from local storage or user input
  let email = providedEmail ? providedEmail.trim().toLowerCase() : window.localStorage.getItem('emailForSignIn');

  if (!email) {
    return { requiresEmailInput: true, isEmailLink: true };
  }

  const validation = validateEmail(email);
  if (!validation.valid) {
    return { requiresEmailInput: true, error: validation.error, isEmailLink: true };
  }

  try {
    const result = await signInWithEmailLink(auth, email, currentUrl);
    const user = result.user;

    // Check URL search parameters first for persisted role intent (survives cross-browser/cross-device)
    const urlObj = new URL(currentUrl);
    const urlRole = urlObj.searchParams.get('role');
    const localRole = window.localStorage.getItem('pendingAuthRole');
    const resolvedRole = urlRole === 'company' || localRole === 'company' ? 'company' : 'candidate';

    // Clean up temporary storage
    window.localStorage.removeItem('emailForSignIn');
    window.localStorage.removeItem('pendingAuthRole');

    // Fetch or create profile using verified intent
    const userData = await resolveUserProfile(user, resolvedRole);

    return {
      success: true,
      user,
      userData,
      isNewUser: result._tokenResponse?.isNewUser || false,
    };
  } catch (error) {
    console.error('Firebase signInWithEmailLink error:', error);
    let friendlyMessage = 'Failed to verify sign-in link.';
    if (error.code === 'auth/invalid-action-code') {
      friendlyMessage = 'This sign-in link has expired or has already been used. Please request a new link.';
    } else if (error.code === 'auth/invalid-email') {
      friendlyMessage = 'The email address does not match the link provided. Please confirm the original email.';
    }
    return {
      success: false,
      error: friendlyMessage,
      code: error.code,
      isEmailLink: true,
    };
  }
};

/**
 * Authenticates with Google (Popup with seamless Redirect fallback)
 */
export const signInWithGoogleProvider = async (selectedRole = 'candidate') => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  provider.addScope('email');
  provider.addScope('profile');

  const sanitizedRole = selectedRole === 'company' || selectedRole === 'employer' ? 'company' : 'candidate';

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userData = await resolveUserProfile(user, sanitizedRole);

    return {
      success: true,
      user,
      userData,
      isNewUser: result._tokenResponse?.isNewUser || false,
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);

    // If popup was blocked or interrupted by browser, gracefully trigger redirect
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/cancelled-popup-request' ||
      error.code === 'auth/internal-error'
    ) {
      try {
        window.localStorage.setItem('pendingAuthRole', sanitizedRole);
        await signInWithRedirect(auth, provider);
        return { redirecting: true };
      } catch (redirectErr) {
        console.error('Google redirect fallback error:', redirectErr);
        return {
          success: false,
          error: 'Browser blocked sign-in popup. Please allow popups or try again.',
          code: redirectErr.code,
        };
      }
    }

    if (error.code === 'auth/popup-closed-by-user') {
      return { cancelled: true };
    }

    let friendlyMessage = 'Google authentication failed. Please try again.';
    if (error.code === 'auth/unauthorized-domain') {
      friendlyMessage = `Current domain (${window.location.hostname}) is not authorized in Firebase Console. Add it under Firebase Authentication > Settings > Authorized Domains.`;
    } else if (error.code === 'auth/operation-not-allowed') {
      friendlyMessage = 'Google Sign-In provider is disabled in Firebase Authentication console.';
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      friendlyMessage = 'An account already exists with this email using a different sign-in method.';
    } else if (error.code === 'auth/network-request-failed') {
      friendlyMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error.message) {
      friendlyMessage = error.message;
    }

    return { success: false, error: friendlyMessage, code: error.code };
  }
};

/**
 * Checks for Google redirect result upon page load
 */
export const checkGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const storedRole = window.localStorage.getItem('pendingAuthRole') || 'candidate';
      window.localStorage.removeItem('pendingAuthRole');
      const userData = await resolveUserProfile(result.user, storedRole);
      return {
        success: true,
        user: result.user,
        userData,
        isNewUser: result._tokenResponse?.isNewUser || false,
      };
    }
    return null;
  } catch (error) {
    console.error('Redirect result error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Standard password login fallback
 */
export const signInWithPasswordFallback = async (email, password) => {
  const validation = validateEmail(email);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, validation.email, password);
    const userData = await resolveUserProfile(credential.user);
    return { success: true, user: credential.user, userData };
  } catch (error) {
    let message = 'Invalid email or password.';
    if (error.code === 'auth/wrong-password') {
      message = 'Incorrect password. Try passwordless magic link instead.';
    } else if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email. Please create an account.';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many attempts. Please try again later or use Google Sign-In.';
    }
    const err = new Error(message);
    err.code = error.code;
    throw err;
  }
};

/**
 * Determine smart role-based destination for authenticated users
 */
export const getPostAuthRedirectUrl = (userData, user, explicitReturnUrl = null) => {
  const isSuperAdmin = isSuperAdminEmail(user?.email);

  // If a safe returnUrl was passed (e.g. from /jobs/:id/apply)
  if (
    explicitReturnUrl &&
    explicitReturnUrl.startsWith('/') &&
    !explicitReturnUrl.startsWith('/login') &&
    !explicitReturnUrl.startsWith('/signup') &&
    !explicitReturnUrl.startsWith('/register') &&
    !explicitReturnUrl.startsWith('/auth')
  ) {
    // If the user is super admin, always route to admin panel (never candidate panel)
    if (isSuperAdmin) {
      if (explicitReturnUrl.startsWith('/admin') && !explicitReturnUrl.startsWith('/admin/login')) {
        return explicitReturnUrl;
      }
      return '/admin';
    }
    return explicitReturnUrl;
  }

  // 1. Super Admin -> /admin
  if (isSuperAdmin) {
    return '/admin';
  }

  // 2. Company / Staffing Partner -> /hr
  if (userData?.role === 'company' || userData?.role === 'employer') {
    return '/hr';
  }

  // 3. Candidate -> /candidate/profile (as required: candidate login leads to profile)
  return '/candidate/profile';
};
