import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export const SUPER_ADMIN_EMAIL = 'admin@zensolve.in';
export const ADMIN_EMAILS = ['admin@zensolve.in'];

const AuthContext = createContext({
  user: null,
  userData: null,
  loading: true,
  role: 'candidate',
  isCandidate: true,
  isCompany: false,
  isEmployer: false,
  isAdmin: false,
  isApprovedCompany: true,
  isSuspended: false,
  refreshUser: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (uid, email) => {
    if (!uid) return null;
    const isSuperAdminEmail = Boolean(email && email.trim().toLowerCase() === SUPER_ADMIN_EMAIL);

    try {
      // 4-second timeout protection so Firestore connectivity or offline latency never freezes the UI
      const fetchPromise = getDoc(doc(db, 'users', uid));
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 4000)
      );

      const userDoc = await Promise.race([fetchPromise, timeoutPromise]);

      if (userDoc && userDoc.exists()) {
        const data = userDoc.data();
        if (isSuperAdminEmail) {
          return { ...data, role: 'admin', isPendingProfile: false };
        }
        // If an unauthorized account has role 'admin' in Firestore, override to candidate
        if (data.role === 'admin') {
          return { ...data, role: 'candidate', isPendingProfile: false };
        }
        return data;
      } else {
        // Document does not exist yet (e.g. freshly created auth before profile doc written)
        if (isSuperAdminEmail) {
          // Immediately bootstrap admin profile in Firestore
          setDoc(
            doc(db, 'users', uid),
            {
              uid,
              email,
              role: 'admin',
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
            },
            { merge: true }
          ).catch((e) => console.warn('Admin profile bootstrap notice:', e));

          return {
            uid,
            email,
            role: 'admin',
            isPendingProfile: false,
            createdAt: new Date(),
          };
        }

        // Check if there is an in-flight role registration intent stored
        const pendingRole = window.localStorage.getItem('pendingAuthRole');
        const defaultRole = pendingRole === 'company' || pendingRole === 'employer' ? 'company' : null;

        return {
          uid,
          email,
          role: defaultRole,
          isPendingProfile: true,
          createdAt: new Date(),
        };
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      // Fail-safe for administrators: never block admin console due to network or read failure
      if (isSuperAdminEmail) {
        return {
          uid,
          email,
          role: 'admin',
          isPendingProfile: false,
        };
      }
      return {
        uid,
        email,
        role: null,
        profileError: true,
        errorMessage: err.message,
      };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      const freshData = await fetchUserData(auth.currentUser.uid, auth.currentUser.email);
      setUserData(freshData);
    }
  }, [fetchUserData]);

  useEffect(() => {
    // Hard safety net: if Firebase Auth SDK does not fire within 6 seconds
    // (network lag, cold start, service-worker cache), force loading off so
    // the UI does not freeze on a white spinner indefinitely.
    const safetyTimer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn('[useAuth] Auth state did not resolve within 6s — forcing loading:false');
          return false;
        }
        return prev;
      });
    }, 6000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(safetyTimer);
      setUser(currentUser);
      if (currentUser) {
        const data = await fetchUserData(currentUser.uid, currentUser.email);
        setUserData(data);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, [fetchUserData]);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Strict Super-Admin: ONLY admin@zensolve.in is granted admin privileges
  const isSuperAdminEmail = Boolean(user?.email && user.email.trim().toLowerCase() === SUPER_ADMIN_EMAIL);
  const isAdmin = isSuperAdminEmail;

  const isCompany =
    !isAdmin && (userData?.role === 'company' || userData?.role === 'employer');

  const isEmployer = isCompany; // Alias for backward compatibility
  const isCandidate = !isAdmin && !isCompany && (userData?.role === 'candidate' || !userData?.role);
  const role = isAdmin ? 'admin' : isCompany ? 'company' : isCandidate ? 'candidate' : (userData?.role || 'candidate');

  const isSuspended = Boolean(
    userData?.suspended === true || userData?.status === 'suspended'
  );

  const profileError = Boolean(userData?.profileError);
  const isPendingProfile = !isAdmin && Boolean(userData?.isPendingProfile);

  // For companies: approved only if explicitly approved or status === 'approved'
  const isApprovedCompany = isCompany
    ? (userData?.approved === true || userData?.status === 'approved') && !isSuspended
    : true;

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        role,
        isCandidate,
        isCompany,
        isEmployer,
        isAdmin,
        isApprovedCompany,
        isSuspended,
        profileError,
        isPendingProfile,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
