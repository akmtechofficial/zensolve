import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import {
  uploadCandidateResume,
  uploadCandidatePhoto,
  validateResumeFile,
  validateLogoFile,
  MAX_RESUME_SIZE_MB,
} from '../services/storageService';
import {
  getCandidateProfile,
  saveCandidateProfile,
  checkExistingApplication,
  submitJobApplication,
} from '../services/recruitmentService';
import { notifyCompanyOfApplication } from '../services/emailService';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaFileUpload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFilePdf,
  FaSpinner,
  FaBuilding,
  FaArrowLeft,
  FaLock,
  FaCamera,
  FaEdit,
  FaSave,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaIdBadge,
  FaTags,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import { Button } from './ui/Button';
import { useAuth } from './useAuth';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE_MB = 10;

const ApplyJob = ({ job: propJob, onSuccess }) => {
  const { user, userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const job = propJob || location.state?.job;

  const [applicantName, setApplicantName] = useState(user?.displayName || userData?.displayName || '');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || '');
  const [applicantPhone, setApplicantPhone] = useState(userData?.phone || '');
  const [resume, setResume] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [checkingApplied, setCheckingApplied] = useState(true);
  const [existingAppId, setExistingAppId] = useState(null);

  // Digital Profile states
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || userData?.displayName || '',
    email: user?.email || '',
    phone: userData?.phone || '',
    location: userData?.location || '',
    headline: userData?.headline || '',
    bio: userData?.bio || '',
    skills: userData?.skills || [],
    languages: userData?.languages || [],
    education: userData?.education || [],
    experience: userData?.experience || [],
    photoURL: user?.photoURL || userData?.photoURL || '',
    resumeURL: userData?.resumeURL || '',
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const photoInputRef = useRef(null);

  // Load complete candidate profile from Firestore
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const p = await getCandidateProfile(user.uid);
          if (p && isMounted) {
            setProfileData({
              displayName: p.displayName || user.displayName || '',
              email: p.email || user.email || '',
              phone: p.phone || userData?.phone || '',
              location: p.location || userData?.location || '',
              headline: p.headline || userData?.headline || '',
              bio: p.bio || userData?.bio || '',
              skills: Array.isArray(p.skills) ? p.skills : (userData?.skills || []),
              languages: Array.isArray(p.languages) ? p.languages : (userData?.languages || []),
              education: Array.isArray(p.education) ? p.education : (userData?.education || []),
              experience: Array.isArray(p.experience) ? p.experience : (userData?.experience || []),
              photoURL: p.photoURL || user.photoURL || userData?.photoURL || '',
              resumeURL: p.resumeURL || userData?.resumeURL || '',
            });

            if (p.displayName) setApplicantName(p.displayName);
            if (p.email) setApplicantEmail(p.email);
            if (p.phone) setApplicantPhone(p.phone);
          }
        } catch (e) {
          console.warn('Failed to load candidate profile:', e);
        }
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user, userData]);

  useEffect(() => {
    if (user) {
      if (!applicantName) setApplicantName(user.displayName || userData?.displayName || '');
      if (!applicantEmail) setApplicantEmail(user.email || '');
      if (!applicantPhone && userData?.phone) setApplicantPhone(userData.phone);
    }
  }, [user, userData, applicantName, applicantEmail, applicantPhone]);

  useEffect(() => {
    let isMounted = true;
    const verifyApplicationStatus = async () => {
      if (user?.uid && job?.id) {
        setCheckingApplied(true);
        try {
          const existing = await checkExistingApplication(job.id, user.uid, user.email);
          if (isMounted) {
            if (existing) {
              setAlreadyApplied(true);
              setExistingAppId(existing.id);
            } else {
              setAlreadyApplied(false);
            }
          }
        } catch (err) {
          console.warn('Error checking application status:', err);
        } finally {
          if (isMounted) setCheckingApplied(false);
        }
      } else if (isMounted) {
        setCheckingApplied(false);
      }
    };

    verifyApplicationStatus();
    return () => {
      isMounted = false;
    };
  }, [user?.uid, user?.email, job?.id]);

  if (!job) {
    return (
      <div className="py-12 text-center text-slate-300">
        <p className="mb-4">No job position specified for application.</p>
        <Button variant="primary" size="md" onClick={() => navigate('/jobs')}>
          Explore Jobs
        </Button>
      </div>
    );
  }

  // Strictly enforce sign-in before allowing any user to apply
  if (!user) {
    return (
      <div className="py-8 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 text-2xl">
          <FaLock />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">Sign In Required to Apply</h3>
        <p className="text-xs text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
          You must be logged in to apply for <span className="font-semibold text-slate-800">{job.position}</span> at {job.companyName}.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              navigate(`/login?returnUrl=/jobs/${job.id}/apply`, {
                state: { from: location, returnUrl: `/jobs/${job.id}/apply` },
              });
            }}
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
    );
  }

  // Handle Profile Photo Upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    setError(null);
    setUploadingPhoto(true);

    try {
      const res = await uploadCandidatePhoto(user.uid, file);
      const newPhotoURL = res.downloadURL;

      setProfileData((prev) => ({ ...prev, photoURL: newPhotoURL }));
      await saveCandidateProfile(user.uid, { photoURL: newPhotoURL });
    } catch (err) {
      console.error('Candidate photo upload error:', err);
      setError(err.message || 'Failed to upload profile photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Save Inline Profile Edits to Firestore
  const handleSaveProfileEdit = async () => {
    if (!user?.uid) return;
    setSavingProfile(true);
    setError(null);

    try {
      const updatedProfile = {
        displayName: applicantName,
        phone: applicantPhone,
        location: profileData.location,
        headline: profileData.headline,
        bio: profileData.bio,
        skills: profileData.skills,
      };

      await saveCandidateProfile(user.uid, updatedProfile);
      setProfileData((prev) => ({
        ...prev,
        ...updatedProfile,
      }));
      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 2500);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Error saving candidate profile:', err);
      setError('Could not update profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateResumeFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      setResume(file);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      const validation = validateResumeFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      setResume(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) {
      setError('You must be signed in to submit a job application.');
      navigate(`/login?returnUrl=/jobs/${job.id}/apply`, {
        state: { from: location, returnUrl: `/jobs/${job.id}/apply` },
      });
      return;
    }

    if (!applicantName || !applicantEmail) {
      setError('Please provide your name and email address.');
      return;
    }

    // 1. Strict Duplicate Check before processing any files
    const existing = await checkExistingApplication(job.id, user.uid, applicantEmail || user.email);
    if (existing) {
      setAlreadyApplied(true);
      setExistingAppId(existing.id);
      setError('Aap iss job ke liye pehle hi apply kar chuke hain. Ek candidate ek job par sirf ek baar apply kar sakta hai.');
      return;
    }

    setIsSubmitting(true);
    setProgress(20);
    setError(null);

    try {
      let resumeURL = '';
      const effectiveUid = user.uid;

      if (resume) {
        try {
          setProgress(40);
          const uploadRes = await uploadCandidateResume(effectiveUid, resume, (pct) => {
            setProgress(30 + Math.round(pct * 0.4));
          });
          resumeURL = uploadRes.downloadURL;
          // Auto-save uploaded resume to candidate profile
          await saveCandidateProfile(effectiveUid, { resumeURL });
        } catch (storageErr) {
          console.warn('Storage upload note:', storageErr);
          resumeURL = `Uploaded: ${resume.name}`;
        }
      } else if (profileData.resumeURL) {
        resumeURL = profileData.resumeURL;
      } else {
        resumeURL = 'DIGITAL_PROFILE_CV';
      }

      setProgress(80);

      // Submit application with server-level deduplication
      const appResult = await submitJobApplication({
        jobId: job.id,
        companyId: job.companyId || job.userId || 'company',
        applicantName,
        applicantEmail,
        applicantPhone,
        applicantPhoto: profileData.photoURL || user.photoURL || '',
        applicantLocation: profileData.location || '',
        applicantHeadline: profileData.headline || '',
        applicantSkills: profileData.skills || [],
        applicantBio: profileData.bio || '',
        resume: resumeURL,
        isDigitalProfile: !resume && resumeURL === 'DIGITAL_PROFILE_CV',
        profileSnapshot: {
          displayName: applicantName,
          email: applicantEmail,
          phone: applicantPhone,
          location: profileData.location || '',
          headline: profileData.headline || '',
          bio: profileData.bio || '',
          skills: profileData.skills || [],
          languages: profileData.languages || [],
          photoURL: profileData.photoURL || user.photoURL || '',
        },
        notes,
        jobPosition: job.position,
        companyName: job.companyName,
        userId: user.uid,
        languages: profileData.languages || [],
      });

      if (!appResult.success) {
        if (appResult.isDuplicate) {
          setAlreadyApplied(true);
          setExistingAppId(appResult.existingId);
        }
        setError(appResult.error || 'Failed to submit application.');
        setIsSubmitting(false);
        return;
      }

      setAlreadyApplied(true);
      setExistingAppId(appResult.id);

      // Keep user profile fresh with submitted phone & name
      await saveCandidateProfile(user.uid, {
        displayName: applicantName,
        phone: applicantPhone,
      });

      // Send email alert to the company (with direct link to company panel)
      notifyCompanyOfApplication({
        job,
        applicantName,
        applicantEmail,
        applicantPhone,
        isDigitalProfile: !resume && resumeURL === 'DIGITAL_PROFILE_CV',
        notes,
      }).catch((mailErr) => {
        console.warn('Company email notification background note:', mailErr);
      });

      setProgress(100);

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/thank-you', {
          state: {
            applicantName,
            applicantEmail,
            jobPosition: job.position,
            companyName: job.companyName,
          },
        });
      }
    } catch (err) {
      console.error('Application submission error:', err);
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingApplied) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
        <FaSpinner className="animate-spin text-2xl text-indigo-600" />
        <span className="text-xs font-semibold">Checking application records...</span>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="w-full text-center space-y-4 py-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-left">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Position</span>
            <span className="text-base font-bold text-slate-900">{job.position}</span>
            <span className="text-xs text-indigo-600 font-medium block mt-0.5">
              {job.clientCompanyName ? `${job.clientCompanyName} (via ${job.companyName})` : job.companyName}
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
            <FaCheckCircle className="text-emerald-600" />
            Applied
          </span>
        </div>

        <div className="p-8 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto shadow-xs">
            <FaCheckCircle />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">
            Application Already Submitted
          </h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            Aap iss job opening (<strong>{job.position}</strong>) ke liye pehle hi apply kar chuke hain. Ek candidate ek job par sirf ek baar apply kar sakta hai.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
              <FaCheckCircle className="text-emerald-600" />
              <span>Status: Application Under Review</span>
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              if (onSuccess) onSuccess();
              else navigate('/jobs');
            }}
          >
            Explore More Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Target Role Header Pill */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-semibold block">Applying for position</span>
          <span className="text-base font-bold text-slate-900">{job.position}</span>
          <span className="text-xs text-indigo-600 font-medium block mt-0.5">
            {job.clientCompanyName ? `${job.clientCompanyName} (via ${job.companyName})` : job.companyName} • {job.location || 'India'}
          </span>
        </div>
      </div>

      {/* Prominent Banner: No resume! No worries Your profile will be your resume */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200/90 mb-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 mt-0.5">
            <FaIdBadge />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-extrabold text-indigo-950 font-display">
                No resume? No worries! Your profile will be your resume.
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-extrabold border border-indigo-200">
                Digital CV Enabled
              </span>
            </div>
            <p className="text-xs text-indigo-800 leading-relaxed mt-1">
              Recruiters evaluate your application using your verified ZenSolve Profile. Review your details below before submitting.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        
        {/* Digital Profile Card: Non-editable by default with Edit Profile Button & Photo Option */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative">
          
          {/* Card Header & Edit Toggle */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Digital Profile CV Details
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md">
                {isEditingProfile ? 'Editing Mode' : 'Read-only / Verified'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isEditingProfile) {
                  handleSaveProfileEdit();
                } else {
                  setIsEditingProfile(true);
                }
              }}
              disabled={savingProfile}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                isEditingProfile
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              {savingProfile ? (
                <>
                  <FaSpinner className="animate-spin text-xs" />
                  <span>Saving...</span>
                </>
              ) : isEditingProfile ? (
                <>
                  <FaSave className="text-xs" />
                  <span>Save & Lock</span>
                </>
              ) : (
                <>
                  <FaEdit className="text-xs" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>

          {profileSavedMsg && (
            <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <FaCheckCircle className="text-emerald-600 flex-shrink-0" />
              <span>Profile details updated and saved successfully!</span>
            </div>
          )}

          {/* Profile Header: Avatar + Photo Upload Option + Basic Details */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            
            {/* Profile Photo with Upload Trigger */}
            <div className="relative group shrink-0 self-start sm:self-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-indigo-100 overflow-hidden flex items-center justify-center font-bold text-indigo-600 text-xl shadow-xs">
                {profileData.photoURL ? (
                  <img
                    src={profileData.photoURL}
                    alt={applicantName || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{(applicantName || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Upload photo camera button overlay */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Upload or change profile photo"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md text-[11px] transition cursor-pointer"
              >
                {uploadingPhoto ? <FaSpinner className="animate-spin" /> : <FaCamera />}
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-slate-900">
                  {applicantName || 'Candidate Name'}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Profile Active
                </span>
              </div>
              <p className="text-xs text-indigo-700 font-medium mt-0.5">
                {profileData.headline || 'Verified ZenSolve Candidate'}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <FaEnvelope className="text-[10px] text-slate-400" />
                  <span>{applicantEmail}</span>
                </span>
                <span className="flex items-center gap-1">
                  <FaPhone className="text-[10px] text-slate-400" />
                  <span>{applicantPhone || 'No phone provided'}</span>
                </span>
                {profileData.location && (
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-[10px] text-slate-400" />
                    <span>{profileData.location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Non-Editable Details Display (When NOT editing) */}
          {!isEditingProfile ? (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              
              {/* Skills */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <FaTags className="text-indigo-600 text-[10px]" />
                  <span>Skills & Core Competencies</span>
                </span>
                {Array.isArray(profileData.skills) && profileData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profileData.skills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/80">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No skills specified yet. Click 'Edit Profile' to add skills.</p>
                )}
              </div>

              {/* Bio / Summary */}
              {profileData.bio && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-800 block mb-0.5">About Candidate:</span>
                  {profileData.bio}
                </div>
              )}
            </div>
          ) : (
            /* Inline Edit Mode Form (When isEditingProfile is TRUE) */
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-indigo-900 block">
                Update Profile Information (Saved to your account):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Phone / WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Professional Headline / Role
                  </label>
                  <input
                    type="text"
                    value={profileData.headline}
                    onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                    placeholder="e.g. Retail Sales Associate | Graduate"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Location (City / State)
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="e.g. Jamshedpur, Jharkhand"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(profileData.skills) ? profileData.skills.join(', ') : ''}
                  onChange={(e) => {
                    const parsed = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                    setProfileData({ ...profileData, skills: parsed });
                  }}
                  placeholder="e.g. Customer Relationship, MS Excel, Communication, Sales"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Brief Bio / Summary
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows="2"
                  placeholder="Short summary of your strengths and interests..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfileEdit}
                  disabled={savingProfile}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  {savingProfile ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  <span>Save Profile</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Optional Collapsible: Attach File Resume PDF instead */}
        <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-2">
              <FaFilePdf className="text-rose-500" />
              <span>Want to attach a PDF / DOC resume file as well? (Optional)</span>
            </div>
            {showFileUpload ? <FaChevronUp className="text-slate-400" /> : <FaChevronDown className="text-slate-400" />}
          </button>

          {showFileUpload && (
            <div className="p-4 pt-2 border-t border-slate-100 bg-slate-50/50">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-5 text-center bg-white transition cursor-pointer relative"
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {resume ? (
                  <div className="flex items-center justify-center gap-2 text-indigo-700 font-semibold text-xs">
                    <FaFilePdf size={16} className="text-rose-500" />
                    <span>{resume.name}</span>
                    <span className="text-slate-400">
                      ({(resume.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <FaFileUpload className="mx-auto text-indigo-500 text-xl mb-1" />
                    <p className="text-xs font-semibold text-slate-800">
                      Drag and drop your resume file here, or <span className="text-indigo-600 underline">browse</span>
                    </p>
                    <p className="text-[10px] text-slate-400">PDF, DOC, DOCX up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Optional Cover Note */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Brief Pitch / Cover Note (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            placeholder="Highlight why your skills make you an ideal fit for this role..."
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <FaExclamationTriangle className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSubmitting && (
          <div className="space-y-1.5">
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-right text-[11px] text-slate-500">Uploading credentials... {progress}%</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="w-full font-bold shadow-md shadow-indigo-500/10 text-sm py-3 rounded-xl"
        >
          Submit Official Application
        </Button>
      </form>
    </div>
  );
};

export default ApplyJob;
