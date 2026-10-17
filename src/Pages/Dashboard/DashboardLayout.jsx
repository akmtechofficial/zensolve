import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/useAuth';
import {
  FaTachometerAlt,
  FaBriefcase,
  FaUsers,
  FaPlusCircle,
  FaBuilding,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaExternalLinkAlt,
  FaArrowLeft,
  FaShieldAlt,
} from 'react-icons/fa';
import { cn } from '../../utils/cn';

const DashboardLayout = ({ children, title, subtitle, actions }) => {
  const { user, userData, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: <FaTachometerAlt /> },
    { name: 'Job Listings', path: '/dashboard/jobs', icon: <FaBriefcase /> },
    { name: 'Applicants', path: '/dashboard/applicants', icon: <FaUsers /> },
    { name: 'Post a Job', path: '/dashboard/post-job', icon: <FaPlusCircle /> },
    { name: 'Company Profile', path: '/dashboard/company-profile', icon: <FaBuilding /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row relative overflow-hidden">
      {/* Background Ambient Glass Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] bg-cover bg-center mix-blend-multiply z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass-surface-2 border-b border-slate-200 relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden">
            <img src="/zen.jpeg" alt="ZenSolve Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-slate-900 text-base font-display">Recruiter Console</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2.5 rounded-xl glass-surface-1 text-slate-700 border border-slate-200 shadow-xs"
        >
          {mobileSidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
        </button>
      </div>

      {/* Glass Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 glass-sidebar border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 relative z-30 shadow-sm",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-200">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-white p-0.5 border border-slate-200 shadow-sm group-hover:border-indigo-400 group-hover:shadow-glow-sm transition-all overflow-hidden flex items-center justify-center">
                <img
                  src="/zen.jpeg"
                  alt="ZenSolve Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-display font-bold text-base text-slate-900 tracking-tight block">
                  ZenSolve SaaS
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider block">
                  Glass Recruiter Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide transition duration-200",
                  isActive(item.path)
                    ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <span className="text-base text-indigo-600">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Info & Footer Actions */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="p-3.5 glass-surface-1 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <FaShieldAlt className="text-emerald-600 text-xs" />
              <p className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider">Verified Recruiter</p>
            </div>
            <p className="text-xs font-semibold text-slate-900 truncate">{user?.email || 'hr@company.com'}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 glass-surface-1 hover:border-indigo-400 border border-slate-200 transition shadow-xs"
            >
              <FaExternalLinkAlt size={10} />
              <span>Live Portal</span>
            </Link>
            <button
              onClick={handleLogout}
              className="py-2 px-3.5 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1.5 shadow-xs"
              title="Sign Out"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        {/* Top Bar with Title & Actions */}
        <div className="px-6 sm:px-10 py-6 border-b border-slate-200 glass-surface-1 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-10 flex-1">
          {children}
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;
