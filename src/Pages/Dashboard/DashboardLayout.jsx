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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
            Z
          </div>
          <span className="font-bold text-white text-base">HR Portal</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300"
        >
          {mobileSidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-slate-800/90 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 backdrop-blur-xl",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-850">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 p-[1px]">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center font-display font-black text-indigo-400">
                  Z
                </div>
              </div>
              <div>
                <span className="font-display font-bold text-base text-white tracking-tight block">
                  ZenSolve SaaS
                </span>
                <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider block">
                  Recruiter Console
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
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150",
                  isActive(item.path)
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-850"
                )}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Info & Footer Actions */}
        <div className="p-4 border-t border-slate-850 space-y-3">
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
            <p className="text-[11px] text-slate-400 truncate">Logged in as Recruiter</p>
            <p className="text-xs font-semibold text-white truncate">{user?.email || 'hr@company.com'}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition"
            >
              <FaExternalLinkAlt size={10} />
              <span>View Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="py-2 px-3 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 transition flex items-center gap-1.5"
              title="Sign Out"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Bar with Title & Actions */}
        <div className="px-6 sm:px-10 py-6 border-b border-slate-850 bg-slate-950/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
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
