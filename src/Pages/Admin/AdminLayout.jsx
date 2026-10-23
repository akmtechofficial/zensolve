import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../components/useAuth';
import {
  FaShieldAlt,
  FaBuilding,
  FaUsers,
  FaBriefcase,
  FaFileAlt,
  FaExclamationTriangle,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartLine,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaBalanceScale,
} from 'react-icons/fa';

const navItems = [
  { path: '/admin', label: 'Platform Overview', icon: FaChartLine, exact: true },
  { path: '/admin/companies', label: 'Company Approvals', icon: FaBuilding },
  { path: '/admin/users', label: 'User Directory', icon: FaUsers },
  { path: '/admin/jobs', label: 'Job Moderation', icon: FaBriefcase },
  { path: '/admin/applications', label: 'All Applications', icon: FaFileAlt },
  { path: '/admin/legal', label: 'Legal & Trust', icon: FaBalanceScale },
  { path: '/admin/reports', label: 'Flagged & Reports', icon: FaExclamationTriangle },
  { path: '/admin/settings', label: 'Platform Settings', icon: FaCog },
];

const AdminLayout = ({ children, title, subtitle }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userData, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Super-Admin Notification Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white text-xs py-2 px-4 border-b border-indigo-950 flex items-center justify-between shadow-xs">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">ZenSolve Platform Administration Console</span>
            <span className="hidden sm:inline text-indigo-300/60 font-mono text-[11px]">• Role: Super-Admin</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-300 font-medium hidden md:inline">{user?.email}</span>
            <Link to="/" className="text-indigo-200 hover:text-white flex items-center gap-1 font-semibold transition-colors">
              <span>Public Portal</span>
              <FaExternalLinkAlt className="text-[10px]" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex w-72 flex-col glass-surface-3 glass-specular border-r border-slate-200/90 z-20">
          {/* Admin Identity Card */}
          <div className="p-6 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xl shadow-md border border-indigo-500/30">
                <FaShieldAlt className="text-lg" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900 font-display truncate">ZenSolve Admin</h2>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                    Super
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@zensolve.com'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Administrative Control
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`text-sm ${isActive ? 'text-white' : 'text-slate-600'}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Admin Footer Controls */}
          <div className="p-4 border-t border-slate-200/80 space-y-2">
            <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <FaCheckCircle className="text-emerald-500 shrink-0" />
              <span className="font-medium text-[11px]">Audit Engine Online</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
            >
              <FaSignOutAlt />
              <span>Sign Out Admin</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header Mobile / Sub-header */}
          <header className="glass-surface-2 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 font-display">{title || 'Administration'}</h1>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 border border-indigo-100 text-indigo-700">
                Authorized Super-Admin
              </span>
            </div>
          </header>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden p-4 bg-white/95 backdrop-blur-md border-b border-slate-200 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact 
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="text-sm" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-rose-600"
              >
                <FaSignOutAlt />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
