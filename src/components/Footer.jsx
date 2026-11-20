import React from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaFacebook, FaTwitter, FaShieldAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                <img src="/zen.jpeg" alt="ZenSolve" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-slate-900 text-base font-display">ZenSolve</span>
            </Link>
            <p className="text-slate-500 leading-relaxed max-w-xs">
              Multi-company recruitment platform connecting verified Indian employers with job seekers.
            </p>
          </div>

          {/* For Candidates */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              For Job Seekers
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/jobs" className="hover:text-indigo-600 transition">
                  Browse All Jobs
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-indigo-600 transition">
                  Verified Companies
                </Link>
              </li>
              <li>
                <Link to="/saved-jobs" className="hover:text-indigo-600 transition">
                  Saved Bookmarks
                </Link>
              </li>
              <li>
                <Link to="/candidate" className="hover:text-indigo-600 transition">
                  Candidate Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              For Employers
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/signup/company" className="hover:text-indigo-600 transition">
                  Post a Job (Free)
                </Link>
              </li>
              <li>
                <Link to="/hr" className="hover:text-indigo-600 transition">
                  HR Recruiter Portal
                </Link>
              </li>
              <li>
                <Link to="/hr/applicants" className="hover:text-indigo-600 transition">
                  Applicant Pipeline
                </Link>
              </li>
              <li>
                <Link to="/employer-terms" className="hover:text-indigo-600 transition">
                  Employer Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Trust & Compliance
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/privacy" className="hover:text-indigo-600 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-indigo-600 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/report-fraud" className="text-rose-600 hover:underline font-semibold transition">
                  Report Job Fraud
                </Link>
              </li>
              <li>
                <Link to="/contactus" className="hover:text-indigo-600 transition">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} ZenSolve Infotech Solution Private Limited. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-600">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-600">Terms</Link>
            <Link to="/security" className="hover:text-slate-600">Security</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
