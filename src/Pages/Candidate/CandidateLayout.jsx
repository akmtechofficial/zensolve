import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/useAuth';
import {
  FaTachometerAlt,
  FaUser,
  FaFileAlt,
  FaBriefcase,
  FaBookmark,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaSearch,
  FaBell,
  FaCheckCircle,
} from 'react-icons/fa';
import { cn } from '../../utils/cn';

const NAV_ITEMS = [
  { label: 'Overview', path: '/candidate', icon: FaTachometerAlt, exact: true },
  { label: 'My Profile', path: '/candidate/profile', icon: FaUser },
  { label: 'Resume / CV', path: '/candidate/resume', icon: FaFileAlt },
  { label: 'Applications', path: '/candidate/applications', icon: FaBriefcase },
  { label: 'Saved Jobs', path: '/candidate/saved-jobs', icon: FaBookmark },
  { label: 'Settings', path: '/candidate/settings', icon: FaCog },
];

const CandidateLayout = ({ children, title = 'Candidate Dashboard', subtitle = '' }) => {
  const { user, userData, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const displayName = userData?.displayName || user?.displayName || 'Candidate';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row relative">
      {/* Background Ambient Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/95 border-r border-slate-200/90 shadow-sm z-30 sticky top-0 h-screen">
        {/* Brand */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-white p-0.5 border border-slate-200 shadow-sm group-hover:border-indigo-400 transition overflow-hidden flex items-center justify-center">
              <img src="/zen.jpeg" alt="ZenSolve Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-slate-900 block leading-tight">
                ZenSolve
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 block uppercase tracking-wider">
                Candidate Portal
              </span>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
            {initial}
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-bold text-slate-900 block truncate">
              {displayName}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {user?.email}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition',
                  active
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                <Icon className={cn('text-sm', active ? 'text-white' : 'text-slate-400')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            to="/jobs"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
          >
            <FaSearch className="text-xs text-slate-400" />
            <span>Browse Job Openings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left"
          >
            <FaSignOutAlt className="text-xs" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 border-b border-slate-200/90 px-4 py-3 flex items-center justify-between shadow-xs">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-slate-200 overflow-hidden flex items-center justify-center">
            <img src="/zen.jpeg" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-base text-slate-900">
            ZenSolve Candidate
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bottom-0 bg-white z-50 p-6 overflow-y-auto space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {initial}
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">{displayName}</span>
              <span className="text-xs text-slate-500 block">{user?.email}</span>
            </div>
          </div>

          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition',
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <Icon className="text-base" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2">
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <FaSearch />
              <span>Browse Job Openings</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
            >
              <FaSignOutAlt />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 py-8 px-4 sm:px-8 lg:px-10 relative z-10 overflow-y-auto">
        {/* Header Breadcrumb */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            {title}
          </h1>
          {subtitle && <p className="text-xs sm:text-sm text-slate-600 mt-1">{subtitle}</p>}
        </div>

        {children}
      </main>
    </div>
  );
};

export default CandidateLayout;
