import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaUser,
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
  const dropdownRef = useRef(null);
  const { user, userData, isEmployer, isCompany, isCandidate, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu and dropdown on route change
  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Reliable click-outside listener for profile dropdown
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [dropdownOpen]);

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
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2 transition-all">
      <div className="max-w-7xl mx-auto">
        <div className="glass-nav rounded-2xl sm:rounded-full px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between border border-white/80 shadow-lg shadow-slate-900/5 relative overflow-visible">
          
          {/* Logo & Brand Identity featuring zen.jpeg */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white border border-slate-200/80 p-1 shadow-sm group-hover:shadow-md transition-all flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src="/zen.jpeg"
                alt="ZenSolve Logo"
                className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-slate-900 tracking-tight">
                ZenSolve
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                Careers & Talent Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 glass-surface-1 px-3 py-1.5 rounded-full border border-slate-200/80 shadow-sm">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200",
                  isActive(link.path)
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70"
                )}
              >
                {link.name}
              </Link>
            ))}

            {/* Direct Portal Link */}
            {isAdmin ? (
              <Link
                to="/admin"
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5",
                  isActive('/admin')
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-indigo-700 hover:bg-indigo-50"
                )}
              >
                <span>Super-Admin</span>
              </Link>
            ) : (isCompany || isEmployer) ? (
              <Link
                to="/hr"
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5",
                  isActive('/hr') || isActive('/dashboard')
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70"
                )}
              >
                <FaBriefcase className="text-xs text-indigo-600" />
                <span>HR Recruiter</span>
              </Link>
            ) : user ? (
              <Link
                to="/candidate"
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5",
                  isActive('/candidate')
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70"
                )}
              >
                <span>Candidate Portal</span>
              </Link>
            ) : (
              <Link
                to="/hr"
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5",
                  isActive('/dashboard') || isActive('/hr')
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70"
                )}
              >
                <FaBriefcase className="text-xs text-indigo-600" />
                <span>HR SaaS</span>
              </Link>
            )}
          </nav>

          {/* Desktop Actions & Auth */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Saved Jobs Link with live badge */}
            <Link
              to="/saved-jobs"
              className="relative p-2.5 rounded-full glass-surface-1 text-slate-700 hover:text-indigo-600 border border-slate-200/80 hover:border-indigo-300 transition shadow-sm"
              title="Saved Jobs"
            >
              <FaBookmark size={15} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {savedCount}
                </span>
              )}
            </Link>

            {user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition cursor-pointer select-none"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs uppercase">
                    {user.email ? user.email.charAt(0) : 'U'}
                  </div>
                  <span className="text-xs text-slate-800 max-w-[120px] truncate font-semibold">
                    {user.email}
                  </span>
                  <FaChevronDown
                    size={10}
                    className={`text-slate-500 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-200/80 mb-1">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                      <Badge variant="primary" size="sm" className="mt-1.5 capitalize">
                        {isAdmin ? 'Super-Admin' : (isCompany || isEmployer) ? 'Employer' : 'Candidate'}
                      </Badge>
                    </div>

                    {/* Role-Specific Portal Links */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaBriefcase className="text-indigo-600" />
                        <span>Super-Admin Console</span>
                      </Link>
                    )}

                    {(isCompany || isEmployer) && (
                      <>
                        <Link
                          to="/hr"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 transition"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FaBriefcase className="text-indigo-600" />
                          <span>HR Recruiter Portal</span>
                        </Link>
                        <Link
                          to="/hr/jobs/new"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-600 hover:bg-slate-100/70 transition"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FaPlus className="text-emerald-600" />
                          <span>Post Job Opening</span>
                        </Link>
                      </>
                    )}

                    {(!isCompany && !isEmployer) && (
                      <>
                        <Link
                          to="/candidate"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 transition"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FaUser className="text-indigo-600" />
                          <span>Candidate Dashboard</span>
                        </Link>
                        <Link
                          to="/candidate/applications"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 transition"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FaBriefcase className="text-indigo-600" />
                          <span>My Applications</span>
                        </Link>
                      </>
                    )}

                    <Link
                      to="/saved-jobs"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaBookmark className="text-indigo-600" />
                      <span>Saved Jobs</span>
                      {savedCount > 0 && (
                        <span className="ml-auto text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-bold">
                          {savedCount}
                        </span>
                      )}
                    </Link>

                    <div className="border-t border-slate-200/80 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition text-left cursor-pointer"
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
                  className="text-slate-700 hover:text-slate-900 rounded-xl"
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<FaPlus className="text-xs" />}
                  onClick={() => navigate('/signup')}
                  className="rounded-xl shadow-xs"
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
              className="p-2.5 rounded-xl bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-sm"
              aria-label="Toggle menu"
            >
              {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Glass Sheet */}
      {isOpen && (
        <div className="md:hidden mt-2 glass-surface-3 rounded-2xl border border-slate-200/90 px-5 py-5 space-y-4 shadow-xl">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "block px-4 py-3 rounded-xl text-base font-semibold transition",
                  isActive(link.path)
                    ? "bg-indigo-600 text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {link.name}
              </Link>
            ))}

            <Link
              to="/dashboard"
              className={cn(
                "block px-4 py-3 rounded-xl text-base font-semibold transition flex items-center justify-between",
                isActive('/dashboard')
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <span className="flex items-center gap-2">
                <FaBriefcase className="text-indigo-600" />
                HR SaaS Dashboard
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold">
                Manage
              </span>
            </Link>

            <Link
              to="/saved-jobs"
              className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <span className="flex items-center gap-2">
                <FaBookmark className="text-indigo-600" />
                Saved Jobs
              </span>
              {savedCount > 0 && (
                <span className="text-xs bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                  {savedCount}
                </span>
              )}
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-200">
            {user ? (
              <div className="space-y-3">
                <div className="px-4 py-2 bg-slate-100/70 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                </div>
                <Button
                  variant="danger"
                  size="md"
                  className="w-full rounded-xl"
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
                  className="rounded-xl border border-slate-200 bg-white text-slate-800"
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/register')}
                  className="rounded-xl"
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