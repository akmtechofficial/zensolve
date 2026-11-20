import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/useAuth';
import { saveCandidateProfile, getCandidateProfile } from '../../services/recruitmentService';
import CandidateLayout from './CandidateLayout';
import { Button } from '../../components/ui/Button';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
  FaTags,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaTrash,
  FaLanguage,
} from 'react-icons/fa';

const CandidateProfile = () => {
  const { user, userData, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    location: '',
    headline: '',
    bio: '',
    skills: [],
    languages: [],
    education: [],
    experience: [],
  });

  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState({
    name: '',
    proficiency: 'Fluent / Professional',
  });
  const [eduInput, setEduInput] = useState({ degree: '', school: '', year: '' });
  const [expInput, setExpInput] = useState({ role: '', company: '', duration: '', description: '' });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (user?.uid) {
        const profile = await getCandidateProfile(user.uid);
        if (profile && isMounted) {
          setFormData({
            displayName: profile.displayName || user.displayName || '',
            email: profile.email || user.email || '',
            phone: profile.phone || '',
            location: profile.location || '',
            headline: profile.headline || '',
            bio: profile.bio || '',
            skills: profile.skills || [],
            languages: Array.isArray(profile.languages) ? profile.languages : [],
            education: profile.education || [],
            experience: profile.experience || [],
          });
        } else if (isMounted) {
          setFormData((prev) => ({
            ...prev,
            displayName: user.displayName || '',
            email: user.email || '',
          }));
        }
        if (isMounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Add / Remove Skill
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    if (!formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Add / Remove Language
  const handleAddLanguage = (e) => {
    if (e) e.preventDefault();
    if (!languageInput.name.trim()) return;
    const cleanName = languageInput.name.trim();
    const alreadyExists = (formData.languages || []).some(
      (l) => (typeof l === 'string' ? l : l.name).toLowerCase() === cleanName.toLowerCase()
    );
    if (!alreadyExists) {
      setFormData((prev) => ({
        ...prev,
        languages: [
          ...(prev.languages || []),
          { name: cleanName, proficiency: languageInput.proficiency || 'Fluent / Professional' },
        ],
      }));
    }
    setLanguageInput({ name: '', proficiency: 'Fluent / Professional' });
  };

  const handleQuickAddLanguage = (langName) => {
    const cleanName = langName.trim();
    const alreadyExists = (formData.languages || []).some(
      (l) => (typeof l === 'string' ? l : l.name).toLowerCase() === cleanName.toLowerCase()
    );
    if (!alreadyExists) {
      setFormData((prev) => ({
        ...prev,
        languages: [
          ...(prev.languages || []),
          { name: cleanName, proficiency: 'Fluent / Professional' },
        ],
      }));
    }
  };

  const handleRemoveLanguage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      languages: (prev.languages || []).filter((_, i) => i !== indexToRemove),
    }));
  };

  // Add / Remove Education
  const handleAddEducation = (e) => {
    e.preventDefault();
    if (!eduInput.degree || !eduInput.school) return;
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, eduInput],
    }));
    setEduInput({ degree: '', school: '', year: '' });
  };

  const handleRemoveEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Add / Remove Experience
  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!expInput.role || !expInput.company) return;
    setFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, expInput],
    }));
    setExpInput({ role: '', company: '', duration: '', description: '' });
  };

  const handleRemoveExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const result = await saveCandidateProfile(user.uid, formData);
    if (result.success) {
      setFeedback({ type: 'success', text: 'Candidate profile updated successfully!' });
      await refreshUser();
    } else {
      setFeedback({ type: 'error', text: result.error || 'Failed to update profile.' });
    }
    setSaving(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading) {
    return (
      <CandidateLayout title="Candidate Profile">
        <div className="py-20 text-center text-slate-500 text-xs">Loading profile credentials...</div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout
      title="Candidate Profile & Portfolio"
      subtitle="Complete your profile credentials so corporate recruiters can discover and assess you."
    >
      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* 1. Basic Information */}
        <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <FaUser className="text-indigo-600 text-xs" />
            <span>Contact & Basic Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Full Legal Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Email (Primary Auth)</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-500 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Phone / WhatsApp</label>
              <input
                type="tel"
                name="phone"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Current City / Location</label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Bangalore, Karnataka"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Professional Headline</label>
            <input
              type="text"
              name="headline"
              placeholder="e.g. Full Stack Developer | React, Node.js & AWS"
              value={formData.headline}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Candidate Summary / Bio</label>
            <textarea
              name="bio"
              rows="3"
              placeholder="Brief introduction summarizing your expertise, career highlights, and job preferences..."
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
            />
          </div>
        </div>

        {/* 2. Skills Tags */}
        <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <FaTags className="text-indigo-600 text-xs" />
            <span>Core Skills & Competencies</span>
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add skill (e.g. React.js, Python, Figma, Accounting)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
              className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
            />
            <Button variant="secondary" size="md" onClick={handleAddSkill}>
              Add Skill
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-600 ml-1"
                >
                  &times;
                </button>
              </span>
            ))}
            {formData.skills.length === 0 && (
              <span className="text-xs text-slate-400 italic">No skills added yet.</span>
            )}
          </div>
        </div>

        {/* 3. Languages Known */}
        <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <FaLanguage className="text-indigo-600 text-sm" />
              <span>Languages Known (भाषायें)</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {formData.languages?.length || 0} Added
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Specify languages you can speak, read, or write along with your fluency level so recruiters know your communication capabilities.
          </p>

          {/* Quick-add popular language badges */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Add Popular Languages:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['English', 'Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Punjabi', 'Kannada', 'Malayalam', 'Urdu', 'French', 'German', 'Spanish'].map((lang) => {
                const isSelected = (formData.languages || []).some(
                  (l) => (typeof l === 'string' ? l : l.name).toLowerCase() === lang.toLowerCase()
                );
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => !isSelected && handleQuickAddLanguage(lang)}
                    disabled={isSelected}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition flex items-center gap-1 font-medium ${
                      isSelected
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default opacity-60'
                        : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border-slate-200 hover:border-indigo-300 active:scale-95'
                    }`}
                  >
                    <span>{lang}</span>
                    <span className="text-[10px]">{isSelected ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input & Proficiency Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
            <div className="sm:col-span-6">
              <input
                type="text"
                placeholder="Type another language (e.g. Japanese, Arabic, Russian)..."
                value={languageInput.name}
                onChange={(e) => setLanguageInput((p) => ({ ...p, name: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLanguage(e)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-medium"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={languageInput.proficiency}
                onChange={(e) => setLanguageInput((p) => ({ ...p, proficiency: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-900 font-medium bg-white"
              >
                <option value="Native / Mother Tongue">Native / Mother Tongue (मातृभाषा)</option>
                <option value="Fluent / Professional">Fluent / Professional (प्रवीण)</option>
                <option value="Intermediate">Intermediate (मध्यम स्तर)</option>
                <option value="Basic / Conversational">Basic / Conversational (बुनियादी)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <Button
                variant="secondary"
                size="md"
                onClick={handleAddLanguage}
                className="w-full h-full justify-center text-xs font-semibold"
              >
                Add Language
              </Button>
            </div>
          </div>

          {/* Current Languages List */}
          <div className="flex flex-wrap gap-2 pt-2">
            {formData.languages && formData.languages.map((langItem, idx) => {
              const name = typeof langItem === 'string' ? langItem : langItem.name;
              const prof = typeof langItem === 'string' ? 'Fluent' : langItem.proficiency || 'Fluent';
              return (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs group hover:border-indigo-300 transition"
                >
                  <span className="text-xs font-bold text-slate-900">{name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {prof}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(idx)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded-md transition text-sm leading-none"
                    title="Remove language"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
            {(!formData.languages || formData.languages.length === 0) && (
              <span className="text-xs text-slate-400 italic">
                No languages added yet. Use the quick buttons above or type to add.
              </span>
            )}
          </div>
        </div>

        {/* 4. Work Experience */}
        <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <FaBriefcase className="text-indigo-600 text-xs" />
            <span>Work Experience</span>
          </h3>

          <div className="space-y-3">
            {formData.experience.map((exp, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{exp.role}</h4>
                  <p className="text-xs text-indigo-600 font-medium">{exp.company} • {exp.duration}</p>
                  {exp.description && (
                    <p className="text-xs text-slate-600 mt-1">{exp.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(i)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Add experience box */}
          <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">Add Prior Position</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Role / Title"
                value={expInput.role}
                onChange={(e) => setExpInput((p) => ({ ...p, role: e.target.value }))}
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
              <input
                type="text"
                placeholder="Company Name"
                value={expInput.company}
                onChange={(e) => setExpInput((p) => ({ ...p, company: e.target.value }))}
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
              <input
                type="text"
                placeholder="Duration (e.g. 2021 - 2024)"
                value={expInput.duration}
                onChange={(e) => setExpInput((p) => ({ ...p, duration: e.target.value }))}
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <textarea
              placeholder="Responsibilities or achievements..."
              rows="2"
              value={expInput.description}
              onChange={(e) => setExpInput((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
            <Button variant="outline" size="sm" onClick={handleAddExperience} icon={<FaPlus className="text-xs" />}>
              Append Experience
            </Button>
          </div>
        </div>

        {/* 4. Education */}
        <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <FaGraduationCap className="text-indigo-600 text-xs" />
            <span>Education & Degrees</span>
          </h3>

          <div className="space-y-3">
            {formData.education.map((edu, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{edu.degree}</h4>
                  <p className="text-xs text-slate-600">{edu.school} {edu.year ? `(${edu.year})` : ''}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(i)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">Add Degree / Diploma</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Degree (e.g. B.Tech Computer Science)"
                value={eduInput.degree}
                onChange={(e) => setEduInput((p) => ({ ...p, degree: e.target.value }))}
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
              <input
                type="text"
                placeholder="University / College"
                value={eduInput.school}
                onChange={(e) => setEduInput((p) => ({ ...p, school: e.target.value }))}
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
              <input
                type="text"
                placeholder="Year (e.g. 2023)"
                value={eduInput.year}
                onChange={(e) => setEduInput((p) => ({ ...p, year: e.target.value }))}
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleAddEducation} icon={<FaPlus className="text-xs" />}>
              Append Education
            </Button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            className="w-full sm:w-auto font-bold shadow-md shadow-indigo-500/10"
          >
            Save Candidate Profile
          </Button>
        </div>

      </form>
    </CandidateLayout>
  );
};

export default CandidateProfile;
