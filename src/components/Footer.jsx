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
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 pt-16 pb-12 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-indigo-600/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          
          {/* Brand & Mission Column (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-[1px]">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center font-display font-black text-lg text-indigo-400">
                  Z
                </div>
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                ZenSolve Infotech
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              ZenSolve Infotech Solution Private Limited empowers career pathways across India. We bridge verified employers with top-tier candidates through intelligent recruitment, training, and strategic corporate consultancy.
            </p>

            <div className="flex items-center gap-3 pt-2">
              {contactData?.linkedin && (
                <a
                  href={contactData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:text-white flex items-center justify-center transition"
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
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:text-white flex items-center justify-center transition"
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
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:text-white flex items-center justify-center transition"
                  aria-label="Twitter"
                >
                  <FaTwitter size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4 font-display">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/jobs" className="hover:text-indigo-400 transition">
                  Explore All Jobs
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-indigo-400 transition">
                  Verified Companies
                </Link>
              </li>
              <li>
                <Link to="/saved-jobs" className="hover:text-indigo-400 transition">
                  Saved Bookmarks
                </Link>
              </li>
              <li>
                <Link to="/contactus" className="hover:text-indigo-400 transition">
                  Help & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4 font-display">
              For Employers
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/dashboard" className="hover:text-indigo-400 transition">
                  HR Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/post-job" className="hover:text-indigo-400 transition">
                  Post New Opening
                </Link>
              </li>
              <li>
                <Link to="/dashboard/applicants" className="hover:text-indigo-400 transition">
                  Manage Applicants
                </Link>
              </li>
              <li>
                <Link to="/register?role=employer" className="hover:text-indigo-400 transition">
                  Register Company
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details from Firestore */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4 font-display">
              Get in Touch
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <FaMapMarkerAlt className="text-indigo-400 text-xs mt-1 flex-shrink-0" />
                <span className="leading-snug">
                  {contactData?.address || 'Patna, Bihar, India'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <FaEnvelope className="text-indigo-400 text-xs flex-shrink-0" />
                <a
                  href={`mailto:${contactData?.email || 'support@zensolve.com'}`}
                  className="hover:text-indigo-400 transition truncate"
                >
                  {contactData?.email || 'support@zensolve.com'}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <FaPhone className="text-indigo-400 text-xs flex-shrink-0" />
                <a
                  href={`tel:${contactData?.phone || '+91 9999999999'}`}
                  className="hover:text-indigo-400 transition"
                >
                  {contactData?.phone || '+91 (Support Desk)'}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} ZenSolve Infotech Solution Private Limited. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/contactus" className="hover:text-slate-400 transition">
              Privacy Policy
            </Link>
            <Link to="/contactus" className="hover:text-slate-400 transition">
              Terms of Service
            </Link>
            <Link to="/contactus" className="hover:text-slate-400 transition">
              Security & Verification
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
