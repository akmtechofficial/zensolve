import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
  getJobApplications,
  updateApplicationStatus,
  fetchCandidateFullProfile,
} from '../../services/recruitmentService';
import { getSecureResumeUrl } from '../../services/storageService';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  FaSearch,
  FaFileAlt,
  FaEnvelope,
  FaPhone,
  FaExternalLinkAlt,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaFilePdf,
  FaGraduationCap,
  FaBriefcase,
  FaMapMarkerAlt,
  FaTags,
  FaLanguage,
  FaGlobe,
  FaLinkedin,
  FaGithub,
  FaClock,
  FaTimes,
  FaPrint,
  FaIdCard,
} from 'react-icons/fa';

import { useAuth } from '../../components/useAuth';

const statusOptions = ['All', 'Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn'];

const DashboardApplicants = () => {
  const { user, isAdmin } = useAuth();
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Candidate Profile Modal State
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);
  const [modalStatus, setModalStatus] = useState('');
  const [modalNote, setModalNote] = useState('');
  const [modalUpdatingStatus, setModalUpdatingStatus] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(null);

  const fetchApps = async () => {
    if (!user) return;
    setLoading(true);
    // HR users only see applications for their company; superadmins see all
    const data = await getJobApplications(isAdmin ? {} : { companyId: user.uid });
    setApplications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, [user, isAdmin]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    const res = await updateApplicationStatus(appId, newStatus);
    if (res.success) {
      setApplications(
        applications.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      if (selectedApplicant?.id === appId) {
        setSelectedApplicant((prev) => ({ ...prev, status: newStatus }));
      }
    } else {
      alert('Failed to update status: ' + res.error);
    }
    setUpdatingId(null);
  };

  const handleOpenProfileModal = async (app) => {
    setSelectedApplicant(app);
    setModalStatus(app.status || 'Applied');
    setModalNote('');
    setModalFeedback(null);
    setIsModalOpen(true);
    setModalLoading(true);

    try {
      const enriched = await fetchCandidateFullProfile(app.id, app);
      setSelectedApplicant(enriched);
      setModalStatus(enriched.status || app.status || 'Applied');
    } catch (err) {
      console.warn('Failed to enrich applicant modal profile:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplicant(null);
  };

  const handleModalStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApplicant || !modalStatus) return;
    setModalUpdatingStatus(true);
    setModalFeedback(null);

    const res = await updateApplicationStatus(selectedApplicant.id, modalStatus, modalNote);
    if (res.success) {
      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApplicant.id ? { ...a, status: modalStatus } : a))
      );
      setSelectedApplicant((prev) => ({
        ...prev,
        status: modalStatus,
        statusTimeline: [
          ...(prev.statusTimeline || []),
          {
            status: modalStatus,
            timestamp: new Date().toISOString(),
            note: modalNote || 'Status updated by HR Recruiter',
          },
        ],
      }));
      setModalFeedback({ type: 'success', text: `Status updated to "${modalStatus}".` });
      setModalNote('');
    } else {
      setModalFeedback({ type: 'error', text: res.error || 'Failed to update status.' });
    }
    setModalUpdatingStatus(false);
  };

  const handleDownloadResume = async (app) => {
    if (!app?.resume) return;
    setDownloadingResume(true);
    try {
      const url = await getSecureResumeUrl({
        resumePath: app.resumeStoragePath || app.resume,
        applicationId: app.id,
      });
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        alert('Invalid or missing resume download link.');
      }
    } catch (err) {
      console.error('Error opening resume:', err);
      alert('Unable to load candidate resume: ' + err.message);
    } finally {
      setDownloadingResume(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status || 'Pending';
    const config = {
      Applied: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      Pending: 'bg-amber-50 text-amber-700 border-amber-200',
      'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
      Shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Interview Scheduled': 'bg-purple-50 text-purple-700 border-purple-200',
      Selected: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
      Hired: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
      Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
      Withdrawn: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    const style = config[s] || 'bg-slate-50 text-slate-700 border-slate-200';
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
        {s}
      </span>
    );
  };

  const filtered = applications.filter((app) => {
    if (selectedStatus !== 'All') {
      const current = app.status || 'Pending';
      if (current.toLowerCase() !== selectedStatus.toLowerCase()) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      return (
        (app.applicantName && app.applicantName.toLowerCase().includes(s)) ||
        (app.applicantEmail && app.applicantEmail.toLowerCase().includes(s)) ||
        (app.jobPosition && app.jobPosition.toLowerCase().includes(s)) ||
        (app.companyName && app.companyName.toLowerCase().includes(s))
      );
    }
    return true;
  });

  return (
    <DashboardLayout
      title="Candidate Applications"
      subtitle="Review submissions, inspect candidate resumes, and manage pipeline progression."
    >
      <div className="space-y-6">
        
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search by candidate name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedStatus === status
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'glass-surface-1 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Applicants Table */}
        <div className="glass-surface-2 glass-specular rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs text-slate-500 uppercase glass-surface-1 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5">Candidate</th>
                  <th className="py-3.5 px-4">Applied Role</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4">Resume / CV</th>
                  <th className="py-3.5 px-5">Hiring Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition">
                    {/* Candidate Identity */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        {app.applicantPhoto || app.profileSnapshot?.photoURL ? (
                          <img
                            src={app.applicantPhoto || app.profileSnapshot?.photoURL}
                            alt={app.applicantName}
                            className="w-10 h-10 rounded-2xl object-cover border border-indigo-100 shadow-xs flex-shrink-0 cursor-pointer"
                            onClick={() => handleOpenProfileModal(app)}
                          />
                        ) : (
                          <div
                            onClick={() => handleOpenProfileModal(app)}
                            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs cursor-pointer"
                          >
                            {app.applicantName ? app.applicantName.charAt(0) : <FaUser size={12} />}
                          </div>
                        )}
                        <div>
                          <button
                            type="button"
                            onClick={() => handleOpenProfileModal(app)}
                            className="font-bold text-slate-900 font-display hover:text-indigo-600 transition text-left cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{app.applicantName || 'Applicant'}</span>
                          </button>
                          {(app.applicantHeadline || app.profileSnapshot?.headline) && (
                            <span className="text-[11px] text-slate-500 line-clamp-1 block">
                              {app.applicantHeadline || app.profileSnapshot?.headline}
                            </span>
                          )}
                          <a
                            href={`mailto:${app.applicantEmail}`}
                            className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 mt-0.5"
                          >
                            <FaEnvelope size={10} />
                            <span>{app.applicantEmail}</span>
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Applied Role */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">{app.jobPosition || 'General Role'}</div>
                      <div className="text-xs text-slate-500">{app.companyName}</div>
                    </td>

                    {/* Applied Date */}
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {app.appliedAt?.toDate
                        ? app.appliedAt.toDate().toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Recently'}
                    </td>

                    {/* Resume / CV */}
                    <td className="py-4 px-4">
                      {app.resume && app.resume !== 'DIGITAL_PROFILE_CV' && !app.resume.startsWith('profile://') ? (
                        <button
                          type="button"
                          onClick={() => handleDownloadResume(app)}
                          disabled={downloadingResume}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-surface-1 text-indigo-600 border border-indigo-200 hover:border-indigo-400 text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <FaFilePdf className="text-rose-500 text-xs" />
                          <span>View Resume</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenProfileModal(app)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold hover:bg-emerald-100 transition cursor-pointer"
                        >
                          <FaIdCard className="text-emerald-600 text-xs" />
                          <span>Digital Profile CV</span>
                        </button>
                      )}
                    </td>

                    {/* Quick Status Select */}
                    <td className="py-4 px-5">
                      <select
                        value={app.status || 'Pending'}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={updatingId === app.id}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border focus:outline-none transition cursor-pointer shadow-xs ${
                          app.status === 'Shortlisted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : app.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : app.status === 'Reviewed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : app.status === 'Hired' || app.status === 'Selected'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="Pending" className="bg-white text-slate-900">Pending</option>
                        <option value="Under Review" className="bg-white text-slate-900">Under Review</option>
                        <option value="Shortlisted" className="bg-white text-slate-900">Shortlisted</option>
                        <option value="Interview Scheduled" className="bg-white text-slate-900">Interview Scheduled</option>
                        <option value="Selected" className="bg-white text-slate-900">Selected</option>
                        <option value="Rejected" className="bg-white text-slate-900">Rejected</option>
                      </select>
                    </td>

                    {/* View Profile Action Button */}
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenProfileModal(app)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer"
                      >
                        <FaUser size={10} />
                        <span>View Profile</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500 text-sm">
                      No applications found matching this status or search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* =========================================================================
         CANDIDATE PROFILE DOSSIER MODAL
         ========================================================================= */}
      {isModalOpen && selectedApplicant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
            
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-indigo-50/40 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-1 rounded-lg">
                  Candidate Profile Dossier
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Ref #{selectedApplicant.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/hr/applicants/${selectedApplicant.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 font-semibold text-xs border border-indigo-200 transition"
                >
                  <span>Open Full Page</span>
                  <FaExternalLinkAlt size={10} />
                </Link>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 transition cursor-pointer"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              
              {/* Feedback Alert */}
              {modalFeedback && (
                <div
                  className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
                    modalFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {modalFeedback.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
                  <span>{modalFeedback.text}</span>
                </div>
              )}

              {/* Header Box */}
              <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                <div className="flex items-start gap-4">
                  {selectedApplicant.applicantPhoto || selectedApplicant.photoURL ? (
                    <img
                      src={selectedApplicant.applicantPhoto || selectedApplicant.photoURL}
                      alt={selectedApplicant.applicantName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200 shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-bold flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                      {selectedApplicant.applicantName?.charAt(0) || <FaUser />}
                    </div>
                  )}
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                      {selectedApplicant.applicantName || 'Candidate'}
                    </h2>
                    {(selectedApplicant.applicantHeadline || selectedApplicant.headline) && (
                      <p className="text-xs font-semibold text-slate-700">
                        {selectedApplicant.applicantHeadline || selectedApplicant.headline}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                        Target Role: {selectedApplicant.jobPosition}
                      </span>
                      {(selectedApplicant.applicantLocation || selectedApplicant.location) && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                          <FaMapMarkerAlt className="text-rose-500 text-[10px]" />
                          <span>{selectedApplicant.applicantLocation || selectedApplicant.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="self-start sm:self-auto">
                  {getStatusBadge(selectedApplicant.status)}
                </div>
              </div>

              {/* Quick Contact & Experience Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Email Address</span>
                  <a
                    href={`mailto:${selectedApplicant.applicantEmail}`}
                    className="font-bold text-indigo-600 hover:underline truncate block mt-0.5"
                  >
                    {selectedApplicant.applicantEmail}
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Phone Number</span>
                  <a
                    href={`tel:${selectedApplicant.applicantPhone}`}
                    className="font-bold text-slate-900 hover:text-indigo-600 truncate block mt-0.5"
                  >
                    {selectedApplicant.applicantPhone || 'Not provided'}
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Total Experience</span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {selectedApplicant.experienceYears || 'Fresher / Not specified'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Notice Period</span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {selectedApplicant.noticePeriod || 'Standard / Immediate'}
                  </span>
                </div>
              </div>

              {/* Salary / CTC Row if available */}
              {(selectedApplicant.expectedSalary || selectedApplicant.currentSalary) && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Current CTC</span>
                    <span className="font-bold text-slate-900">
                      {selectedApplicant.currentSalary ? `₹${selectedApplicant.currentSalary}` : 'Not disclosed'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Expected CTC</span>
                    <span className="font-bold text-emerald-700">
                      {selectedApplicant.expectedSalary ? `₹${selectedApplicant.expectedSalary}` : 'Negotiable'}
                    </span>
                  </div>
                </div>
              )}

              {/* Social / Portfolio Links */}
              {(selectedApplicant.portfolioURL || selectedApplicant.linkedinURL || selectedApplicant.githubURL) && (
                <div className="flex flex-wrap items-center gap-2">
                  {selectedApplicant.portfolioURL && (
                    <a
                      href={selectedApplicant.portfolioURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition"
                    >
                      <FaGlobe className="text-indigo-600" />
                      <span>Portfolio / Website</span>
                    </a>
                  )}
                  {selectedApplicant.linkedinURL && (
                    <a
                      href={selectedApplicant.linkedinURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-700 transition"
                    >
                      <FaLinkedin className="text-blue-600" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                  {selectedApplicant.githubURL && (
                    <a
                      href={selectedApplicant.githubURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-800 transition"
                    >
                      <FaGithub />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              )}

              {/* Candidate Bio / Professional Summary */}
              {(selectedApplicant.applicantBio || selectedApplicant.bio) && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FaUser className="text-indigo-600" />
                    <span>About Candidate / Professional Summary</span>
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                    {selectedApplicant.applicantBio || selectedApplicant.bio}
                  </div>
                </div>
              )}

              {/* Skills & Competencies */}
              {((Array.isArray(selectedApplicant.skills) && selectedApplicant.skills.length > 0) ||
                (Array.isArray(selectedApplicant.applicantSkills) && selectedApplicant.applicantSkills.length > 0)) && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FaTags className="text-indigo-600" />
                    <span>Candidate Skills & Competencies</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedApplicant.skills || selectedApplicant.applicantSkills || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-semibold"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience History */}
              {Array.isArray(selectedApplicant.experience) && selectedApplicant.experience.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FaBriefcase className="text-indigo-600" />
                    <span>Work Experience & Employment History</span>
                  </h3>
                  <div className="space-y-2.5">
                    {selectedApplicant.experience.map((exp, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900">
                            {exp.role || exp.title || 'Job Role'}
                          </h4>
                          {(exp.duration || exp.years) && (
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                              {exp.duration || exp.years}
                            </span>
                          )}
                        </div>
                        {(exp.company || exp.companyName) && (
                          <p className="text-xs font-semibold text-slate-600">
                            {exp.company || exp.companyName}
                          </p>
                        )}
                        {exp.description && (
                          <p className="text-xs text-slate-600 leading-relaxed pt-1">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Credentials */}
              {Array.isArray(selectedApplicant.education) && selectedApplicant.education.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FaGraduationCap className="text-indigo-600" />
                    <span>Education & Academic Credentials</span>
                  </h3>
                  <div className="space-y-2.5">
                    {selectedApplicant.education.map((edu, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900">
                            {edu.degree || edu.qualification || 'Degree / Course'}
                          </h4>
                          {edu.year && (
                            <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              {edu.year}
                            </span>
                          )}
                        </div>
                        {(edu.school || edu.college || edu.institution) && (
                          <p className="text-xs font-medium text-slate-600">
                            {edu.school || edu.college || edu.institution}
                          </p>
                        )}
                        {(edu.grade || edu.percentage) && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 inline-block mt-0.5">
                            Score: {edu.grade || edu.percentage}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages Known */}
              {Array.isArray(selectedApplicant.languages) && selectedApplicant.languages.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FaLanguage className="text-indigo-600" />
                    <span>Languages Known (भाषायें)</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.languages.map((l, idx) => {
                      const name = typeof l === 'string' ? l : l.name;
                      const prof = typeof l === 'string' ? '' : l.proficiency;
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold"
                        >
                          <span>{name}</span>
                          {prof && (
                            <span className="text-[10px] text-indigo-600 font-normal">({prof})</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Candidate Cover Pitch */}
              {selectedApplicant.notes && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Candidate Cover Pitch</h3>
                  <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    "{selectedApplicant.notes}"
                  </p>
                </div>
              )}

              {/* Resume / CV Section */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Official Candidate Curriculum Vitae</h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedApplicant.resume && selectedApplicant.resume !== 'DIGITAL_PROFILE_CV' && !selectedApplicant.resume.startsWith('profile://')
                      ? 'Uploaded resume document attached to application.'
                      : 'Candidate applied using complete verified digital profile.'}
                  </p>
                </div>
                <div>
                  {selectedApplicant.resume && selectedApplicant.resume !== 'DIGITAL_PROFILE_CV' && !selectedApplicant.resume.startsWith('profile://') ? (
                    <button
                      type="button"
                      disabled={downloadingResume}
                      onClick={() => handleDownloadResume(selectedApplicant)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
                    >
                      <FaFilePdf className="text-rose-300 text-sm" />
                      <span>{downloadingResume ? 'Authorizing…' : 'Open Attached CV (PDF)'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                    >
                      <FaPrint size={11} />
                      <span>Print Profile CV</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Pipeline Status Quick Update in Modal */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Update Pipeline Status
                </h4>
                <form onSubmit={handleModalStatusSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Status Stage</label>
                      <select
                        value={modalStatus}
                        onChange={(e) => setModalStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Audit Note (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Cleared HR Screening Round"
                        value={modalNote}
                        onChange={(e) => setModalNote(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={modalUpdatingStatus}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {modalUpdatingStatus ? 'Updating…' : 'Save Pipeline Status'}
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-slate-500">
                ZenSolve Talent Management ATS
              </span>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default DashboardApplicants;
