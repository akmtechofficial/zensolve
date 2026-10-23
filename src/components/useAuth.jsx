import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export const ADMIN_EMAILS = [
  'admin@zensolve.com',
  'admin@zensolve.in',
  'superadmin@zensolve.com',
  'akmtechofficial@gmail.com',
];

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
    const isSuperAdminEmail = Boolean(email && ADMIN_EMAILS.includes(email.trim().toLowerCase()));

    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (isSuperAdminEmail) {
          return { ...data, role: 'admin' };
        }
        return data;
      } else {
        // Document does not exist yet (e.g. freshly created auth before profile doc written)
        // Check if there is an in-flight role registration intent stored
        const pendingRole = window.localStorage.getItem('pendingAuthRole');
        const defaultRole = pendingRole === 'company' || pendingRole === 'employer' ? 'company' : null;

        return {
          uid,
          email,
          role: isSuperAdminEmail ? 'admin' : defaultRole,
          isPendingProfile: true,
          createdAt: new Date(),
        };
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      // Safe fallback: never default an unverified error to candidate/admin
      return {
        uid,
        email,
        role: isSuperAdminEmail ? 'admin' : null,
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const data = await fetchUserData(currentUser.uid, currentUser.email);
        setUserData(data);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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

  const isSuperAdminEmail = Boolean(user?.email && ADMIN_EMAILS.includes(user.email.trim().toLowerCase()));
  const isAdmin = userData?.role === 'admin' || isSuperAdminEmail;

  const isCompany =
    !isAdmin && (userData?.role === 'company' || userData?.role === 'employer');

  const isEmployer = isCompany; // Alias for backward compatibility
  const isCandidate = !isAdmin && !isCompany && (userData?.role === 'candidate' || !userData?.role);
  const role = isAdmin ? 'admin' : isCompany ? 'company' : isCandidate ? 'candidate' : (userData?.role || 'candidate');

  const isSuspended = Boolean(
    userData?.suspended === true || userData?.status === 'suspended'
  );

  const profileError = Boolean(userData?.profileError);
  const isPendingProfile = Boolean(userData?.isPendingProfile);

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
