import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../components/useAuth';
import {
  getJobById,
  getCandidateProfile,
  submitJobApplication,
  checkExistingApplication,
} from '../../services/recruitmentService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebaseConfig';
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
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [newResumeFile, setNewResumeFile] = useState(null);
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

  // 3. Prefill candidate info and check duplicate
  useEffect(() => {
    const checkCandidateState = async () => {
      if (user?.uid && jobId) {
        // Prefill form
        setApplicantName(userData?.displayName || user.displayName || '');
        setApplicantEmail(user.email || '');
        setApplicantPhone(userData?.phone || '');

        // Check duplicate application
        const existing = await checkExistingApplication(jobId, user.uid, user.email);
        if (existing) {
          setAlreadyApplied(true);
          setExistingAppId(existing.id);
        }
      }
    };

    if (user) {
      checkCandidateState();
    }
  }, [user, userData, jobId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
        setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        return;
      }
      setNewResumeFile(file);
      setUseProfileResume(false);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      let finalResumeURL = userData?.resumeURL || userData?.resume || '';

      // If user uploaded a new resume specifically for this job
      if (newResumeFile) {
        try {
          const timestamp = Date.now();
          const cleanName = newResumeFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const storageRef = ref(storage, `resumes/${user.uid}/${timestamp}_${cleanName}`);
          await uploadBytes(storageRef, newResumeFile);
          setProgress(60);
          finalResumeURL = await getDownloadURL(storageRef);
        } catch (uploadErr) {
          console.warn('Storage fallback:', uploadErr);
          finalResumeURL = `Uploaded: ${newResumeFile.name}`;
        }
      }

      setProgress(80);

      const applicationPayload = {
        jobId: job.id,
        companyId: job.companyId || job.userId || 'company',
        companyName: job.companyName || 'Verified Partner',
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
                <span className="font-semibold text-indigo-600 flex items-center gap-1.5">
                  <FaBuilding />
                  <span>{job.companyName}</span>
                </span>
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

              {/* Resume Selection / Upload */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <label className="text-xs font-semibold text-slate-700 block">
                  Select Resume / CV Attachment <span className="text-rose-500">*</span>
                </label>

                {userData?.resumeURL && (
                  <div
                    onClick={() => {
                      setUseProfileResume(true);
                      setNewResumeFile(null);
                    }}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      useProfileResume
                        ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FaFilePdf className="text-rose-500 text-xl" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Use Saved Profile Resume ({userData?.resumeName || 'Primary_Resume.pdf'})
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Pre-verified document attached to your ZenSolve account
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600">
                      {useProfileResume ? 'Selected' : 'Select'}
                    </span>
                  </div>
                )}

                {/* Upload alternative */}
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-2xl p-6 text-center bg-slate-50/50 relative cursor-pointer">
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
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <FaFileUpload className="mx-auto text-slate-400 text-xl mb-1" />
                      <p className="text-xs font-bold text-slate-700">
                        Or upload a customized resume for this position
                      </p>
                      <p className="text-[11px] text-slate-500">PDF, DOC, DOCX up to 10MB</p>
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
