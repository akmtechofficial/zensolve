import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
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
} from 'react-icons/fa';
import { Button } from '../../components/ui/Button';

const COMPANY_TYPES = [
  'Private Limited',
  'Public Limited',
  'Startup / Early Stage',
  'LLC',
  'Partnership / LLP',
  'Recruitment / Staffing Agency',
  'Enterprise',
];

const INDUSTRIES = [
  'IT & Software Development',
  'Finance & Banking',
  'Healthcare & Pharmaceuticals',
  'Construction & Infrastructure',
  'Education & EdTech',
  'Logistics & Supply Chain',
  'Retail & E-Commerce',
  'Manufacturing & Industrial',
  'Consulting & Professional Services',
];

import { useAuth } from '../../components/useAuth';

const CompanySignup = () => {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    hrName: '',
    email: '',
    phone: '',
    companyType: 'Private Limited',
    industry: 'IT & Software Development',
    location: '',
    website: '',
    logo: '',
    description: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

      // Save Company account in Firestore with PENDING APPROVAL state
      // Note: role is strictly set to 'company' — users cannot self-assign privileged roles.
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        companyName: formData.companyName,
        hrName: formData.hrName,
        displayName: formData.hrName,
        email: formData.email,
        businessEmail: formData.email,
        phone: formData.phone || '',
        companyType: formData.companyType,
        industry: formData.industry,
        location: formData.location || 'India',
        website: formData.website || '',
        logo: formData.logo || '/zen.jpeg',
        description: formData.description || '',
        about: formData.description || '',
        role: 'company',
        approved: false, // Pending admin approval
        status: 'pending', // pending | approved | rejected | suspended
        createdAt: serverTimestamp(),
      });

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
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-700 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 block w-max mx-auto mb-2">
            Employer & Recruiter Portal
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Register Your Organization
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Set up your multi-company recruitment dashboard and hire verified talent across India.
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-surface-3 glass-specular p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl bg-white/95">
          
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-6 flex items-start gap-3">
            <FaShieldAlt className="text-amber-600 text-base flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Enterprise Verification Notice:</span>
              <span>All company registrations undergo administrative review before job vacancies can be published publicly.</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* 2-Column: Company Name & HR Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Company / Organization Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="text"
                    name="companyName"
                    placeholder="e.g. Acme Tech Global"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  HR / Primary Contact Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaUserTie className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="text"
                    name="hrName"
                    placeholder="e.g. Priya Sharma (Head of Talent)"
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
                  Business / Official Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    placeholder="hr@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Mobile / Contact Number <span className="text-rose-500">*</span>
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

            {/* Company Type & Industry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Company Structure / Type
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
                  Primary Industry Sector
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

            {/* Location & Website */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Headquarters Location <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Bangalore / Patna / Mumbai"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Company Website URL
                </label>
                <div className="relative">
                  <FaGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    type="url"
                    name="website"
                    placeholder="https://company.com"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Logo Image URL */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Company Logo URL (Optional)
              </label>
              <div className="relative">
                <FaImage className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                <input
                  type="url"
                  name="logo"
                  placeholder="https://example.com/logo.png (defaults to ZenSolve partner avatar)"
                  value={formData.logo}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Company Description */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                About Organization / Company Profile <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="description"
                rows="3"
                placeholder="Briefly describe your company, work culture, team size, and core products..."
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
              Submit Organization Registration
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
