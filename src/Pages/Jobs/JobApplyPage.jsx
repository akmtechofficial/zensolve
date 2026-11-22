import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../components/useAuth';
import {
  getJobById,
  getCandidateProfile,
  submitJobApplication,
  checkExistingApplication,
  getCandidateApplications,
} from '../../services/recruitmentService';
import { uploadCandidateResume, validateResumeFile, MAX_RESUME_SIZE_MB } from '../../services/storageService';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaFilePdf,
  FaFileUpload,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaShieldAlt,
  FaClock,
  FaLock,
  FaFileAlt,
  FaHistory,
  FaExternalLinkAlt,
  FaGraduationCap,
} from 'react-icons/fa';

const MAX_FILE_SIZE_MB = 10;

const JobApplyPage = () => {
  const { jobId } = useParams();
  const { user, userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [existingAppId, setExistingAppId] = useState(null);

  // Form states
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  
  // Resume state choices: 'profile' | 'saved' | 'upload' | 'digital'
  const [resumeChoice, setResumeChoice] = useState('profile');
  const [previousResumes, setPreviousResumes] = useState([]);
  const [selectedPreviousResumeUrl, setSelectedPreviousResumeUrl] = useState('');
  const [newResumeFile, setNewResumeFile] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  
  const [notes, setNotes] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('Immediate / 15 Days');

  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // 1. Fetch Job and check availability
  useEffect(() => {
    let isMounted = true;
    const fetchJob = async () => {
      if (jobId) {
        setLoadingJob(true);
        const data = await getJobById(jobId);
        if (isMounted) {
          setJob(data);
          setLoadingJob(false);
        }
      }
    };
    fetchJob();
    return () => {
      isMounted = false;
    };
  }, [jobId]);

  // 2. Auth redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to login while preserving returnUrl
      navigate(`/login?returnUrl=/jobs/${jobId}/apply`, {
        state: { from: location },
        replace: true,
      });
    }
  }, [authLoading, user, jobId, navigate, location]);

  // 3. Prefill candidate info, check duplicate, and load past resumes
  useEffect(() => {
    let isMounted = true;
    const checkCandidateState = async () => {
      if (user?.uid && jobId) {
        // Prefill contact
        setApplicantName(userData?.displayName || user.displayName || '');
        setApplicantEmail(user.email || '');
        setApplicantPhone(userData?.phone || '');

        // Fetch candidate profile for digital CV fallback
        try {
          const prof = await getCandidateProfile(user.uid);
          if (isMounted) setCandidateProfile(prof);
        } catch (e) {
          console.warn('Candidate profile fetch notice:', e);
        }

        // Fetch past applications to extract distinct previously uploaded resumes
        try {
          const apps = await getCandidateApplications({ userId: user.uid, applicantEmail: user.email });
          const distinct = [];
          const seenUrls = new Set();
          if (userData?.resumeURL) seenUrls.add(userData.resumeURL);
          if (userData?.resume) seenUrls.add(userData.resume);

          apps.forEach((app) => {
            if (app.resume && !seenUrls.has(app.resume) && !app.resume.startsWith('profile://')) {
              seenUrls.add(app.resume);
              distinct.push({
                url: app.resume,
                companyName: app.companyName || 'Prior Job',
                appliedDate: app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString('en-IN') : 'Recent',
              });
            }
          });

          if (isMounted) {
            setPreviousResumes(distinct);
            // Default resume choice
            if (userData?.resumeURL || userData?.resume) {
              setResumeChoice('profile');
            } else if (distinct.length > 0) {
              setResumeChoice('saved');
              setSelectedPreviousResumeUrl(distinct[0].url);
            } else {
              setResumeChoice('upload');
            }
          }
        } catch (err) {
          console.warn('Failed to load past resumes:', err);
        }

        // Check duplicate application
        const existing = await checkExistingApplication(jobId, user.uid, user.email);
        if (existing && isMounted) {
          setAlreadyApplied(true);
          setExistingAppId(existing.id);
        }
      }
    };

    if (user) {
      checkCandidateState();
    }

    return () => {
      isMounted = false;
    };
  }, [user, userData, jobId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateResumeFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      setNewResumeFile(file);
      setResumeChoice('upload');
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to submit a job application.');
      navigate(`/login?returnUrl=/jobs/${jobId}/apply`, {
        state: { from: location, returnUrl: `/jobs/${jobId}/apply` },
      });
      return;
    }

    if (!applicantName || !applicantEmail) {
      setError('Please provide your name and email address.');
      return;
    }

    // Verify deadline
    if (job?.deadline) {
      const deadlineDate = new Date(job.deadline);
      if (deadlineDate < new Date()) {
        setError('The application deadline for this position has passed.');
        return;
      }
    }

    setSubmitting(true);
    setProgress(20);
    setError(null);

    try {
      let finalResumeURL = '';

      if (resumeChoice === 'profile') {
        finalResumeURL = userData?.resumeURL || userData?.resume || '';
      } else if (resumeChoice === 'saved') {
        finalResumeURL = selectedPreviousResumeUrl || '';
      } else if (resumeChoice === 'digital') {
        finalResumeURL = 'profile://digital-cv';
      }

      // If user uploaded a new resume specifically for this job
      if (resumeChoice === 'upload' && newResumeFile && user?.uid) {
        try {
          setProgress(40);
          const uploadRes = await uploadCandidateResume(user.uid, newResumeFile, (pct) => {
            setProgress(30 + Math.round(pct * 0.4)); // scale from 30 to 70%
          });
          finalResumeURL = uploadRes.downloadURL;

          // Auto-save newly uploaded resume into user profile so they never have to upload again
          try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              resumeURL: finalResumeURL,
              resume: finalResumeURL,
              resumeName: newResumeFile.name,
              resumeUploadedAt: serverTimestamp(),
            });
          } catch (profErr) {
            console.warn('Auto-save to profile notice:', profErr);
          }
        } catch (uploadErr) {
          console.error('Resume upload error:', uploadErr);
          setError('Failed to upload resume: ' + uploadErr.message);
          setSubmitting(false);
          return;
        }
      }

      if (!finalResumeURL) {
        setError('Please select or upload a resume, or choose to apply with your completed digital profile.');
        setSubmitting(false);
        return;
      }

      setProgress(80);

      const applicationPayload = {
        jobId: job.id,
        companyId: job.companyId || job.userId || 'company',
        companyName: job.companyName || 'Verified Partner',
        clientCompanyName: job.clientCompanyName || null,
        clientCompanyLocation: job.clientCompanyLocation || null,
        jobPosition: job.position,
        location: job.location || 'India',
        userId: user.uid,
        applicantName,
        applicantEmail,
        applicantPhone,
        resume: finalResumeURL,
        notes,
        experienceYears,
        noticePeriod,
      };

      const result = await submitJobApplication(applicationPayload);

      if (!result.success) {
        if (result.isDuplicate) {
          setAlreadyApplied(true);
          setExistingAppId(result.existingId);
          setError(result.error);
        } else {
          setError(result.error || 'Failed to submit application.');
        }
        setSubmitting(false);
        return;
      }

      setProgress(100);

      // Navigate to dedicated success confirmation screen
      navigate('/application-success', {
        state: {
          applicationId: result.id,
          jobPosition: job.position,
          companyName: job.companyName,
          clientCompanyName: job.clientCompanyName || null,
          applicantName,
          applicantEmail,
        },
        replace: true,
      });
    } catch (err) {
      console.error('Application submission error:', err);
      setError(err.message || 'An error occurred while submitting your application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJob || authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-600 text-xs">
        Loading job opening and application form...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center py-20 px-4">
        <div className="glass-surface-2 p-8 rounded-3xl border border-slate-200 text-center max-w-md bg-white">
          <FaExclamationTriangle className="text-3xl text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Job Opening Not Found</h2>
          <p className="text-xs text-slate-600 mb-6">
            The job listing you are trying to apply for may have expired or was removed.
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/jobs')}>
            Browse Active Jobs
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center py-20 px-4">
        <div className="glass-surface-2 p-8 rounded-3xl border border-slate-200 text-center max-w-md bg-white shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 text-2xl">
            <FaLock />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in Required to Apply</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            You must be signed in with a candidate account to apply for <span className="font-semibold text-slate-900">{job.position}</span> at {job.companyName}.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                navigate(`/login?returnUrl=/jobs/${jobId}/apply`, {
                  state: { from: location, returnUrl: `/jobs/${jobId}/apply` },
                })
              }
            >
              Sign In to Apply
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/signup')}
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if deadline passed
  const isDeadlinePassed = job.deadline ? new Date(job.deadline) < new Date() : false;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 mask-radial pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-6">
        
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
        >
          <FaArrowLeft className="text-[10px]" />
          <span>Back to Job Opening</span>
        </button>

        {/* Job Header Card */}
        <div className="glass-surface-3 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 inline-block mb-2">
                Official Job Application
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                {job.position}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                {job.clientCompanyName ? (
                  <>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FaBuilding className="text-indigo-600" />
                      <span>Hiring For: {job.clientCompanyName}</span>
                    </span>
                    <span className="text-slate-400 font-medium">
                      (via {job.companyName})
                    </span>
                  </>
                ) : (
                  <span className="font-semibold text-indigo-600 flex items-center gap-1.5">
                    <FaBuilding />
                    <span>{job.companyName}</span>
                  </span>
                )}
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-slate-400" />
                  <span>{job.location || 'India'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <FaBriefcase className="text-slate-400" />
                  <span>{job.jobType || 'Full Time'}</span>
                </span>
              </div>
            </div>

            {job.salaryFrom && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Compensation</span>
                <span className="text-sm font-bold text-slate-900">
                  ₹{Number(job.salaryFrom).toLocaleString('en-IN')}{job.salaryTo ? ` - ₹${Number(job.salaryTo).toLocaleString('en-IN')}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notice If Deadline Expired */}
        {isDeadlinePassed && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
            <FaClock className="text-rose-600 text-base flex-shrink-0" />
            <span>The deadline for this job opening has expired. Applications are no longer accepted.</span>
          </div>
        )}

        {/* Notice If Already Applied */}
        {alreadyApplied ? (
          <div className="glass-surface-3 p-8 rounded-3xl border border-indigo-200 bg-indigo-50/50 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl mx-auto">
              <FaCheckCircle />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              You Have Already Applied for This Position
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your resume and profile credentials have already been submitted to the recruitment queue of {job.companyName}.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              {existingAppId && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/candidate/applications/${existingAppId}`)}
                >
                  View Application Timeline
                </Button>
              )}
              <Button variant="outline" size="md" onClick={() => navigate('/jobs')}>
                Explore Other Jobs
              </Button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <div className="glass-surface-3 p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl bg-white/95">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 font-display">Candidate Contact Details</h3>
                <p className="text-xs text-slate-500">Auto-filled from your verified candidate profile.</p>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                    <input
                      type="email"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      required
                      placeholder="rahul@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Phone / WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                    <input
                      type="tel"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      required
                      placeholder="+91 9876543210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Total Relevant Experience (Years)
                  </label>
                  <input
                    type="text"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="e.g. 3.5 Years"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Notice Period */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Notice Period / Availability to Join
                </label>
                <select
                  value={noticePeriod}
                  onChange={(e) => setNoticePeriod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
                >
                  <option value="Immediate / 15 Days">Immediate / Within 15 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="60 Days">60 Days</option>
                  <option value="90 Days">90 Days</option>
                  <option value="Serving Notice Period">Currently Serving Notice Period</option>
                </select>
              </div>

              {/* Resume Selection / Auto-Load / Digital Profile */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Choose Application Resume <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">Auto-loaded from your account</span>
                </div>

                {/* Option 1: Saved Profile Resume (Active CV) */}
                {(userData?.resumeURL || userData?.resume) && (
                  <div
                    onClick={() => {
                      setResumeChoice('profile');
                      setNewResumeFile(null);
                    }}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      resumeChoice === 'profile'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-lg shrink-0">
                        <FaFilePdf />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 block font-display">
                            {userData?.resumeName || 'Primary Profile Resume.pdf'}
                          </span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            Saved in Profile
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Pre-verified document attached to your candidate account
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-xl transition ${
                      resumeChoice === 'profile' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {resumeChoice === 'profile' ? 'Selected' : 'Use This'}
                    </span>
                  </div>
                )}

                {/* Option 2: Previously Used Resumes from prior applications */}
                {previousResumes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <FaHistory className="text-slate-400" />
                      <span>Resumes Used in Previous Applications:</span>
                    </span>
                    <div className="space-y-2">
                      {previousResumes.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setResumeChoice('saved');
                            setSelectedPreviousResumeUrl(p.url);
                            setNewResumeFile(null);
                          }}
                          className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                            resumeChoice === 'saved' && selectedPreviousResumeUrl === p.url
                              ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <FaFilePdf className="text-rose-500 text-base shrink-0" />
                            <div>
                              <span className="font-bold text-slate-900 block">
                                Resume submitted to {p.companyName}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Applied on {p.appliedDate}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                            resumeChoice === 'saved' && selectedPreviousResumeUrl === p.url
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {resumeChoice === 'saved' && selectedPreviousResumeUrl === p.url ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Option 3: Don't have a resume? Complete profile to build digital resume */}
                {(!userData?.resumeURL && !userData?.resume) && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-slate-50 border border-indigo-200/80 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
                        <FaGraduationCap />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          Don't have a PDF / Word Resume yet?
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          Complete your profile with education, skills, and work history. The portal will automatically format your profile into a verified Digital Resume for recruiters.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <Link
                        to="/candidate/profile"
                        target="_blank"
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Complete Profile / Build Resume</span>
                        <FaExternalLinkAlt className="text-[9px]" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setResumeChoice('digital');
                          setNewResumeFile(null);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                          resumeChoice === 'digital'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {resumeChoice === 'digital' ? '✓ Profile Selected as Digital CV' : 'Apply with Completed Digital Profile'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Option 4: Upload New Resume file (Saved automatically to profile) */}
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-5 text-center bg-slate-50/50 hover:bg-indigo-50/10 transition relative cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {newResumeFile ? (
                    <div className="flex items-center justify-center gap-2 text-indigo-700 text-xs font-bold">
                      <FaFilePdf className="text-rose-500 text-lg" />
                      <span>{newResumeFile.name}</span>
                      <span className="text-slate-500 font-normal">
                        ({(newResumeFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-medium">
                        Will be saved to your profile
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <FaFileUpload className="mx-auto text-slate-400 text-xl mb-1" />
                      <p className="text-xs font-bold text-slate-700">
                        {userData?.resumeURL ? 'Or upload a new resume file (Auto-saves to your profile)' : 'Upload a resume document (PDF, DOC, DOCX up to 10MB)'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Once uploaded, it remains safely saved in your profile so you never have to re-upload.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Note */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Cover Letter / Note to Hiring Team (Optional)
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share a brief pitch highlighting your key projects, accomplishments, or motivations..."
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <FaExclamationTriangle className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {submitting && (
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-right text-[11px] text-slate-500">Transmitting credentials securely... {progress}%</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                disabled={isDeadlinePassed}
                className="w-full font-bold shadow-md shadow-indigo-500/10 text-base"
              >
                Submit Official Application
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                <FaShieldAlt className="text-emerald-500" />
                <span>Your resume and contact information are protected by ZenSolve privacy policies.</span>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default JobApplyPage;
