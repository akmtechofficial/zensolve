import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const ADMIN_EMAILS = [
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
  refreshUser: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (uid, email) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        // Check if user is a hardcoded/designated admin
        if (ADMIN_EMAILS.includes(email?.toLowerCase())) {
          return { ...data, role: 'admin' };
        }
        return data;
      } else {
        const isSuperAdmin = ADMIN_EMAILS.includes(email?.toLowerCase());
        return {
          role: isSuperAdmin ? 'admin' : 'candidate',
          email,
          createdAt: new Date(),
        };
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      const isSuperAdmin = ADMIN_EMAILS.includes(email?.toLowerCase());
      return { role: isSuperAdmin ? 'admin' : 'candidate' };
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

  const isAdmin =
    userData?.role === 'admin' ||
    (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));

  const isCompany =
    !isAdmin && (userData?.role === 'company' || userData?.role === 'employer');

  const isEmployer = isCompany; // Alias for backward compatibility

  const isCandidate = !isAdmin && !isCompany;

  const role = isAdmin ? 'admin' : isCompany ? 'company' : 'candidate';

  // For companies: approved unless explicitly set to false or 'pending'
  const isApprovedCompany = isCompany
    ? userData?.approved === true || userData?.status === 'approved'
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
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
