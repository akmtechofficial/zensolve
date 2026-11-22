import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { createJob, updateJob, getJobById } from '../../services/recruitmentService';
import { Button } from '../../components/ui/Button';
import JobCard from '../../components/JobCard';
import {
  FaCheckCircle,
  FaBriefcase,
  FaEye,
  FaLock,
  FaExclamationTriangle,
  FaUpload,
  FaPlus,
  FaTrash,
  FaEdit,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaCalendarAlt,
  FaBullseye,
  FaMoneyBillWave,
  FaShieldAlt,
  FaTags,
} from 'react-icons/fa';
import { useAuth } from '../../components/useAuth';
import ResendApprovalReminder from '../../components/ResendApprovalReminder';
import { uploadCompanyLogo, validateLogoFile, MAX_LOGO_SIZE_KB } from '../../services/storageService';

const categories = [
  'IT & Software',
  'Finance',
  'Healthcare',
  'Business & Sales',
  'Education',
  'Construction',
  'Logistics & Delivery',
  'Teaching',
  'Manufacturing & Industrial',
  'Customer Support & BPO',
  'Retail & Field Operations',
  'Hospitality & Security',
  'Others',
];

const WORK_MODES = [
  'In-Office / On-site',
  'Work from Home / Remote',
  'Hybrid',
  'Field Job / On-ground',
];

const WEEKDAY_OPTIONS = [
  '5 Days (Mon - Fri)',
  '6 Days (Mon - Sat)',
  '6 Days (Rotational Off)',
  'Rotational Shifts (24/7)',
  'Flexible / Shift-based',
];

const QUALIFICATIONS = [
  'No Minimum Education Required',
  '10th Pass',
  '12th Pass / Intermediate',
  'ITI / Diploma',
  'Graduate (Any Stream)',
  'B.Tech / B.E / BCA / Technical',
  'Post Graduate (MBA / MCA / M.Tech)',
  'Doctorate / Specialized Professional',
];

const TARGET_TYPES = [
  'No Target (Fixed Salary)',
  'Calls / Telecalling Target',
  'Sales / Revenue Target',
  'Field Visits / Client Meetings',
  'Deliveries / Pickups Target',
  'Data Entry / Production Units',
  'Custom Performance Target',
];

const FEE_TYPES = [
  '100% Free (No Registration Fees)',
  'Paid Registration / Application Fee',
  'Refundable Security Deposit',
];

const DashboardPostJob = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const location = useLocation();
  const { user, userData, isApprovedCompany } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const resolvedJobId = jobId || queryParams.get('id') || queryParams.get('edit');
  const isEditing = Boolean(resolvedJobId);

  const [loadingJob, setLoadingJob] = useState(isEditing);

  const [formData, setFormData] = useState({
    position: '',
    // Agency name — auto-filled from HR profile, read-only
    companyName: userData?.companyName || userData?.companyData?.companyName || '',
    companyLogo: userData?.logo || userData?.companyData?.logo || '',
    // The actual client company where the vacancy exists
    clientCompanyName: '',
    clientCompanyLocation: '',
    category: 'IT & Software',
    customCategory: '',
    jobType: 'Full-time',
    workMode: 'In-Office / On-site',
    weekdays: '6 Days (Mon - Sat)',
    qualification: '12th Pass / Intermediate',
    dailyTarget: 'No Target (Fixed Salary)',
    dailyTargetDetails: '',
    registrationFeeType: '100% Free (No Registration Fees)',
    registrationFeeAmount: '',
    registrationFeeNote: '',
    location: userData?.location || userData?.companyData?.location || '',
    vacancies: '1',
    salaryFrom: '',
    salaryTo: '',
    experience: '1-3 Years',
    description: '',
    requirements: '',
  });

  const [locationsList, setLocationsList] = useState([
    { city: userData?.location || '', seats: '1' }
  ]);

  // Load existing job details when in Edit mode
  useEffect(() => {
    if (!resolvedJobId) return;

    let isMounted = true;
    const loadJobDetails = async () => {
      setLoadingJob(true);
      try {
        let existing = location.state?.job;
        if (!existing) {
          existing = await getJobById(resolvedJobId);
        }

        if (existing && isMounted) {
          let parsedLocations = [];
          if (Array.isArray(existing.locationsList) && existing.locationsList.length > 0) {
            parsedLocations = existing.locationsList;
          } else if (existing.location) {
            parsedLocations = [{ city: existing.location, seats: String(existing.vacancies || 1) }];
          } else {
            parsedLocations = [{ city: '', seats: '1' }];
          }

          const isStandardCategory = categories.filter((c) => c !== 'Others').includes(existing.category);

          setFormData({
            position: existing.position || '',
            companyName: existing.companyName || userData?.companyName || userData?.companyData?.companyName || '',
            companyLogo: existing.companyLogo || userData?.logo || userData?.companyData?.logo || '',
            clientCompanyName: existing.clientCompanyName || '',
            clientCompanyLocation: existing.clientCompanyLocation || '',
            category: isStandardCategory ? existing.category : 'Others',
            customCategory: isStandardCategory ? '' : (existing.customCategory || existing.category || ''),
            jobType: existing.jobType || 'Full-time',
            workMode: existing.workMode || 'In-Office / On-site',
            weekdays: existing.weekdays || '6 Days (Mon - Sat)',
            qualification: existing.qualification || '12th Pass / Intermediate',
            dailyTarget: existing.dailyTarget || 'No Target (Fixed Salary)',
            dailyTargetDetails: existing.dailyTargetDetails || '',
            registrationFeeType: existing.registrationFeeType || '100% Free (No Registration Fees)',
            registrationFeeAmount: existing.registrationFeeAmount || '',
            registrationFeeNote: existing.registrationFeeNote || '',
            location: existing.location || '',
            vacancies: String(existing.vacancies || 1),
            salaryFrom: existing.salaryFrom && existing.salaryFrom !== 'Not specified' ? String(existing.salaryFrom) : '',
            salaryTo: existing.salaryTo && existing.salaryTo !== 'Not specified' ? String(existing.salaryTo) : '',
            experience: existing.experience || '1-3 Years',
            description: existing.description || '',
            requirements: existing.requirements || '',
          });
          setLocationsList(parsedLocations);
        }
      } catch (err) {
        console.error('Error fetching job to edit:', err);
        setError('Failed to load job details: ' + err.message);
      } finally {
        if (isMounted) setLoadingJob(false);
      }
    };

    loadJobDetails();
    return () => {
      isMounted = false;
    };
  }, [resolvedJobId]);

  const handleAddLocation = () => {
    setLocationsList((prev) => [...prev, { city: '', seats: '1' }]);
  };

  const handleRemoveLocation = (index) => {
    setLocationsList((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : [{ city: '', seats: '1' }];
    });
  };

  const handleLocationItemChange = (index, field, value) => {
    setLocationsList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      const validCities = updated.filter((item) => item.city && item.city.trim());
      const totalSeats = updated.reduce((acc, curr) => acc + (Number(curr.seats) || 0), 0);
      
      if (totalSeats > 0) {
        setFormData((f) => ({
          ...f,
          vacancies: String(totalSeats),
          location: validCities.length > 0 
            ? validCities.map((c) => `${c.city.trim()}${c.seats ? ` (${c.seats} seats)` : ''}`).join(', ') 
            : f.location,
        }));
      }
      return updated;
    });
  };

  useEffect(() => {
    if (userData && !isEditing) {
      setFormData((prev) => ({
        ...prev,
        companyName: prev.companyName || userData.companyName || userData.companyData?.companyName || '',
        companyLogo: prev.companyLogo || userData.logo || userData.companyData?.logo || '',
        location: prev.location || userData.location || userData.companyData?.location || '',
      }));
      setLocationsList((prev) => {
        if (prev.length === 1 && !prev[0].city && userData?.location) {
          return [{ city: userData.location, seats: '1' }];
        }
        return prev;
      });
    }
  }, [userData, isEditing]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;

    const validation = validateLogoFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    setUploadingLogo(true);
    try {
      const res = await uploadCompanyLogo(user.uid, file);
      setFormData((prev) => ({ ...prev, companyLogo: res.downloadURL }));
    } catch (err) {
      console.error('Job logo upload error:', err);
      setError('Failed to upload logo: ' + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isApprovedCompany) {
      setError('Your company account is pending administrative approval. Unapproved companies cannot publish public jobs.');
      return;
    }

    if (!formData.position || !formData.clientCompanyName || (!formData.location && locationsList.length === 0)) {
      setError('Please fill in the Job Title, Client Company Name, and at least one Location.');
      return;
    }

    if (formData.category === 'Others' && !formData.customCategory?.trim()) {
      setError('Please specify the custom category name.');
      return;
    }

    const resolvedCategory = formData.category === 'Others'
      ? (formData.customCategory?.trim() || 'General / Others')
      : formData.category;

    const validLocations = locationsList.filter((l) => l.city && l.city.trim());
    const computedSeats = validLocations.length > 0 
      ? validLocations.reduce((acc, curr) => acc + (Number(curr.seats) || 0), 0)
      : (Number(formData.vacancies) || 1);

    const primaryLocation = validLocations.length > 0
      ? validLocations.map((l) => `${l.city.trim()}${l.seats ? ` (${l.seats} seats)` : ''}`).join(', ')
      : (formData.location || 'Pan India');

    setLoading(true);

    const payload = {
      ...formData,
      category: resolvedCategory,
      originalCategory: formData.category,
      customCategory: formData.customCategory || '',
      location: primaryLocation,
      locationsList: validLocations.length > 0 ? validLocations : [{ city: primaryLocation, seats: String(computedSeats) }],
      vacancies: computedSeats || 1,
      totalSeats: computedSeats || 1,
      workMode: formData.workMode || 'In-Office / On-site',
      weekdays: formData.weekdays || '6 Days (Mon - Sat)',
      qualification: formData.qualification || '12th Pass / Intermediate',
      dailyTarget: formData.dailyTarget || 'No Target (Fixed Salary)',
      dailyTargetDetails: formData.dailyTargetDetails || '',
      registrationFeeType: formData.registrationFeeType || '100% Free (No Registration Fees)',
      registrationFeeAmount: formData.registrationFeeAmount || '0',
      registrationFeeNote: formData.registrationFeeNote || '',
      requirements: formData.requirements || '',
      companyId: user?.uid || null,
      postedBy: user?.email || null,
      salaryFrom: formData.salaryFrom || 'Not specified',
      salaryTo: formData.salaryTo || 'Not specified',
    };

    let res;
    if (isEditing) {
      res = await updateJob(resolvedJobId, payload);
    } else {
      res = await createJob(payload);
    }

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/hr/jobs');
      }, 1500);
    } else {
      setError(res.error || (isEditing ? 'Failed to update job.' : 'Failed to publish job.'));
      setLoading(false);
    }
  };

  if (loadingJob) {
    return (
      <DashboardLayout
        title="Edit Job Opening"
        subtitle="Loading full position specifications..."
      >
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3 text-slate-600">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Loading job details for full-page editing...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={isEditing ? `Edit Job Opening` : "Post a New Job Opening"}
      subtitle={isEditing ? `Full-page editor: update position requirements, locations, salary and eligibility.` : "Publish an opportunity to reach verified candidates across India."}
    >
      {/* Top Banner when in Edit Mode */}
      {isEditing && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-indigo-50/90 border border-indigo-200 rounded-2xl mb-6 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <FaEdit />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-900">Full-Page Job Editor</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                  Live Editing Mode
                </span>
              </div>
              <p className="text-xs text-indigo-800 mt-0.5">
                Editing: <strong>{formData.position || 'Job Opening'}</strong> for hiring client <strong>{formData.clientCompanyName || 'Client'}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/hr/jobs')}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition self-start sm:self-auto shadow-xs"
          >
            Cancel & Back to Jobs
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="glass-surface-2 glass-specular p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-6 shadow-sm">
            
            {/* Section 1: Role Basics */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 font-display">
                <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold shadow-xs">1</span>
                <span>Role Fundamentals</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Job Position / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="e.g. Senior Frontend Architect"
                    required
                    className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>

                {/* Client Company block — manpower agency model */}
                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <p className="text-xs font-bold text-indigo-800">Client / Hiring Company Details</p>
                    <span className="ml-auto text-[10px] text-indigo-500 font-medium">Where the candidate will actually work</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Client Company Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="clientCompanyName"
                        value={formData.clientCompanyName}
                        onChange={handleChange}
                        placeholder="e.g. Infosys, Tata, Reliance…"
                        required
                        className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Client Company Location
                      </label>
                      <input
                        type="text"
                        name="clientCompanyLocation"
                        value={formData.clientCompanyLocation}
                        onChange={handleChange}
                        placeholder="e.g. Bengaluru, Mumbai…"
                        className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Your Agency Name <span className="text-slate-400 font-normal">(auto-filled)</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      readOnly
                      className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-slate-500 font-medium bg-slate-50 cursor-not-allowed"
                      title="Your registered agency name — cannot be changed here"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Company Logo
                      </label>
                      <span className="text-[10px] text-slate-400">Max {MAX_LOGO_SIZE_KB} KB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {formData.companyLogo ? (
                        <img
                          src={formData.companyLogo}
                          alt="Logo"
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <FaBriefcase className="text-xs" />
                        </div>
                      )}
                      <label className="cursor-pointer px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition flex items-center gap-1.5 border border-indigo-100 shrink-0">
                        <FaUpload className="text-xs" />
                        <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="url"
                        name="companyLogo"
                        value={formData.companyLogo}
                        onChange={handleChange}
                        placeholder="Or paste URL"
                        className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-slate-900 placeholder:text-slate-400 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Category, Work Mode & Weekdays */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm text-slate-900 font-medium cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c} className="bg-white text-slate-900">{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Work Mode <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="workMode"
                      value={formData.workMode}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm text-slate-900 font-medium cursor-pointer"
                    >
                      {WORK_MODES.map((mode) => (
                        <option key={mode} value={mode} className="bg-white text-slate-900">{mode}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Working Days <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="weekdays"
                      value={formData.weekdays}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm text-slate-900 font-medium cursor-pointer"
                    >
                      {WEEKDAY_OPTIONS.map((w) => (
                        <option key={w} value={w} className="bg-white text-slate-900">{w}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dynamic Input when Category is 'Others' */}
                {formData.category === 'Others' && (
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-1.5">
                    <label className="text-xs font-bold text-amber-900 block flex items-center gap-1.5">
                      <FaTags className="text-amber-600" />
                      <span>Specify Custom Category Name <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      name="customCategory"
                      value={formData.customCategory}
                      onChange={handleChange}
                      placeholder="e.g. Telecalling & BPO, Delivery Associate, Security Guard, Data Entry..."
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-amber-300 text-sm text-slate-900 font-medium focus:outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Job Commitment / Type
                    </label>
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm text-slate-900 font-medium cursor-pointer"
                    >
                      <option value="Full-time" className="bg-white text-slate-900">Full-time</option>
                      <option value="Part-time" className="bg-white text-slate-900">Part-time</option>
                      <option value="Remote" className="bg-white text-slate-900">Remote</option>
                      <option value="Contract" className="bg-white text-slate-900">Contract</option>
                      <option value="Internship" className="bg-white text-slate-900">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Experience Required
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm text-slate-900 font-medium cursor-pointer"
                    >
                      <option value="Fresher / 0-1 Years" className="bg-white text-slate-900">Fresher / 0-1 Years</option>
                      <option value="1-3 Years" className="bg-white text-slate-900">1-3 Years</option>
                      <option value="3-5 Years" className="bg-white text-slate-900">3-5 Years</option>
                      <option value="5+ Years" className="bg-white text-slate-900">5+ Years (Lead / Expert)</option>
                    </select>
                  </div>
                </div>

                {/* Candidate Qualification & Daily Target */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Minimum Qualification <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm text-slate-900 font-medium cursor-pointer"
                    >
                      {QUALIFICATIONS.map((q) => (
                        <option key={q} value={q} className="bg-white text-slate-900">{q}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Daily Target Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="dailyTarget"
                      value={formData.dailyTarget}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm text-slate-900 font-medium cursor-pointer"
                    >
                      {TARGET_TYPES.map((t) => (
                        <option key={t} value={t} className="bg-white text-slate-900">{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.dailyTarget !== 'No Target (Fixed Salary)' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Daily Target Details / Specifications
                    </label>
                    <input
                      type="text"
                      name="dailyTargetDetails"
                      value={formData.dailyTargetDetails}
                      onChange={handleChange}
                      placeholder="e.g. 50 customer calls per day, 5 verified delivery drops, etc."
                      className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 font-medium"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Locations & Available Seats */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between font-display">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold shadow-xs">2</span>
                  <span>Locations & Available Seats</span>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Total Vacancies: {formData.vacancies || 1}
                </span>
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3">
                  <p className="text-xs text-slate-600">
                    Add all locations where vacancies exist and specify how many seats are available at each location:
                  </p>

                  <div className="space-y-2.5">
                    {locationsList.map((loc, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <div className="flex-1 relative">
                          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                          <input
                            type="text"
                            placeholder="City / Region (e.g. Patna, Bangalore, Pune)"
                            value={loc.city}
                            onChange={(e) => handleLocationItemChange(idx, 'city', e.target.value)}
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-medium"
                            required
                          />
                        </div>
                        <div className="w-28 sm:w-36">
                          <input
                            type="number"
                            min="1"
                            placeholder="Seats (e.g. 10)"
                            value={loc.seats}
                            onChange={(e) => handleLocationItemChange(idx, 'seats', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-bold"
                          />
                        </div>
                        {locationsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLocation(idx)}
                            className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                            title="Remove location"
                          >
                            <FaTrash size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddLocation}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-xs transition cursor-pointer"
                  >
                    <FaPlus size={10} />
                    <span>+ Add Another Location & Seats</span>
                  </button>
                </div>

                {/* Compensation & Fees */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Minimum Salary (₹ Monthly or Annual)
                    </label>
                    <input
                      type="number"
                      name="salaryFrom"
                      value={formData.salaryFrom}
                      onChange={handleChange}
                      placeholder="e.g. 25000"
                      className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Maximum Salary (₹ Monthly or Annual)
                    </label>
                    <input
                      type="number"
                      name="salaryTo"
                      value={formData.salaryTo}
                      onChange={handleChange}
                      placeholder="e.g. 45000"
                      className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>

                {/* Candidate Registration / Processing Fee */}
                <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <FaShieldAlt className="text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Candidate Registration / Processing Fee</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Fee Type
                      </label>
                      <select
                        name="registrationFeeType"
                        value={formData.registrationFeeType}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-medium cursor-pointer"
                      >
                        {FEE_TYPES.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    {formData.registrationFeeType !== '100% Free (No Registration Fees)' && (
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                          Fee Amount (₹)
                        </label>
                        <input
                          type="number"
                          name="registrationFeeAmount"
                          value={formData.registrationFeeAmount}
                          onChange={handleChange}
                          placeholder="e.g. 500"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-bold"
                        />
                      </div>
                    )}
                  </div>

                  {formData.registrationFeeType !== '100% Free (No Registration Fees)' && (
                    <div>
                      <input
                        type="text"
                        name="registrationFeeNote"
                        value={formData.registrationFeeNote}
                        onChange={handleChange}
                        placeholder="Refund terms or fee details (e.g. 100% refundable upon joining client company)"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Requirements & Description */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
                <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold shadow-xs">3</span>
                <span>Job Requirements & Role Description</span>
              </h3>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Candidate Requirements & Criteria (Age, Skills, Bike/Device, Languages)
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows="3"
                  placeholder="e.g. 1. Age limit: 18 - 35 years&#10;2. Bike & Driving License required for field roles&#10;3. Basic English & local language knowledge&#10;4. Smartphone with internet"
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Detailed Role Responsibilities & Work Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe daily work, shifts, incentives, client perks, and growth opportunities..."
                  className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium leading-relaxed"
                />
              </div>
            </div>

            {!isApprovedCompany && (
              <div className="p-5 bg-amber-50/90 border border-amber-200/90 rounded-2xl space-y-3 text-amber-900 text-xs leading-relaxed">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0 text-sm" />
                  <div>
                    <span className="font-bold text-amber-900 block mb-0.5">Account Pending ZenSolve Admin Approval</span>
                    Your company profile is currently under review. Unapproved companies cannot publish live jobs. You may fill in the details and preview how your listing will look once your account is active.
                  </div>
                </div>
                <div className="pt-2 border-t border-amber-200/70">
                  <ResendApprovalReminder compact={false} />
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-2">
                <FaCheckCircle />
                <span>{isEditing ? 'Job opening successfully updated! Redirecting to jobs...' : 'Job opening successfully published! Redirecting to jobs...'}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!isApprovedCompany}
              className="w-full flex items-center justify-center gap-2 font-bold"
            >
              {!isApprovedCompany ? (
                <>
                  <FaLock className="text-xs opacity-75" />
                  <span>Approval Required to {isEditing ? 'Save' : 'Publish'}</span>
                </>
              ) : isEditing ? (
                'Save Changes & Update Job'
              ) : (
                'Publish Job Opening'
              )}
            </Button>

          </form>
        </div>

        {/* Live Preview Column (Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <FaEye className="text-indigo-600" />
            <span>Live Candidate Preview</span>
          </div>

          <div className="sticky top-28">
            <JobCard
              job={{
                id: 'preview-id',
                position: formData.position || 'Senior Role Title',
                companyName: formData.companyName || 'Your Agency Name',
                clientCompanyName: formData.clientCompanyName || 'Target Client Company (e.g. Infosys)',
                companyLogo: formData.companyLogo,
                category: formData.category === 'Others' ? (formData.customCategory || 'Custom Category') : formData.category,
                jobType: formData.jobType,
                workMode: formData.workMode,
                qualification: formData.qualification,
                registrationFeeType: formData.registrationFeeType,
                location: formData.location || 'Location (e.g. Bangalore)',
                vacancies: formData.vacancies,
                salaryFrom: formData.salaryFrom || '600000',
                salaryTo: formData.salaryTo || '1200000',
                experience: formData.experience,
                description:
                  formData.description ||
                  'This is how your job description and preview card will look to thousands of verified job seekers.',
                verified: true,
                rating: 4.9,
              }}
            />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DashboardPostJob;
