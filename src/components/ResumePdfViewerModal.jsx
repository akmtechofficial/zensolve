import React, { useRef } from 'react';
import {
  FaTimes,
  FaPrint,
  FaFilePdf,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaLinkedin,
  FaGithub,
  FaBriefcase,
  FaGraduationCap,
  FaTags,
  FaLanguage,
  FaCheckCircle,
  FaDownload,
} from 'react-icons/fa';

/**
 * ResumePdfViewerModal
 * Renders candidate's digital profile as an authentic, high-quality A4 Curriculum Vitae (PDF format).
 * Supports browser native Print / Save as PDF via clean @media print styles.
 */
const ResumePdfViewerModal = ({ isOpen, onClose, applicant }) => {
  const printAreaRef = useRef(null);

  if (!isOpen || !applicant) return null;

  const snapshot = applicant.profileSnapshot || {};
  const fullName = applicant.applicantName || snapshot.displayName || applicant.displayName || 'Candidate Name';
  const headline = applicant.applicantHeadline || snapshot.headline || applicant.headline || applicant.jobPosition || 'Professional';
  const email = applicant.applicantEmail || snapshot.email || applicant.email || '';
  const phone = applicant.applicantPhone || snapshot.phone || applicant.phone || '';
  const location = snapshot.location || snapshot.city || applicant.applicantLocation || applicant.city || applicant.location || '';
  const bio = applicant.applicantBio || snapshot.bio || applicant.bio || snapshot.about || applicant.about || '';
  
  const safeArray = (val) => {
    if (Array.isArray(val) && val.length > 0) return val;
    if (typeof val === 'string' && val.trim().length > 0) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        return val.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const getFirstArray = (...sources) => {
    for (const src of sources) {
      const arr = safeArray(src);
      if (arr.length > 0) return arr;
    }
    return [];
  };

  const skills = getFirstArray(
    applicant.skills,
    snapshot.skills,
    applicant.applicantSkills,
    snapshot.applicantSkills
  );

  const languages = getFirstArray(
    applicant.languages,
    snapshot.languages
  );

  const education = getFirstArray(
    applicant.education,
    snapshot.education
  );

  const experience = getFirstArray(
    applicant.experience,
    snapshot.experience
  );

  const experienceYears = applicant.experienceYears || snapshot.experienceYears || applicant.totalExperience || '';
  const noticePeriod = applicant.noticePeriod || snapshot.noticePeriod || '';
  const portfolioURL = applicant.portfolioURL || snapshot.portfolioURL || '';
  const linkedinURL = applicant.linkedinURL || snapshot.linkedinURL || '';
  const githubURL = applicant.githubURL || snapshot.githubURL || '';
  const photoSrc = applicant.applicantPhoto || snapshot.photoURL || applicant.photoURL || snapshot.avatar || applicant.avatar || '';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-start justify-center p-2 sm:p-6 animate-fadeIn print:p-0 print:bg-white print:overflow-visible">
      {/* Print Specific CSS to isolate the resume paper document */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #zensolve-resume-print-sheet, #zensolve-resume-print-sheet * {
            visibility: visible !important;
          }
          #zensolve-resume-print-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl my-4 sm:my-8 flex flex-col items-center">
        
        {/* Floating Top Control Toolbar (Hidden in Print) */}
        <div className="w-full max-w-3xl mb-4 bg-slate-900 text-white rounded-2xl px-5 py-3 shadow-xl flex items-center justify-between no-print border border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              <FaFilePdf />
            </div>
            <div>
              <h4 className="text-xs font-bold leading-tight">Digital CV / Resume Document</h4>
              <p className="text-[10px] text-slate-400">Rendered from Verified Candidate Dossier</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <FaDownload size={11} />
              <span>Save / Print PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700 cursor-pointer"
              title="Close Viewer"
            >
              <FaTimes size={13} />
            </button>
          </div>
        </div>

        {/* =========================================================================
           A4 PAPER CV SHEET CONTAINER
           ========================================================================= */}
        <div
          id="zensolve-resume-print-sheet"
          ref={printAreaRef}
          className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 text-slate-900 p-8 sm:p-14 space-y-7 relative font-sans leading-relaxed"
        >
          {/* Resume Header */}
          <div className="border-b border-slate-200 pb-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-display uppercase">
                  {fullName}
                </h1>
                <p className="text-sm font-semibold text-indigo-700 tracking-wide">
                  {headline}
                </p>
              </div>

              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt={fullName}
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                />
              ) : null}
            </div>

            {/* Contact Strip */}
            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600 pt-1">
              {email && (
                <span className="inline-flex items-center gap-1.5">
                  <FaEnvelope className="text-slate-400 text-[11px]" />
                  <a href={`mailto:${email}`} className="text-indigo-600 hover:underline">
                    {email}
                  </a>
                </span>
              )}
              {phone && (
                <span className="inline-flex items-center gap-1.5">
                  <FaPhone className="text-slate-400 text-[11px]" />
                  <a href={`tel:${phone}`} className="text-slate-800">
                    {phone}
                  </a>
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-rose-500 text-[11px]" />
                  <span>{location}</span>
                </span>
              )}
              {portfolioURL && (
                <span className="inline-flex items-center gap-1.5">
                  <FaGlobe className="text-slate-400 text-[11px]" />
                  <a href={portfolioURL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    Portfolio
                  </a>
                </span>
              )}
              {linkedinURL && (
                <span className="inline-flex items-center gap-1.5">
                  <FaLinkedin className="text-blue-600 text-[11px]" />
                  <a href={linkedinURL} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                    LinkedIn
                  </a>
                </span>
              )}
            </div>

            {/* Quick Metrics Bar */}
            {(experienceYears || noticePeriod) && (
              <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-semibold text-slate-500">
                {experienceYears && (
                  <span>
                    Total Experience: <strong className="text-slate-800">{experienceYears}</strong>
                  </span>
                )}
                {noticePeriod && (
                  <span>
                    Notice Period: <strong className="text-slate-800">{noticePeriod}</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Professional Summary */}
          {bio && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-1">
                <span>Professional Summary</span>
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                {bio}
              </p>
            </div>
          )}

          {/* Key Skills & Competencies */}
          {skills && skills.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-1">
                <FaTags className="text-indigo-600 text-[11px]" />
                <span>Skills & Key Competencies</span>
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience History */}
          {experience && experience.length > 0 && (
            <div className="space-y-3.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-1">
                <FaBriefcase className="text-indigo-600 text-[11px]" />
                <span>Work Experience & Employment History</span>
              </h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => {
                  const isObj = typeof exp === 'object' && exp !== null;
                  const role = isObj ? (exp.role || exp.title || 'Role') : String(exp);
                  const duration = isObj ? (exp.duration || exp.years || '') : '';
                  const company = isObj ? (exp.company || exp.companyName || '') : '';
                  const description = isObj ? (exp.description || '') : '';

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-slate-900">
                          {role}
                        </h3>
                        {duration && (
                          <span className="text-[10px] font-semibold text-slate-500">
                            {duration}
                          </span>
                        )}
                      </div>
                      {company && (
                        <p className="text-xs font-semibold text-indigo-700">
                          {company}
                        </p>
                      )}
                      {description && (
                        <p className="text-[11px] text-slate-600 leading-relaxed pt-0.5 whitespace-pre-line">
                          {description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Education & Academic Credentials */}
          {education && education.length > 0 && (
            <div className="space-y-3.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-1">
                <FaGraduationCap className="text-indigo-600 text-[11px]" />
                <span>Education & Academic Credentials</span>
              </h2>
              <div className="space-y-3">
                {education.map((edu, idx) => {
                  const isObj = typeof edu === 'object' && edu !== null;
                  const degree = isObj ? (edu.degree || edu.qualification || 'Qualification') : String(edu);
                  const year = isObj ? (edu.year || '') : '';
                  const school = isObj ? (edu.school || edu.college || edu.institution || '') : '';
                  const grade = isObj ? (edu.grade || edu.percentage || '') : '';

                  return (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-slate-900">
                          {degree}
                        </h3>
                        {year && (
                          <span className="text-[10px] font-semibold text-slate-500">
                            {year}
                          </span>
                        )}
                      </div>
                      {school && (
                        <p className="text-xs text-slate-600">
                          {school}
                        </p>
                      )}
                      {grade && (
                        <span className="text-[10px] font-semibold text-emerald-700 block">
                          Grade / Percentage: {grade}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Languages Known */}
          {languages && languages.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-1">
                <FaLanguage className="text-indigo-600 text-[11px]" />
                <span>Languages Known</span>
              </h2>
              <div className="flex flex-wrap gap-2 text-xs">
                {languages.map((l, idx) => {
                  const name = typeof l === 'string' ? l : l.name;
                  const prof = typeof l === 'string' ? '' : l.proficiency;
                  return (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-800 text-[11px]"
                    >
                      <strong className="font-semibold">{name}</strong>
                      {prof ? ` (${prof})` : ''}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Candidate Cover Pitch / Notes */}
          {applicant.notes && (
            <div className="space-y-1.5 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
                Candidate Note / Objective
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                "{applicant.notes}"
              </p>
            </div>
          )}

          {/* Official Verification Seal Footer */}
          <div className="pt-6 mt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <FaCheckCircle className="text-emerald-500" />
              <span>Verified ATS Digital Resume • Zensolve Infotech Platform</span>
            </div>
            <div>
              Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ResumePdfViewerModal;
