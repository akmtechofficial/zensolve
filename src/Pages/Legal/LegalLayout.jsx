import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LEGAL_CONFIG } from '../../config/legalConfig';
import {
  FaShieldAlt,
  FaFileContract,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaCheckCircle,
  FaLock,
} from 'react-icons/fa';

const ALL_POLICIES = Object.values(LEGAL_CONFIG.documents);

const LegalLayout = ({
  title,
  docId,
  version = '1.0-draft',
  effectiveDate = '2026-04-01',
  reviewDate = '2026-10-22',
  status = 'needs_legal_review',
  toc = [],
  children,
}) => {
  const location = useLocation();

  const getStatusBadge = () => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <FaCheckCircle className="text-[10px]" />
            <span>Published Policy</span>
          </span>
        );
      case 'needs_legal_review':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
            <FaExclamationTriangle className="text-[10px]" />
            <span>Provisional Draft • Needs Statutory Legal Review</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-indigo-600 transition">
            Home
          </Link>
          <span>/</span>
          <Link to="/legal" className="hover:text-indigo-600 transition">
            Legal & Trust Center
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate max-w-xs">{title}</span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge()}
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                v{version}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt className="text-indigo-600" />
                <span>Effective: {effectiveDate}</span>
              </span>
              <span>•</span>
              <span>Last Reviewed: {reviewDate}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display mb-3">
            {title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Issued by <strong className="text-slate-800">{LEGAL_CONFIG.entity.provisionalLegalName}</strong> for the platform website <span className="font-mono text-indigo-600">{LEGAL_CONFIG.entity.websiteDomain}</span>. Corporate registration details and statutory appointments are marked provisional pending final verification.
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Table of Contents & Policy Navigation (Span 4 on Desktop) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            
            {/* Table of Contents if available */}
            {toc && toc.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  On This Page
                </h3>
                <nav className="space-y-1">
                  {toc.map((item, idx) => (
                    <a
                      key={idx}
                      href={`#${item.id}`}
                      className="block text-xs text-slate-600 hover:text-indigo-600 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition leading-snug"
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* All Legal Center Policies */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Legal Policies</span>
                <Link to="/legal" className="text-indigo-600 lowercase font-normal hover:underline">
                  View all
                </Link>
              </h3>
              <div className="space-y-1">
                {ALL_POLICIES.slice(0, 8).map((p) => {
                  const isCurrent = location.pathname === p.path;
                  return (
                    <Link
                      key={p.id}
                      to={p.path}
                      className={`block text-xs px-3 py-1.5 rounded-lg transition font-medium ${
                        isCurrent
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {p.title}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Statutory Compliance Note */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-slate-700 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-950">
                <FaLock className="text-indigo-600 text-xs" />
                <span>Privacy & Grievance Contact</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                For questions regarding data processing, privacy choices, or job fraud complaints, write to our designated address:{' '}
                <a
                  href={`mailto:${LEGAL_CONFIG.contacts.provisionalPrivacyEmail}`}
                  className="font-medium text-indigo-700 hover:underline"
                >
                  {LEGAL_CONFIG.contacts.provisionalPrivacyEmail}
                </a>
              </p>
            </div>

          </aside>

          {/* Main Legal Content Column (Span 8 on Desktop) */}
          <main className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8 prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed">
            {children}
          </main>

        </div>

      </div>
    </div>
  );
};

export default LegalLayout;
