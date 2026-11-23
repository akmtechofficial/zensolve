import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import ResumePdfViewerModal from '../../components/ResumePdfViewerModal';
import { fetchCandidateFullProfile } from '../../services/recruitmentService';
import { getSecureResumeUrl } from '../../services/storageService';
import {
  FaFileAlt,
  FaSearch,
  FaFilePdf,
  FaBuilding,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaEnvelope,
  FaCheckCircle,
  FaIdBadge,
} from 'react-icons/fa';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for Digital CV viewing
  const [resumeViewerOpen, setResumeViewerOpen] = useState(false);
  const [resumeApplicant, setResumeApplicant] = useState(null);
  const [downloadingResume, setDownloadingResume] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const appsRef = collection(db, 'jobApplications');
      const snap = await getDocs(appsRef);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Sort by appliedAt descending
      data.sort((a, b) => {
        const timeA = a.appliedAt?.toDate ? a.appliedAt.toDate().getTime() : new Date(a.appliedAt || 0).getTime();
        const timeB = b.appliedAt?.toDate ? b.appliedAt.toDate().getTime() : new Date(b.appliedAt || 0).getTime();
        return timeB - timeA;
      });

      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleViewResume = async (app) => {
    if (!app) return;
    const resumeVal = app.resume || app.resumeUrl || '';

    // If it's a digital profile CV (starts with profile://, is DIGITAL_PROFILE_CV, or has no separate uploaded document)
    if (
      !resumeVal ||
      resumeVal === 'DIGITAL_PROFILE_CV' ||
      resumeVal.startsWith('profile://') ||
      app.isDigitalProfile
    ) {
      setDownloadingResume(true);
      try {
        const enriched = await fetchCandidateFullProfile(app.id, app);
        setResumeApplicant(enriched);
        setResumeViewerOpen(true);
      } catch (err) {
        console.warn('Failed loading candidate profile for modal:', err);
        setResumeApplicant(app);
        setResumeViewerOpen(true);
      } finally {
        setDownloadingResume(false);
      }
      return;
    }

    // Otherwise, it's an uploaded file
    if (resumeVal.startsWith('http://') || resumeVal.startsWith('https://')) {
      window.open(resumeVal, '_blank', 'noopener,noreferrer');
      return;
    }

    // Try authorized signed storage URL
    setDownloadingResume(true);
    try {
      const url = await getSecureResumeUrl({
        resumePath: app.resumeStoragePath || resumeVal,
        applicationId: app.id,
      });
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        const enriched = await fetchCandidateFullProfile(app.id, app);
        setResumeApplicant(enriched);
        setResumeViewerOpen(true);
      }
    } catch (err) {
      console.warn('Resume authorization notice, opening digital CV:', err);
      setResumeApplicant(app);
      setResumeViewerOpen(true);
    } finally {
      setDownloadingResume(false);
    }
  };

  const getExperienceLabel = (app) => {
    if (!app) return 'Fresher';
    if (app.experienceYears) {
      return `${app.experienceYears} Years Exp`;
    }
    if (Array.isArray(app.experience) && app.experience.length > 0) {
      const first = app.experience[0];
      const title = first?.role || first?.title || 'Prior Role';
      return `${title} (${app.experience.length} listed)`;
    }
    if (typeof app.experience === 'string' && app.experience.trim()) {
      return app.experience.trim();
    }
    return 'Fresher / Not specified';
  };

  const getFormattedDate = (appliedAt) => {
    if (!appliedAt) return 'Recent';
    if (appliedAt.toDate) {
      try {
        return appliedAt.toDate().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } catch {
        return 'Recent';
      }
    }
    if (typeof appliedAt === 'string') {
      const d = new Date(appliedAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
    }
    return 'Recent';
  };

  const filteredApps = applications.filter((app) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q && statusFilter === 'all') return true;

    const matchSearch =
      !q ||
      (app.applicantName || '').toLowerCase().includes(q) ||
      (app.applicantEmail || '').toLowerCase().includes(q) ||
      (app.applicantPhone || '').toLowerCase().includes(q) ||
      (app.jobPosition || app.jobTitle || '').toLowerCase().includes(q) ||
      (app.companyName || app.clientCompanyName || '').toLowerCase().includes(q);

    if (!matchSearch) return false;
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;

    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Selected':
      case 'Hired':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Withdrawn':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Under Review':
      case 'Reviewed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <AdminLayout
      title="Platform Applications Inspector"
      subtitle="Super-admin oversight of all candidate submissions, interview statuses, and recruiter activity across all organizations."
    >
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 p-1.5 glass-surface-2 rounded-2xl border border-slate-200/90 overflow-x-auto">
          {[
            { id: 'all', label: 'All Applications' },
            { id: 'Applied', label: 'Applied' },
            { id: 'Under Review', label: 'Under Review' },
            { id: 'Shortlisted', label: 'Shortlisted' },
            { id: 'Selected', label: 'Selected' },
            { id: 'Rejected', label: 'Rejected' },
            { id: 'Withdrawn', label: 'Withdrawn' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, email, role, company..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl glass-input text-xs text-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="glass-surface-2 glass-specular rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-600 font-medium">
            Loading candidate applications...
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto text-lg">
              <FaFileAlt />
            </div>
            <div className="text-sm font-bold text-slate-800">No applications match criteria</div>
            <p className="text-xs text-slate-600">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3.5 px-6">Candidate Details</th>
                  <th className="py-3.5 px-4">Applied Job Role</th>
                  <th className="py-3.5 px-4">Target Company</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date Submitted</th>
                  <th className="py-3.5 px-6 text-right">Resume / CV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/90">
                {filteredApps.map((app) => {
                  const resumeVal = app.resume || app.resumeUrl || '';
                  const isDigital =
                    !resumeVal ||
                    resumeVal === 'DIGITAL_PROFILE_CV' ||
                    resumeVal.startsWith('profile://') ||
                    app.isDigitalProfile;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Candidate Identity */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {app.applicantPhoto || app.profileSnapshot?.photoURL ? (
                            <img
                              src={app.applicantPhoto || app.profileSnapshot?.photoURL}
                              alt={app.applicantName}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-100 shrink-0">
                              {app.applicantName?.charAt(0) || <FaUser size={10} />}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {app.applicantName || 'Anonymous Candidate'}
                            </div>
                            <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                              <FaEnvelope className="text-[10px] text-slate-400" />
                              <a href={`mailto:${app.applicantEmail}`} className="hover:text-indigo-600">
                                {app.applicantEmail}
                              </a>
                            </div>
                            {app.applicantPhone && (
                              <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <FaPhone className="text-[9px] text-slate-400" />
                                <span>{app.applicantPhone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Job Role */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">
                          {app.jobPosition || app.jobTitle || 'Role'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {getExperienceLabel(app)}
                        </div>
                        {(app.applicantLocation || app.location) && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <FaMapMarkerAlt className="text-rose-400 text-[9px]" />
                            <span>{app.applicantLocation || app.location}</span>
                          </div>
                        )}
                      </td>

                      {/* Company Name */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <FaBuilding className="text-slate-400 text-xs shrink-0" />
                          <span>{app.companyName || '—'}</span>
                        </div>
                        {app.clientCompanyName && (
                          <div className="text-[10px] text-indigo-600 font-medium mt-0.5">
                            Client: {app.clientCompanyName}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status || 'Applied'}
                        </span>
                      </td>

                      {/* Date Submitted */}
                      <td className="py-4 px-4 text-slate-600 text-[11px]">
                        {getFormattedDate(app.appliedAt)}
                      </td>

                      {/* Resume / CV Action */}
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewResume(app)}
                          disabled={downloadingResume}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                            isDigital
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          <FaFilePdf className={isDigital ? 'text-emerald-600' : 'text-rose-500'} />
                          <span>{isDigital ? 'View Profile CV' : 'Open Attached CV'}</span>
                          <FaExternalLinkAlt className="text-[9px] opacity-70" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* A4 PDF Curriculum Vitae Viewer Modal */}
      <ResumePdfViewerModal
        isOpen={resumeViewerOpen}
        onClose={() => setResumeViewerOpen(false)}
        applicant={resumeApplicant}
      />
    </AdminLayout>
  );
};

export default AdminApplications;
