import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { FaSpinner } from 'react-icons/fa';

const ProtectedRoute = ({ children, requiredRole = null, requireEmployer = false }) => {
  const { user, loading, role, isAdmin, isCompany, isEmployer, isCandidate } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-500">
        <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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
