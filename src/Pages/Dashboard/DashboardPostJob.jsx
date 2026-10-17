import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { createJob } from '../../services/recruitmentService';
import { Button } from '../../components/ui/Button';
import JobCard from '../../components/JobCard';
import { FaCheckCircle, FaBriefcase, FaEye } from 'react-icons/fa';

const categories = [
  'IT & Software',
  'Finance',
  'Healthcare',
  'Business',
  'Education',
  'Construction',
  'Logistics',
  'Teaching',
];

const DashboardPostJob = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    position: '',
    companyName: '',
    companyLogo: '',
    category: 'IT & Software',
    jobType: 'Full-time',
    location: '',
    vacancies: '1',
    salaryFrom: '',
    salaryTo: '',
    experience: '1-3 Years',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.position || !formData.companyName || !formData.location) {
      setError('Please fill in the Job Title, Company Name, and Location.');
      return;
    }

    setLoading(true);
    const res = await createJob({
      ...formData,
      salaryFrom: formData.salaryFrom || 'Not specified',
      salaryTo: formData.salaryTo || 'Not specified',
      vacancies: Number(formData.vacancies) || 1,
    });

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/jobs');
      }, 1500);
    } else {
      setError(res.error || 'Failed to publish job.');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Post a New Job Opening"
      subtitle="Publish an opportunity to reach verified candidates across India."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="glass-surface-2 glass-specular p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            
            {/* Section 1: Role Basics */}
            <div>
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 font-display">
                <span className="w-6 h-6 rounded-full glass-surface-1 border border-indigo-500/30 text-indigo-400 text-xs flex items-center justify-center font-bold">1</span>
                <span>Role Fundamentals</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                    Job Position / Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="e.g. Senior Frontend Architect"
                    required
                    className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Company Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="e.g. ZenSolve Infotech"
                      required
                      className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Company Logo URL
                    </label>
                    <input
                      type="url"
                      name="companyLogo"
                      value={formData.companyLogo}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm text-white cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c} className="bg-slate-900">{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Job Type
                    </label>
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm text-white cursor-pointer"
                    >
                      <option value="Full-time" className="bg-slate-900">Full-time</option>
                      <option value="Part-time" className="bg-slate-900">Part-time</option>
                      <option value="Remote" className="bg-slate-900">Remote</option>
                      <option value="Contract" className="bg-slate-900">Contract</option>
                      <option value="Internship" className="bg-slate-900">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Vacancies
                    </label>
                    <input
                      type="number"
                      name="vacancies"
                      min="1"
                      value={formData.vacancies}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Compensation & Location */}
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 font-display">
                <span className="w-6 h-6 rounded-full glass-surface-1 border border-indigo-500/30 text-indigo-400 text-xs flex items-center justify-center font-bold">2</span>
                <span>Compensation & Location</span>
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Location / Region <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Bangalore, Remote, Mumbai"
                      required
                      className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Experience Required
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm text-white cursor-pointer"
                    >
                      <option value="0-1 Years" className="bg-slate-900">0-1 Years (Entry Level)</option>
                      <option value="1-3 Years" className="bg-slate-900">1-3 Years (Mid-Junior)</option>
                      <option value="3-5 Years" className="bg-slate-900">3-5 Years (Mid-Senior)</option>
                      <option value="5+ Years" className="bg-slate-900">5+ Years (Lead / Director)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Minimum Salary (₹ Annual)
                    </label>
                    <input
                      type="number"
                      name="salaryFrom"
                      value={formData.salaryFrom}
                      onChange={handleChange}
                      placeholder="e.g. 600000"
                      className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Maximum Salary (₹ Annual)
                    </label>
                    <input
                      type="number"
                      name="salaryTo"
                      value={formData.salaryTo}
                      onChange={handleChange}
                      placeholder="e.g. 1200000"
                      className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Job Description */}
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 font-display">
                <span className="w-6 h-6 rounded-full glass-surface-1 border border-indigo-500/30 text-indigo-400 text-xs flex items-center justify-center font-bold">3</span>
                <span>Role Responsibilities & Description</span>
              </h3>

              <div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe key responsibilities, daily work, required technical stack, and perks..."
                  className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-white placeholder:text-slate-500 leading-relaxed"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-center gap-2">
                <FaCheckCircle />
                <span>Job opening successfully published! Redirecting to jobs...</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Publish Job Opening
            </Button>

          </form>
        </div>

        {/* Live Preview Column (Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <FaEye className="text-indigo-400" />
            <span>Live Candidate Preview</span>
          </div>

          <div className="sticky top-28">
            <JobCard
              job={{
                id: 'preview-id',
                position: formData.position || 'Senior Role Title',
                companyName: formData.companyName || 'Your Company Name',
                companyLogo: formData.companyLogo,
                category: formData.category,
                jobType: formData.jobType,
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
            <p className="text-xs text-slate-500 text-center mt-3">
              This interactive card updates in real-time as you enter role information.
            </p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DashboardPostJob;
