import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import {
  getAdminCompanies,
  createJob,
} from '../../services/recruitmentService';
import { notifyAdminOfNewJob } from '../../services/emailService';
import { uploadCompanyLogo, validateLogoFile, MAX_LOGO_SIZE_KB } from '../../services/storageService';
import { useAuth } from '../../components/useAuth';
import {
  FaBriefcase,
  FaBuilding,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUpload,
  FaPlus,
  FaTrash,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaSearch,
  FaShieldAlt,
  FaUserShield,
  FaArrowLeft,
  FaExternalLinkAlt,
} from 'react-icons/fa';

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

const AdminPostJob = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const preselectedCompanyId = queryParams.get('companyId');

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [companySearch, setCompanySearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [formData, setFormData] = useState({
    position: '',
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
    vacancies: '1',
    salaryFrom: '',
    salaryTo: '',
    experience: '1-3 Years',
    deadline: '',
    description: '',
    requirements: '',
    benefits: '',
  });

  const [locationsList, setLocationsList] = useState([{ city: '', seats: '1' }]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Fetch all registered companies for the selector
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const data = await getAdminCompanies();
        setCompanies(data);
        if (preselectedCompanyId) {
          const match = data.find((c) => c.id === preselectedCompanyId);
          if (match) {
            handleSelectCompany(match);
          }
        }
      } catch (err) {
        console.error('Failed to load companies for admin job posting:', err);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, [preselectedCompanyId]);

  const handleSelectCompany = (comp) => {
    setSelectedCompany(comp);
    setLogoPreview(comp.logo || comp.companyData?.logo || '');
    setFormData((prev) => ({
      ...prev,
      clientCompanyName: prev.clientCompanyName || comp.companyName || '',
    }));
    const compLocation = comp.location || comp.companyData?.location || '';
    if (compLocation) {
      setLocationsList([{ city: compLocation, seats: '1' }]);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateLogoFile(file);
    if (!validation.valid) {
      setFeedback({ type: 'error', text: validation.error });
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

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
      const totalSeats = updated.reduce((acc, curr) => acc + (Number(curr.seats) || 0), 0);
      if (totalSeats > 0) {
        setFormData((f) => ({ ...f, vacancies: String(totalSeats) }));
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedCompany) {
      setFeedback({
        type: 'error',
        text: 'Please select a target registered company to post this job on their behalf.',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.position.trim()) {
      setFeedback({ type: 'error', text: 'Job Position / Title is required.' });
      return;
    }

    const validLocations = locationsList.filter((l) => l.city && l.city.trim());
    if (validLocations.length === 0) {
      setFeedback({ type: 'error', text: 'At least one valid job location is required.' });
      return;
    }

    if (formData.category === 'Others' && !formData.customCategory.trim()) {
      setFeedback({ type: 'error', text: 'Please specify the custom category name.' });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalLogoUrl = logoPreview;
      if (logoFile && selectedCompany.id) {
        setUploadingLogo(true);
        try {
          const uploadRes = await uploadCompanyLogo(selectedCompany.id, logoFile);
          finalLogoUrl = uploadRes.downloadURL;
        } catch (uploadErr) {
          console.warn('Logo upload note:', uploadErr);
        } finally {
          setUploadingLogo(false);
        }
      }

      const resolvedCategory =
        formData.category === 'Others'
          ? formData.customCategory.trim() || 'General / Others'
          : formData.category;

      const computedSeats = validLocations.reduce(
        (acc, curr) => acc + (Number(curr.seats) || 0),
        0
      );

      const primaryLocation = validLocations
        .map((l) => `${l.city.trim()}${l.seats ? ` (${l.seats} seats)` : ''}`)
        .join(', ');

      const jobPayload = {
        position: formData.position.trim(),
        companyId: selectedCompany.id,
        userId: selectedCompany.id, // For backward compatibility with legacy company queries
        companyName: selectedCompany.companyName || 'Registered Enterprise',
        companyEmail: selectedCompany.email || '',
        companyLogo: finalLogoUrl || '',
        clientCompanyName: formData.clientCompanyName.trim() || selectedCompany.companyName || '',
        clientCompanyLocation: formData.clientCompanyLocation.trim() || '',
        category: resolvedCategory,
        customCategory: formData.customCategory || '',
        jobType: formData.jobType,
        workMode: formData.workMode,
        weekdays: formData.weekdays,
        qualification: formData.qualification,
        dailyTarget: formData.dailyTarget,
        dailyTargetDetails: formData.dailyTargetDetails,
        registrationFeeType: formData.registrationFeeType,
        registrationFeeAmount: formData.registrationFeeAmount || '0',
        registrationFeeNote: formData.registrationFeeNote || '',
        location: primaryLocation,
        locationsList: validLocations,
        vacancies: computedSeats || 1,
        totalSeats: computedSeats || 1,
        salaryFrom: formData.salaryFrom || 'Not specified',
        salaryTo: formData.salaryTo || 'Not specified',
        experience: formData.experience,
        deadline: formData.deadline || '',
        description: formData.description,
        requirements: formData.requirements,
        benefits: formData.benefits || '',
        status: 'Active',
        verified: true, // Auto-verified since Super Admin posted it
        postedByAdmin: true,
        postedByAdminEmail: user?.email || 'admin@zensolve.in',
        postedAt: new Date().toISOString(),
      };

      const res = await createJob(jobPayload);

      if (res.success) {
        // Dispatch immediate email notification
        notifyAdminOfNewJob({
          position: jobPayload.position,
          companyName: jobPayload.companyName,
          clientCompanyName: jobPayload.clientCompanyName,
          category: jobPayload.category,
          vacancies: jobPayload.vacancies,
          salaryFrom: jobPayload.salaryFrom,
          salaryTo: jobPayload.salaryTo,
          workMode: jobPayload.workMode,
          location: jobPayload.location,
          qualification: jobPayload.qualification,
          jobId: res.id,
          postedBy: user?.email || 'admin@zensolve.in',
        }).catch((err) => console.warn('Notification note:', err));

        navigate('/admin/jobs', {
          state: {
            successMessage: `Job "${jobPayload.position}" has been successfully published on behalf of ${jobPayload.companyName}!`,
          },
        });
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to create job.' });
      }
    } catch (err) {
      console.error('Error posting job on behalf of company:', err);
      setFeedback({ type: 'error', text: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const q = companySearch.toLowerCase();
    return (
      (c.companyName || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.location || '').toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout
      title="Post Job on Behalf of Company"
      subtitle="Publish fully active, verified job listings on behalf of any registered corporate employer without requiring their login credentials."
    >
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Navigation & Status Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/jobs"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            <FaArrowLeft className="text-[10px]" />
            <span>Back to Job Moderation</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
            <FaUserShield />
            <span>Super-Admin Delegated Job Publisher</span>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* =========================================================================
             SECTION 1: TARGET COMPANY SELECTOR (THE PROXY BINDING)
             ========================================================================= */}
          <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-indigo-200/80 shadow-sm bg-white/95 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                  <FaBuilding className="text-indigo-600 text-sm" />
                  <span>1. Select Target Registered Company</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Choose which company will officially own this job and receive all candidate applications.
                </p>
              </div>

              {selectedCompany && (
                <button
                  type="button"
                  onClick={() => setSelectedCompany(null)}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Change Company
                </button>
              )}
            </div>

            {selectedCompany ? (
              /* Selected Company Dossier Banner */
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {selectedCompany.logo || selectedCompany.companyData?.logo ? (
                    <img
                      src={selectedCompany.logo || selectedCompany.companyData?.logo}
                      alt={selectedCompany.companyName}
                      className="w-12 h-12 rounded-xl object-contain bg-white border border-indigo-100 p-1"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg">
                      {(selectedCompany.companyName || 'C').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {selectedCompany.companyName}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {selectedCompany.status || 'Registered'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      <span>Email: <strong>{selectedCompany.email}</strong></span>
                      {selectedCompany.location && (
                        <span>City: <strong>{selectedCompany.location}</strong></span>
                      )}
                      <span className="font-mono text-slate-400 text-[10px]">UID: {selectedCompany.id}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-indigo-700 bg-white/80 border border-indigo-200 px-3 py-1.5 rounded-xl font-medium shrink-0">
                  ✓ Bound to Company HR Dashboard
                </div>
              </div>
            ) : (
              /* Company Search & Selection Dropdown */
              <div className="space-y-3">
                <div className="relative">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    placeholder="Search by registered company name, email, or city..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl glass-input text-xs text-slate-900 placeholder:text-slate-400 font-medium border border-slate-200"
                  />
                </div>

                {loadingCompanies ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    Loading registered companies...
                  </div>
                ) : filteredCompanies.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                    No companies matched "{companySearch}".
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white shadow-xs">
                    {filteredCompanies.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCompany(c)}
                        className="p-3 hover:bg-indigo-50/50 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                            {(c.companyName || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{c.companyName || 'Unnamed Entity'}</div>
                            <div className="text-[10px] text-slate-500">{c.email} • {c.location || 'Location unlisted'}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shrink-0"
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =========================================================================
             SECTION 2: JOB POSITION & BASIC ATTRIBUTES
             ========================================================================= */}
          <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2 border-b border-slate-100 pb-3">
              <FaBriefcase className="text-indigo-600 text-xs" />
              <span>2. Job Role & Position Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Job Position / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack Engineer, HR Executive"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Client / Hiring Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Official workplace company name"
                  value={formData.clientCompanyName}
                  onChange={(e) => setFormData({ ...formData, clientCompanyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {formData.category === 'Others' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Specify Custom Category <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter custom category name"
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Job Type</label>
                <select
                  value={formData.jobType}
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Work Mode</label>
                <select
                  value={formData.workMode}
                  onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  {WORK_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Working Days</label>
                <select
                  value={formData.weekdays}
                  onChange={(e) => setFormData({ ...formData, weekdays: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  {WEEKDAY_OPTIONS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Minimum Qualification
                </label>
                <select
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  {QUALIFICATIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Experience</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="Fresher">Fresher (0 Years)</option>
                  <option value="0-1 Years">0-1 Years</option>
                  <option value="1-3 Years">1-3 Years</option>
                  <option value="3-5 Years">3-5 Years</option>
                  <option value="5+ Years">5+ Years</option>
                </select>
              </div>
            </div>
          </div>

          {/* =========================================================================
             SECTION 3: COMPENSATION & VACANCY LOCATIONS
             ========================================================================= */}
          <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2 border-b border-slate-100 pb-3">
              <FaMoneyBillWave className="text-indigo-600 text-xs" />
              <span>3. Compensation & Locations</span>
            </h3>

            {/* Salary Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Salary From (₹ / Month)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 20000"
                  value={formData.salaryFrom}
                  onChange={(e) => setFormData({ ...formData, salaryFrom: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Salary To (₹ / Month)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 35000"
                  value={formData.salaryTo}
                  onChange={(e) => setFormData({ ...formData, salaryTo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Multiple Locations Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-rose-500" />
                  <span>Job Locations & Seats Distribution</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddLocation}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  <FaPlus className="text-[10px]" />
                  <span>Add Location</span>
                </button>
              </div>

              {locationsList.map((locItem, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="City name (e.g. Ranchi, Godda, Patna)"
                    value={locItem.city}
                    onChange={(e) => handleLocationItemChange(idx, 'city', e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <div className="w-28 flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Seats"
                      value={locItem.seats}
                      onChange={(e) => handleLocationItemChange(idx, 'seats', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500">seats</span>
                  </div>
                  {locationsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLocation(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition"
                      title="Remove Location"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  )}
                </div>
              ))}

              <div className="text-[11px] text-slate-500 font-medium pt-1">
                Total Computed Vacancies: <strong>{formData.vacancies} seat(s)</strong> across {locationsList.filter((l) => l.city).length} location(s).
              </div>
            </div>
          </div>

          {/* =========================================================================
             SECTION 4: JOB DESCRIPTION & REQUIREMENTS
             ========================================================================= */}
          <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2 border-b border-slate-100 pb-3">
              <FaGraduationCap className="text-indigo-600 text-xs" />
              <span>4. Description, Requirements & Benefits</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Job Description / Key Roles & Responsibilities <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Outline day-to-day responsibilities, expectations, and workplace duties..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Key Requirements, Skills & Eligibility
              </label>
              <textarea
                rows={3}
                placeholder="e.g. React.js, Tailwind CSS, Excellent communication skills, Minimum 1 year experience in BPO..."
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Perks & Benefits (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Health Insurance, PF + ESI, Flexible timing, Annual performance bonus..."
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* =========================================================================
             SECTION 5: SUBMIT & AUDIT SUMMARY
             ========================================================================= */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl border border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-emerald-400 text-sm" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                  Audit & Compliance Verification
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Job will be published with <strong className="text-emerald-400">Verified</strong> status and attributed to{' '}
                <strong className="text-white">{selectedCompany?.companyName || 'the selected company'}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/jobs"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !selectedCompany}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? 'Publishing Listing...' : 'Publish Job for Company'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </AdminLayout>
  );
};

export default AdminPostJob;