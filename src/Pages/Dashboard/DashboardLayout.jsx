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
  FaShieldAlt,
  FaExclamationTriangle,
  FaCog,
} from 'react-icons/fa';
import { cn } from '../../utils/cn';

const DashboardLayout = ({ children, title, subtitle, actions }) => {
  const { user, userData, isApprovedCompany, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'HR Overview', path: '/hr', aliases: ['/dashboard'], icon: <FaTachometerAlt /> },
    { name: 'Job Openings', path: '/hr/jobs', aliases: ['/dashboard/jobs'], icon: <FaBriefcase /> },
    { name: 'Post New Job', path: '/hr/jobs/new', aliases: ['/dashboard/post-job'], icon: <FaPlusCircle /> },
    { name: 'Candidate Pipeline', path: '/hr/applicants', aliases: ['/dashboard/applicants'], icon: <FaUsers /> },
    { name: 'Company Profile', path: '/hr/profile', aliases: ['/dashboard/company-profile'], icon: <FaBuilding /> },
    { name: 'HR Settings', path: '/hr/settings', aliases: ['/dashboard/settings'], icon: <FaCog /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (item) => {
    if (location.pathname === item.path) return true;
    if (item.aliases?.includes(location.pathname)) return true;
    if (item.path !== '/hr' && item.path !== '/dashboard') {
      return location.pathname.startsWith(item.path);
    }
    return false;
  };

  const companyName = userData?.companyName || 'Your Organization';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row relative overflow-hidden">
      {/* Background Ambient Glass Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/95 border-b border-slate-200 relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden">
            <img src="/zen.jpeg" alt="ZenSolve Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-slate-900 text-base font-display">Recruiter Console</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 shadow-xs"
        >
          {mobileSidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
        </button>
      </div>

      {/* Glass Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white/95 border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 relative z-30 shadow-sm",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-200">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-white p-0.5 border border-slate-200 shadow-sm group-hover:border-indigo-400 transition-all overflow-hidden flex items-center justify-center">
                <img
                  src="/zen.jpeg"
                  alt="ZenSolve Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-display font-bold text-base text-slate-900 tracking-tight block">
                  ZenSolve ATS
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider block">
                  HR Enterprise Console
                </span>
              </div>
            </Link>
          </div>

          {/* Organization badge */}
          <div className="p-3 mx-4 my-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0">
              {companyName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {companyName}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {user?.email}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
                    active
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <span className={cn("text-sm", active ? "text-white" : "text-slate-400")}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 space-y-2">
          <Link
            to="/jobs"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
          >
            <FaExternalLinkAlt size={12} className="text-slate-400" />
            <span>Public Job Portal</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
          >
            <FaSignOutAlt size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Pending Approval Warning Banner (If Company not verified) */}
        {!isApprovedCompany && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 text-xs text-amber-900 flex items-start gap-3 relative z-20">
            <FaExclamationTriangle className="text-amber-600 text-base flex-shrink-0 mt-0.5" />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <strong className="font-bold">Company Profile Pending Administrative Approval:</strong>{' '}
                <span>Your organization registration is currently under review by ZenSolve Super-Admins. You can set up your profile, but publishing active jobs to public candidates is disabled until approved.</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-[10px] font-bold text-amber-800 uppercase tracking-wider whitespace-nowrap">
                Review in Progress
              </span>
            </div>
          </div>
        )}

        {/* Top bar with Breadcrumbs & Action buttons */}
        <header className="p-6 md:p-8 border-b border-slate-200 bg-white/70 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>

        {/* Page Content Body */}
        <main className="p-6 md:p-8 flex-1 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
