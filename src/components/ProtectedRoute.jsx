import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { FaSpinner } from 'react-icons/fa';

const ProtectedRoute = ({ children, requireEmployer = false }) => {
  const { user, loading, isEmployer } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <FaSpinner className="animate-spin text-indigo-500 text-3xl" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireEmployer && !isEmployer) {
    // If route requires employer and user is candidate, redirect to home or dashboard notice
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
