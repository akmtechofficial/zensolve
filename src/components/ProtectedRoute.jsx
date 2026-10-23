import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { FaSpinner } from 'react-icons/fa';

const ProtectedRoute = ({ children, requiredRole = null, requireEmployer = false, requireApproved = false }) => {
  const { user, loading, role, isAdmin, isCompany, isEmployer, isCandidate, isSuspended, isApprovedCompany, profileError, isPendingProfile, refreshUser } = useAuth();
  const location = useLocation();

  if (loading || isPendingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-500">
        <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Profile resolution failure check (e.g., Firestore permission or network error)
  if (profileError && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Profile Resolution Error</h2>
          <p className="text-sm text-slate-600 mb-6">
            We were unable to securely retrieve your account profile. Please retry or contact support if the problem persists.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => refreshUser()}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
            >
              Retry
            </button>
            <a
              href="/"
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
            >
              Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Account suspended check
  if (isSuspended && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-rose-100 shadow-xl text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Account Suspended</h2>
          <p className="text-sm text-slate-600 mb-6">
            Your account has been suspended by a platform administrator. Please contact support@zensolve.com for resolution or appeal.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  // Admin route protection
  if (requiredRole === 'admin') {
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  // Company / HR route protection
  if (requiredRole === 'company' || requireEmployer) {
    if (!isCompany && !isEmployer && !isAdmin) {
      // Candidate tried accessing HR panel
      return <Navigate to="/candidate" replace />;
    }

    if (requireApproved && !isApprovedCompany && !isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-amber-100 shadow-xl text-center">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ⏳
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Pending Approval</h2>
            <p className="text-sm text-slate-600 mb-6">
              Your company account is currently pending verification by our moderation team. You can edit your company profile, but job postings will remain disabled until approval.
            </p>
            <div className="flex justify-center gap-3">
              <a
                href="/hr/profile"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
              >
                Complete Profile
              </a>
              <a
                href="/hr"
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  // Candidate route protection
  if (requiredRole === 'candidate') {
    if (isCompany && !isAdmin) {
      // Company tried accessing Candidate dashboard
      return <Navigate to="/hr" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
