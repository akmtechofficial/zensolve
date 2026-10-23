import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaLinkedin,
  FaFacebook,
  FaTwitter,
  FaArrowRight,
  FaShieldAlt,
} from 'react-icons/fa';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const Footer = () => {
  const [contactData, setContactData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchContact = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'contactData'));
        if (snap.exists() && isMounted) {
          setContactData(snap.data());
        }
      } catch (err) {
        console.error('Error fetching contact footer:', err);
      }
    };
    fetchContact();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <footer className="border-t border-slate-200/80 glass-surface-1 text-slate-600 pt-16 pb-12 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          
          {/* Brand & Mission Column (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-white p-0.5 border border-slate-200 shadow-sm group-hover:border-indigo-400 group-hover:shadow-glow-sm transition-all overflow-hidden flex items-center justify-center">
                <img
                  src="/zen.jpeg"
                  alt="ZenSolve Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-display font-bold text-xl text-slate-900 tracking-tight">
                ZenSolve Infotech
              </span>
            </Link>

            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              ZenSolve Infotech Solution Private Limited empowers career pathways across India. We bridge verified employers with top-tier candidates through intelligent recruitment, training, and strategic corporate consultancy.
            </p>

            <div className="flex items-center gap-3 pt-2">
              {contactData?.linkedin && (
                <a
                  href={contactData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl glass-surface-2 border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 text-slate-600 flex items-center justify-center transition shadow-sm"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={15} />
                </a>
              )}
              {contactData?.facebook && (
                <a
                  href={contactData.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl glass-surface-2 border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 text-slate-600 flex items-center justify-center transition shadow-sm"
                  aria-label="Facebook"
                >
                  <FaFacebook size={15} />
                </a>
              )}
              {contactData?.twitter && (
                <a
                  href={contactData.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl glass-surface-2 border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 text-slate-600 flex items-center justify-center transition shadow-sm"
                  aria-label="Twitter"
                >
                  <FaTwitter size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-4 font-display">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/jobs" className="text-slate-600 hover:text-indigo-600 transition">
                  Explore All Jobs
                </Link>
              </li>
              <li>
                <Link to="/companies" className="text-slate-600 hover:text-indigo-600 transition">
                  Verified Companies
                </Link>
              </li>
              <li>
                <Link to="/saved-jobs" className="text-slate-600 hover:text-indigo-600 transition">
                  Saved Bookmarks
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-slate-600 hover:text-indigo-600 transition">
                  Legal & Trust Center
                </Link>
              </li>
              <li>
                <Link to="/report-fraud" className="text-rose-600 hover:text-rose-700 font-semibold transition">
                  Report Job Fraud
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-4 font-display">
              For Employers
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 transition">
                  HR Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/post-job" className="text-slate-600 hover:text-indigo-600 transition">
                  Post New Opening
                </Link>
              </li>
              <li>
                <Link to="/dashboard/applicants" className="text-slate-600 hover:text-indigo-600 transition">
                  Manage Applicants
                </Link>
              </li>
              <li>
                <Link to="/employer-terms" className="text-slate-600 hover:text-indigo-600 transition">
                  Employer Terms
                </Link>
              </li>
              <li>
                <Link to="/register?role=employer" className="text-slate-600 hover:text-indigo-600 transition">
                  Register Company
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details from Firestore */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-4 font-display">
              Get in Touch
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <FaMapMarkerAlt className="text-indigo-600 text-xs mt-1 flex-shrink-0" />
                <span className="leading-snug text-slate-600">
                  {contactData?.address || 'Hsda - Mahagama 4 lane Zero mile Godda, Jharkhand, India'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <FaEnvelope className="text-indigo-600 text-xs flex-shrink-0" />
                <a
                  href={`mailto:${contactData?.email || 'carezensolve@gmail.com'}`}
                  className="text-slate-600 hover:text-indigo-600 transition truncate"
                >
                  {contactData?.email || 'carezensolve@gmail.com'}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <FaPhone className="text-indigo-600 text-xs flex-shrink-0" />
                <a
                  href={`tel:${contactData?.phone || '+91 9999999999'}`}
                  className="text-slate-600 hover:text-indigo-600 transition"
                >
                  {contactData?.phone || '+91 (Support Desk)'}
                </a>
              </div>
              <div className="pt-1">
                <Link
                  to="/grievance-redressal"
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <span>Grievance Redressal Mechanism →</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Real Legal Routes & Cookie Settings */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Zensolve infotech solution Pvt. Ltd. All Rights Reserved. (Provisional Entity Details)
          </p>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <Link to="/privacy" className="hover:text-slate-700 transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-700 transition">
              Terms of Service
            </Link>
            <Link to="/security" className="hover:text-slate-700 transition">
              Security
            </Link>
            <Link to="/cookies" className="hover:text-slate-700 transition">
              Cookies
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('zensolve_open_cookie_modal'))}
              className="hover:text-indigo-600 transition underline cursor-pointer"
            >
              Cookie Settings
            </button>
            <Link to="/data-deletion" className="hover:text-slate-700 transition">
              Data Erasure
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
