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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row relative overflow-hidden">
      {/* Background Ambient Glass Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.08] bg-cover bg-center mix-blend-screen z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass-surface-2 border-b border-white/10 relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm shadow-glow-sm">
            Z
          </div>
          <span className="font-bold text-white text-base font-display">Recruiter Console</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2.5 rounded-xl glass-surface-1 text-slate-300 border border-white/10"
        >
          {mobileSidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
        </button>
      </div>

      {/* Glass Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 glass-sidebar border-r border-white/10 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 relative z-30",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-white/10">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 p-[1px] shadow-glow-sm group-hover:shadow-glow-md transition-all">
                <div className="w-full h-full bg-slate-950/90 rounded-[15px] flex items-center justify-center font-display font-black text-indigo-400">
                  Z
                </div>
              </div>
              <div>
                <span className="font-display font-bold text-base text-white tracking-tight block">
                  ZenSolve SaaS
                </span>
                <span className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider block">
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
                    ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-300 hover:text-white hover:glass-surface-1"
                )}
              >
                <span className="text-base text-indigo-400">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Info & Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="p-3.5 glass-surface-1 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <FaShieldAlt className="text-emerald-400 text-xs" />
              <p className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">Verified Recruiter</p>
            </div>
            <p className="text-xs font-semibold text-white truncate">{user?.email || 'hr@company.com'}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white glass-surface-1 hover:border-indigo-500/40 border border-white/10 transition"
            >
              <FaExternalLinkAlt size={10} />
              <span>Live Portal</span>
            </Link>
            <button
              onClick={handleLogout}
              className="py-2 px-3.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 transition flex items-center gap-1.5"
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
        <div className="px-6 sm:px-10 py-6 border-b border-white/10 glass-surface-1 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-slate-300 mt-1">{subtitle}</p>}
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
