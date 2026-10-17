import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSignOutAlt,
  FaBookmark,
  FaBriefcase,
  FaBuilding,
  FaPlus,
  FaChevronDown,
} from 'react-icons/fa';
import { useAuth } from './useAuth';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../utils/cn';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, userData, isEmployer, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Jobs', path: '/jobs' },
    { name: 'Companies', path: '/companies' },
    { name: 'Contact', path: '/contactus' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const savedCount = userData?.savedJobs?.length || 0;

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2 transition-all pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        <div className="glass-nav glass-specular rounded-2xl sm:rounded-full px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between border border-white/10 shadow-2xl shadow-indigo-950/30">
          
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 p-[1px] shadow-glow-sm group-hover:shadow-glow-md transition-all">
              <div className="w-full h-full bg-slate-950/90 rounded-[11px] flex items-center justify-center">
                <span className="font-display font-black text-xl text-gradient-accent">Z</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                ZenSolve
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Glass HR
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Careers & Talent Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 glass-surface-1 px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200",
                  isActive(link.path)
                    ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                )}
              >
                {link.name}
              </Link>
            ))}

            {/* Direct Dashboard Link */}
            <Link
              to="/dashboard"
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5",
                isActive('/dashboard')
                  ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              )}
            >
              <FaBriefcase className="text-xs text-indigo-400" />
              <span>HR SaaS</span>
            </Link>
          </nav>

          {/* Desktop Actions & Auth */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Saved Jobs Link with live badge */}
            <Link
              to="/saved-jobs"
              className="relative p-2.5 rounded-full glass-surface-1 text-slate-300 hover:text-white border border-white/10 hover:border-indigo-500/40 transition"
              title="Saved Jobs"
            >
              <FaBookmark size={15} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-950">
                  {savedCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs uppercase">
                    {user.email ? user.email.charAt(0) : 'U'}
                  </div>
                  <span className="text-xs text-slate-200 max-w-[120px] truncate font-medium">
                    {user.email}
                  </span>
                  <FaChevronDown size={10} className="text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                      <Badge variant="primary" size="sm" className="mt-1.5 capitalize">
                        {userData?.role || (isEmployer ? 'Employer' : 'Candidate')}
                      </Badge>
                    </div>

                    <Link
                      to="/saved-jobs"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaBookmark className="text-indigo-400" />
                      <span>Saved Jobs</span>
                      {savedCount > 0 && (
                        <span className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-400">
                          {savedCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaBriefcase className="text-indigo-400" />
                      <span>HR Dashboard</span>
                    </Link>

                    <Link
                      to="/dashboard/post-job"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaPlus className="text-emerald-400" />
                      <span>Post New Job</span>
                    </Link>

                    <div className="border-t border-slate-800/80 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition text-left"
                      >
                        <FaSignOutAlt />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </Button>
                <Button
                  variant="glow"
                  size="sm"
                  icon={<FaPlus className="text-xs text-indigo-400" />}
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
              aria-label="Toggle menu"
            >
              {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Glass Sheet */}
      {isOpen && (
        <div className="md:hidden mt-2 glass-surface-3 glass-specular rounded-2xl border border-white/10 px-5 py-5 space-y-4 shadow-2xl">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "block px-4 py-3 rounded-xl text-base font-medium transition",
                  isActive(link.path)
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                )}
              >
                {link.name}
              </Link>
            ))}

            <Link
              to="/dashboard"
              className={cn(
                "block px-4 py-3 rounded-xl text-base font-medium transition flex items-center justify-between",
                isActive('/dashboard')
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              )}
            >
              <span className="flex items-center gap-2">
                <FaBriefcase className="text-indigo-400" />
                HR SaaS Dashboard
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Manage
              </span>
            </Link>

            <Link
              to="/saved-jobs"
              className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition"
            >
              <span className="flex items-center gap-2">
                <FaBookmark className="text-indigo-400" />
                Saved Jobs
              </span>
              {savedCount > 0 && (
                <span className="text-xs bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                  {savedCount}
                </span>
              )}
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-800">
            {user ? (
              <div className="space-y-3">
                <div className="px-4 py-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                </div>
                <Button
                  variant="danger"
                  size="md"
                  className="w-full"
                  icon={<FaSignOutAlt />}
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;