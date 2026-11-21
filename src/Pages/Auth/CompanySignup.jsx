import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import { uploadCompanyLogo, validateLogoFile, MAX_LOGO_SIZE_KB } from '../../services/storageService';
import {
  FaBuilding,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaLock,
  FaExclamationTriangle,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaImage,
  FaUpload,
} from 'react-icons/fa';
import { Button } from '../../components/ui/Button';
import { notifyAdminNewCompany } from '../../services/notificationService';

const COMPANY_TYPES = [
  'Manpower Supply & Staffing Agency',
  'Recruitment & Placement Consultancy',
  'Contract & Permanent Staffing Firm',
  'IT & Technical Staffing Agency',
  'Executive Search & HR Solutions',
  'Private Limited Staffing Company',
  'LLP / Partnership Agency',
  'Proprietorship Staffing Firm',
];

const INDUSTRIES = [
  'Multi-Industry Staffing (All Sectors)',
  'IT, Software & Tech Talent',
  'Manufacturing, Plant & Industrial Labor',
  'Construction, Civil & Real Estate Manpower',
  'Banking, Financial Services & Insurance (BFSI)',
  'Healthcare, Nursing & Pharmaceuticals',
  'Logistics, Warehousing & Supply Chain',
  'Retail, Sales & Customer Support Staffing',
  'Hospitality, Security & Facility Management',
];

const CLIENT_TIERS = [
  '1 - 5 Client Companies',
  '6 - 20 Client Companies',
  '21 - 50 Client Companies',
  '50+ Enterprise Clients',
  'New Agency (Building Client Network)',
];

import { useAuth } from '../../components/useAuth';

const CompanySignup = () => {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    hrName: '',
    email: '',
    phone: '',
    companyType: 'Manpower Supply & Staffing Agency',
    industry: 'Multi-Industry Staffing (All Sectors)',
    clientCount: '1 - 5 Client Companies',
    gstNumber: '',
    location: '',
    website: '',
    logo: '',
    description: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateLogoFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.companyName || !formData.hrName || !formData.email || !formData.password) {
      setError('Please fill in all required company fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      // Store intent so onAuthStateChanged does not default to candidate before setDoc completes
      window.localStorage.setItem('pendingAuthRole', 'company');

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: formData.hrName,
      });

      let finalLogoUrl = formData.logo || '/zen.jpeg';
      if (logoFile) {
        try {
          const uploadRes = await uploadCompanyLogo(user.uid, logoFile);
          finalLogoUrl = uploadRes.downloadURL;
        } catch (uploadErr) {
          console.warn('Logo upload during signup notice:', uploadErr);
        }
      }

      // Save Company/Agency account in Firestore with PENDING APPROVAL state
      // Note: role is strictly set to 'company' — users cannot self-assign privileged roles.
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        companyName: formData.companyName,
        agencyName: formData.companyName,
        hrName: formData.hrName,
        displayName: formData.hrName,
        email: formData.email,
        businessEmail: formData.email,
        phone: formData.phone || '',
        companyType: formData.companyType,
        agencyType: formData.companyType,
        industry: formData.industry,
        specialization: formData.industry,
        clientCount: formData.clientCount || '',
        gstNumber: formData.gstNumber || '',
        isManpowerAgency: true,
        location: formData.location || 'India',
        website: formData.website || '',
        logo: finalLogoUrl,
        companyLogo: finalLogoUrl,
        description: formData.description || '',
        about: formData.description || '',
        role: 'company',
        approved: false, // Pending admin approval
        status: 'pending', // pending | approved | rejected | suspended
        createdAt: serverTimestamp(),
      });

      // Dispatch instant email notification to admin (carezensolve@gmail.com) for review & approval
      notifyAdminNewCompany({
        uid: user.uid,
        companyName: formData.companyName,
        agencyName: formData.companyName,
        hrName: formData.hrName,
        email: formData.email,
        phone: formData.phone || '',
        companyType: formData.companyType,
        industry: formData.industry,
        clientCount: formData.clientCount || '',
        gstNumber: formData.gstNumber || '',
        isManpowerAgency: true,
        location: formData.location || 'India',
        website: formData.website || '',
        description: formData.description || '',
      }).catch((notifyErr) => console.warn('Admin notification warning:', notifyErr));

      // Ensure AuthContext is freshly populated with the newly created company profile
      await refreshUser();
      window.localStorage.removeItem('pendingAuthRole');

      // Navigate to HR Dashboard (which will display the Pending Approval banner)
      navigate('/hr', { replace: true });
    } catch (err) {
      console.error('Company registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This business email is already registered. Please login.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glass Texture & Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] bg-cover bg-center mix-blend-multiply z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 mask-radial pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white p-0.5 border border-slate-200 shadow-sm group-hover:border-indigo-400 transition-all overflow-hidden flex items-center justify-center">
              <img src="/zen.jpeg" alt="ZenSolve Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-bold text-2xl text-slate-900 tracking-tight">
              ZenSolve
            </span>
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 block w-max mx-auto mb-2">
            Manpower & Staffing Agency Portal
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Register Your Staffing Agency
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Supply verified manpower, manage client company vacancies, and source pre-screened talent across India.
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-surface-3 glass-specular p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl bg-white/95">
          
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/90 text-indigo-950 text-xs mb-6 flex items-start gap-3">
            <FaShieldAlt className="text-indigo-600 text-base flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-indigo-900">Manpower Agency Verification:</span>
              <span>All staffing and recruitment agencies undergo administrative review before vacancies for client companies can be published publicly.</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* 2-Column: Agency Name & Contact Person */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Staffing / Manpower Agency Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="text"
                    name="companyName"
                    placeholder="e.g. Apex Manpower Solutions LLP"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Authorized HR / Director Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaUserTie className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="text"
                    name="hrName"
                    placeholder="e.g. Priya Sharma (Operations Head)"
                    value={formData.hrName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Official Agency Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    placeholder="contact@agency.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Mobile / WhatsApp Contact <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Agency Type & Specialization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Agency Business Structure
                </label>
                <select
                  name="companyType"
                  value={formData.companyType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
                >
                  {COMPANY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Primary Staffing Specialization
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Clients & GSTIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Active Client Companies (Placement Capacity)
                </label>
                <select
                  name="clientCount"
                  value={formData.clientCount}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
                >
                  {CLIENT_TIERS.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  GSTIN / Government Agency Reg. No (Optional)
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  placeholder="e.g. 10AAAAA0000A1Z5"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium uppercase"
                />
              </div>
            </div>

            {/* Location & Website */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Headquarters / Operating Region <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Bangalore / Patna / Delhi NCR / Pan-India"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Agency Website / Portfolio (Optional)
                </label>
                <div className="relative">
                  <FaGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="url"
                    name="website"
                    placeholder="https://youragency.com"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Company Logo Upload & URL */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Agency Brand Logo (Optional)
                </label>
                <span className="text-[10px] text-slate-400">Max {MAX_LOGO_SIZE_KB} KB</span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2.5">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-12 h-12 rounded-xl object-cover border border-indigo-200 shadow-xs"
                    />
                  ) : formData.logo ? (
                    <img
                      src={formData.logo}
                      alt="Logo preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                      <FaBuilding className="text-sm" />
                    </div>
                  )}

                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition flex items-center gap-1.5 border border-indigo-100">
                    <FaUpload className="text-xs" />
                    <span>{logoFile ? 'Change Logo' : 'Upload File (Max 500KB)'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 w-full relative">
                  <FaImage className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="url"
                    name="logo"
                    placeholder="Or paste image URL (https://example.com/logo.png)"
                    value={formData.logo}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Accepted image formats: PNG, JPG, JPEG, WebP, SVG. File size must not exceed 500 KB.
              </p>
            </div>

            {/* Company Description */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                About Agency & Manpower Sourcing Capabilities <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="description"
                rows="3"
                placeholder="Mention your key client industries, talent pool, geographic coverage, and manpower placement track record..."
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <FaExclamationTriangle className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full shadow-md shadow-indigo-500/10 font-bold"
            >
              Submit Agency Registration
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            <span>Registering as a job candidate instead? </span>
            <Link to="/signup/candidate" className="text-indigo-600 font-bold hover:underline">
              Register as Candidate
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Sign In to HR Console
          </Link>
        </p>

      </div>
    </div>
  );
};

export default CompanySignup;
