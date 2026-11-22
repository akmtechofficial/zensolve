import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaUserTie,
  FaIdCard,
  FaCalendarAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaBriefcase,
  FaUsers,
  FaArrowRight,
} from 'react-icons/fa';

const AboutUs = () => {
  const directors = [
    {
      name: 'Anand Kumar',
      designation: 'Director',
      din: '10465254',
      appointmentDate: 'January 15, 2024',
      bio: 'Executive Director responsible for corporate governance, operational strategy, and enterprise manpower partnerships.',
    },
    {
      name: 'Rupesh Kumar Thakur',
      designation: 'Director',
      din: '10465255',
      appointmentDate: 'January 15, 2024',
      bio: 'Executive Director overseeing technology innovation, recruitment platforms, and nationwide client relationship management.',
      searchUrl: 'https://www.google.com/search?kgmid=%2Fg%2F11fyxykg4l&q=company+ke+contact+location+and+directors+details+send+me+rupesh+kumar+thakur',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 mask-radial" />
      <div className="absolute top-1/4 -right-48 w-96 h-96 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 shadow-2xs">
            Corporate Profile & Statutory Governance
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            About ZenSolve Infotech
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Zensolve Infotech Solution Private Limited is an Indian manpower hiring, recruitment solutions, and talent management enterprise incorporated under the Ministry of Corporate Affairs (MCA), Government of India.
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl bg-white/95 border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl border border-indigo-100">
              <FaUsers />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Manpower Staffing Partner</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We empower verified companies with dedicated, verified workforce hiring solutions across diverse retail, logistics, services, and business operations.
            </p>
          </div>

          <div className="glass-panel p-6 sm:p-7 rounded-3xl bg-white/95 border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl border border-emerald-100">
              <FaShieldAlt />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">100% Free & Fair for Candidates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict anti-fraud enforcement. Candidates never pay for applications, interviews, or selections. We verify client vacancies before listing.
            </p>
          </div>

          <div className="glass-panel p-6 sm:p-7 rounded-3xl bg-white/95 border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl border border-purple-100">
              <FaBriefcase />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Enterprise Recruitment ATS</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Proprietary applicant tracking systems with multi-location seat quotas, role scheduling, and digital candidate dossiers.
            </p>
          </div>
        </div>

        {/* Corporate Statutory Registration Details */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl bg-white/95 border border-slate-200/90 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <FaBuilding className="text-indigo-600 text-lg" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                  Corporate Registration & MCA Details
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Incorporated under the Companies Act, 2013 • Ministry of Corporate Affairs, Government of India
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold self-start sm:self-auto">
              <FaCheckCircle size={12} />
              <span>Active MCA Legal Entity</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Full Legal Entity Name</span>
              <span className="text-sm font-bold text-slate-900 block font-display">
                Zensolve Infotech Solution Private Limited
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">CIN (Corporate Identity No.)</span>
              <span className="text-sm font-bold text-indigo-700 block font-mono">
                U78100JH2024PTC021852
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Date of Incorporation</span>
              <span className="text-sm font-bold text-slate-900 block">
                January 15, 2024
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Official Support Email</span>
              <a href="mailto:support@infozensolve.in" className="text-sm font-bold text-indigo-600 hover:underline block truncate">
                support@infozensolve.in
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">MCA Registered Email</span>
              <a href="mailto:rupeshkumar.uci@gmail.com" className="text-sm font-bold text-indigo-600 hover:underline block truncate">
                rupeshkumar.uci@gmail.com
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Official Telephone Hotline</span>
              <a href="tel:+912269622941" className="text-sm font-bold text-slate-900 hover:text-indigo-600 block">
                +91 2269622941
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 md:col-span-2 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Registered Office Address</span>
              <span className="text-xs font-semibold text-slate-800 leading-relaxed block">
                452, Ramnagar, Bhagalpur Road, Godda, Jharkhand – 814133
              </span>
              <span className="text-[11px] text-slate-500 block pt-0.5">
                <strong className="text-slate-600">Local Landmark:</strong> 2nd Floor, Bhagalpur Road, Ramnagar, near Railway Station / Godda Block Road, Godda, Jharkhand
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Official Website</span>
              <a
                href="https://www.infozensolve.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1.5"
              >
                <FaGlobe size={11} />
                <span>www.infozensolve.in</span>
              </a>
            </div>
          </div>
        </div>

        {/* Board of Directors Section */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl bg-white/95 border border-slate-200/90 shadow-sm space-y-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FaUserTie className="text-indigo-600 text-lg" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                Board of Directors
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Both directors have been serving on the board since incorporation on January 15, 2024.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {directors.map((dir, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4 hover:border-indigo-300 transition shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                      {dir.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-display">
                        {dir.searchUrl ? (
                          <a
                            href={dir.searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-indigo-600 hover:underline transition"
                          >
                            {dir.name}
                          </a>
                        ) : (
                          dir.name
                        )}
                      </h3>
                      <span className="text-xs font-semibold text-indigo-600 block">
                        {dir.designation}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    Active Director
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block font-medium">DIN Number</span>
                    <span className="font-mono font-bold text-slate-800">{dir.din}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block font-medium">Appointment Date</span>
                    <span className="font-bold text-slate-800">{dir.appointmentDate}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {dir.bio}
                </p>
              </div>
            ))}
          </div>

          {/* Verification Table */}
          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left text-xs text-slate-700 border-collapse border border-slate-200 rounded-2xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 border border-slate-200">Director Name</th>
                  <th className="py-3 px-4 border border-slate-200">Designation</th>
                  <th className="py-3 px-4 border border-slate-200">DIN (Identification No.)</th>
                  <th className="py-3 px-4 border border-slate-200">Appointment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {directors.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-3 px-4 border border-slate-200 font-bold text-slate-900">
                      {d.searchUrl ? (
                        <a href={d.searchUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          {d.name}
                        </a>
                      ) : (
                        d.name
                      )}
                    </td>
                    <td className="py-3 px-4 border border-slate-200 font-semibold text-slate-700">{d.designation}</td>
                    <td className="py-3 px-4 border border-slate-200 font-mono text-slate-900">{d.din}</td>
                    <td className="py-3 px-4 border border-slate-200 text-slate-600">{d.appointmentDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Footer Block */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900 to-indigo-950 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display">
              Ready to Hire or Get Hired?
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              Join thousands of job seekers and hundreds of verified Indian organizations on ZenSolve's manpower staffing and placement platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/jobs"
              className="px-6 py-3 rounded-2xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 transition shadow-md"
            >
              Browse Open Vacancies
            </Link>
            <Link
              to="/contactus"
              className="px-6 py-3 rounded-2xl bg-indigo-800/80 hover:bg-indigo-800 text-white font-bold text-xs border border-indigo-700 transition"
            >
              Contact Support Desk
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
