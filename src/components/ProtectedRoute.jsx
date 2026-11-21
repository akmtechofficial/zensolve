import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { FaSpinner } from 'react-icons/fa';
import ResendApprovalReminder from './ResendApprovalReminder';

const ProtectedRoute = ({ children, requiredRole = null, requireEmployer = false, requireApproved = false }) => {
  const { user, loading, role, isAdmin, isCompany, isEmployer, isCandidate, isSuspended, isApprovedCompany, profileError, isPendingProfile, refreshUser } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show spinner for max 6 seconds (useAuth safety timer will force resolve).
    // For admin routes: if we are still loading after the safety window, show
    // a targeted message so the admin knows what is happening.
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
          {requiredRole === 'admin' && (
            <p className="text-xs text-slate-400 mt-1">Verifying admin session…</p>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Profile pending check for standard users (admin bypasses pending check)
  if (!isAdmin && isPendingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-500">
        <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
      </div>
    );
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

  // Admin route protection: Strictly requires authorized admin privileges
  if (requiredRole === 'admin') {
    if (!isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#07090E] px-4 text-slate-100 font-sans">
          <div className="max-w-md w-full bg-slate-900/90 rounded-3xl p-8 border border-rose-500/30 shadow-2xl text-center backdrop-blur-xl">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl font-bold">
              🚫
            </div>
            <h2 className="text-2xl font-bold font-display text-white mb-2">Access Denied</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Super-Admin console access is restricted strictly to authorized system administrators. Your account (<span className="text-indigo-400 font-mono font-semibold">{user?.email}</span>) is not authorized.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <a
                href="/admin/login"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Sign In as Admin
              </a>
              <a
                href="/"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-white/10 transition"
              >
                Return to Homepage
              </a>
            </div>
          </div>
        </div>
      );
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-amber-200 shadow-xl text-center">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-sm">
              ⏳
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Company Pending Verification</h2>
            <p className="text-sm text-slate-600 mb-5">
              Your company account is under review by ZenSolve Admins. You can prepare and view your dashboard, but job posting and candidate interactions remain locked until verification is granted.
            </p>
            
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-left">
              <ResendApprovalReminder compact={false} />
            </div>

            <div className="flex justify-center gap-3">
              <a
                href="/hr/profile"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
              >
                Complete Profile
              </a>
              <a
                href="/hr"
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition"
              >
                Back to Dashboard
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
