import React from 'react';
import { Link } from 'react-router-dom';
import { LEGAL_CONFIG } from '../../config/legalConfig';
import {
  FaShieldAlt,
  FaFileContract,
  FaCookieBite,
  FaLock,
  FaTrashAlt,
  FaExclamationTriangle,
  FaUserCheck,
  FaBuilding,
  FaInfoCircle,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaArrowRight,
  FaEnvelope,
} from 'react-icons/fa';

const LegalHub = () => {
  const policies = Object.values(LEGAL_CONFIG.documents);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <FaShieldAlt className="text-xs" />
            <span>Legal, Privacy & Compliance Center</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Trust & Governance Documentation
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Review the terms, data privacy practices, acceptable use guidelines, and candidate security safeguards governing the ZenSolve recruitment platform.
          </p>
        </div>

        {/* Corporate Transparency & Provisional Information Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <FaBuilding className="text-indigo-600" />
              <span>Corporate & Platform Identification Details</span>
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Provisional Owner Configuration • Pending Statutory Audit
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block mb-1">Declared Business Name</span>
              <span className="font-bold text-slate-900">{LEGAL_CONFIG.entity.provisionalLegalName}</span>
              <span className="text-[10px] text-amber-700 block mt-1">Pending Corporate Verification</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block mb-1">Corporate Identity (CIN)</span>
              <span className="font-bold text-slate-900">{LEGAL_CONFIG.entity.cin}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Status: Pending Verification</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block mb-1">Official Domain</span>
              <span className="font-bold text-indigo-600">{LEGAL_CONFIG.entity.websiteDomain}</span>
              <span className="text-[10px] text-emerald-600 block mt-1">Production Domain Active</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block mb-1">Privacy & Grievance Email</span>
              <a
                href={`mailto:${LEGAL_CONFIG.contacts.provisionalPrivacyEmail}`}
                className="font-bold text-slate-900 hover:text-indigo-600 truncate block"
              >
                {LEGAL_CONFIG.contacts.provisionalPrivacyEmail}
              </a>
              <span className="text-[10px] text-slate-500 block mt-1">Provisional Owner Address</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed pt-2">
            Notice: In accordance with Indian IT & e-commerce regulations, full corporate statutory details including certified CIN and formal grievance officer appointment are actively being configured and audited.
          </p>
        </div>

        {/* Quick Action Cards: Deletion, Cookie Consent, Fraud Report */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-lg">
              <FaCookieBite />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Manage Cookie Preferences</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review, update, or withdraw your consent for analytical, functional, and marketing tracking scripts anytime.
            </p>
            <Link
              to="/consent-preferences"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 pt-2"
            >
              <span>Manage Preferences</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center text-lg">
              <FaTrashAlt />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Data Deletion Request</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Exercise your erasure rights under DPDP Act 2023. Request full removal of your candidate profile, resume, and application history.
            </p>
            <Link
              to="/data-deletion"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 pt-2"
            >
              <span>Request Data Erasure</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center text-lg">
              <FaExclamationTriangle />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Report Job Fraud</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Report fake employers, fee demands, advance-fee scams, impersonation, or suspicious interview requests directly to our trust desk.
            </p>
            <Link
              to="/report-fraud"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 pt-2"
            >
              <span>Submit Fraud Report</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>
        </div>

        {/* Complete Policies Registry */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              All Legal Policies & Compliance Guidelines
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Click any policy below to view detailed provisions, effective dates, and related candidate/employer obligations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {policies.map((pol) => (
              <Link
                key={pol.id}
                to={pol.path}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      v{pol.version}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        pol.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {pol.status === 'published' ? 'Published' : 'Needs Review'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition font-display mb-2">
                    {pol.title}
                  </h3>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-4">
                  <span>Effective: {pol.effectiveDate}</span>
                  <FaArrowRight className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LegalHub;
