import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaBookmark,
  FaBriefcase,
  FaBuilding,
  FaChevronDown,
  FaPlus,
} from 'react-icons/fa';
import { useAuth } from './useAuth';
import { cn } from '../utils/cn';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, userData, isEmployer, isCompany, isCandidate, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

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
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                <img
                  src="/zen.jpeg"
                  alt="ZenSolve"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-display font-bold text-lg text-slate-900 tracking-tight">
                ZenSolve
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/jobs"
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                  isActive('/jobs')
                    ? "text-indigo-600 bg-indigo-50/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                Find Jobs
              </Link>

              <Link
                to="/companies"
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                  isActive('/companies')
                    ? "text-indigo-600 bg-indigo-50/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                Companies
              </Link>

              <Link
                to="/hr"
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5",
                  isActive('/hr') || isActive('/dashboard')
                    ? "text-indigo-600 bg-indigo-50/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <FaBuilding className="text-xs text-slate-400" />
                <span>HR SaaS</span>
              </Link>

              <Link
                to="/about"
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                  isActive('/about')
                    ? "text-indigo-600 bg-indigo-50/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                About Us
              </Link>

              <Link
                to="/contactus"
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                  isActive('/contactus')
                    ? "text-indigo-600 bg-indigo-50/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Right: Actions, Bookmarks & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Saved Jobs Icon */}
            <Link
              to="/saved-jobs"
              className={cn(
                "relative p-2 rounded-lg border transition-colors",
                isActive('/saved-jobs')
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                  : "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
              title="Saved Jobs"
              aria-label="Saved Jobs"
            >
              <FaBookmark size={14} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {savedCount}
                </span>
              )}
            </Link>

            {/* User Dropdown or Login */}
            {user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-800 transition cursor-pointer"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] uppercase">
                    {user.email ? user.email.charAt(0) : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user.email}</span>
                  <FaChevronDown size={9} className="text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-[11px] text-slate-400">Signed in</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase">
                        {isAdmin ? 'Admin' : (isCompany || isEmployer) ? 'Employer' : 'Candidate'}
                      </span>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaBriefcase className="text-indigo-600" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    {(isCompany || isEmployer) ? (
                      <>
                        <Link
                          to="/hr"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FaBriefcase className="text-indigo-600" />
                          <span>HR Dashboard</span>
                        </Link>
                        <Link
                          to="/hr/jobs/new"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FaPlus className="text-indigo-600" />
                          <span>Post a Job</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/candidate"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FaUser className="text-indigo-600" />
                          <span>Candidate Dashboard</span>
                        </Link>
                        <Link
                          to="/candidate/applications"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FaBriefcase className="text-indigo-600" />
                          <span>My Applications</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                      >
                        <FaSignOutAlt />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
              >
                Log In
              </Link>
            )}

            {/* Clear Primary "Post a Job" Button */}
            <Link
              to={user && (isCompany || isEmployer) ? "/hr/jobs/new" : "/signup/company"}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5 transition"
            >
              <FaPlus className="text-[10px]" />
              <span>Post a Job</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to={user && (isCompany || isEmployer) ? "/hr/jobs/new" : "/signup/company"}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white"
            >
              Post Job
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200"
              aria-label="Toggle menu"
            >
              {isOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-2">
          <Link
            to="/jobs"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Find Jobs
          </Link>
          <Link
            to="/companies"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Companies
          </Link>
          <Link
            to="/saved-jobs"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span>Saved Jobs</span>
            {savedCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full">
                {savedCount}
              </span>
            )}
          </Link>
          <Link
            to="/hr"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            HR SaaS
          </Link>
          <Link
            to="/about"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            About Us
          </Link>
          <Link
            to="/contactus"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Contact
          </Link>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full py-2 rounded-lg text-xs font-bold text-rose-600 border border-rose-200 hover:bg-rose-50"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex-1 text-center py-2 rounded-lg text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="flex-1 text-center py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
