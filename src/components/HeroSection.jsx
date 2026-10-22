import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBriefcase,
  FaBuilding,
  FaCheckCircle,
  FaArrowRight,
  FaShieldAlt,
  FaMoneyBillWave,
  FaBolt,
  FaLayerGroup,
} from 'react-icons/fa';
import { Spotlight } from './ui/Spotlight';
import { Button } from './ui/Button';

const categories = [
  'All Categories',
  'IT & Software',
  'Finance',
  'Healthcare',
  'Business',
  'Education',
  'Construction',
  'Logistics',
];

const quickTags = ['Remote', 'Engineering', 'Fintech', 'Product Design', 'Healthcare', 'Senior Leadership'];

const HeroSection = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('search', keyword.trim());
    if (selectedCategory && selectedCategory !== 'All Categories') {
      params.append('category', selectedCategory);
    }
    if (location.trim()) params.append('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  const handleTagClick = (tag) => {
    if (tag === 'Remote') {
      navigate('/jobs?jobType=Remote');
    } else {
      navigate(`/jobs?search=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <div className="relative min-h-[760px] flex flex-col justify-center pt-14 pb-20 overflow-hidden">
      {/* =========================================================================
          HERO BACKGROUND: FLUTED GLASS ARCHITECTURE ARTWORK
          ========================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/images/hero_glass_architecture.jpg"
          alt="ZenSolve Architectural Glass Background"
          className="w-full h-full object-cover object-center scale-[1.02] transform transition-transform duration-1000"
        />

        {/* Sophisticated Dual Scrim: Dark Glass Vignette + Smooth Transition to Content */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/85 via-[#07090E]/60 to-[#F8FAFC]" />
        
        {/* Subtle Radial Atmosphere for luminous center focus */}
        <div className="absolute inset-0 bg-radial-gradient-dark opacity-60" />

        {/* Delicate Glass Grain & Grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-15 mask-radial" />
      </div>

      {/* Aceternity Spotlight Lighting Effects */}
      <Spotlight className="-top-32 left-10 md:left-1/4" fill="#6366F1" />
      <Spotlight className="top-10 right-10 md:right-1/4" fill="#38BDF8" />

      {/* =========================================================================
          HERO CONTENT (CENTERED ON ARCHITECTURAL GLASS BACKGROUND)
          ========================================================================= */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        
        {/* Luminous Glass Platform Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-dark-pill text-xs sm:text-sm font-semibold tracking-wide mb-6 shadow-lg backdrop-blur-xl border border-indigo-400/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white">Verified Glassmorphism Talent Network</span>
          <span className="text-indigo-400/60">•</span>
          <span className="text-indigo-200">Direct Recruiter Console</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 font-display leading-[1.08] drop-shadow-md">
          Make Career <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-200 to-purple-300">
            With Us
          </span>
        </h1>

        {/* Editorial Subtitle */}
        <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto mb-8 font-normal leading-relaxed drop-shadow-sm">
          Connect with India's most credible verified employers. Discover high-growth roles, transparent compensation, and accelerated recruitment workflows through an authentic glass interface.
        </p>

        {/* Candidate & Recruiter Primary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-10">
          <Button
            variant="primary"
            size="lg"
            icon={<FaArrowRight className="text-xs" />}
            iconPosition="right"
            onClick={() => navigate('/jobs')}
            className="rounded-2xl shadow-lg shadow-indigo-600/30 font-bold px-7"
          >
            Explore Open Positions
          </Button>

          <button
            type="button"
            onClick={() => navigate('/dashboard/post-job')}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl glass-dark-card border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition shadow-lg backdrop-blur-xl"
          >
            <FaBuilding className="text-emerald-400" />
            <span>For Employers: Post a Job</span>
          </button>
        </div>

        {/* Micro Trust Indicators (Translucent Glass Badges) */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-dark-card border border-white/10 text-white shadow-sm backdrop-blur-md">
            <FaShieldAlt className="text-indigo-400 text-xs" />
            <span className="text-xs font-semibold">100% Verified Employers</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-dark-card border border-white/10 text-white shadow-sm backdrop-blur-md">
            <FaMoneyBillWave className="text-emerald-400 text-xs" />
            <span className="text-xs font-semibold">Disclosed Compensation</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-dark-card border border-white/10 text-white shadow-sm backdrop-blur-md">
            <FaBolt className="text-violet-400 text-xs" />
            <span className="text-xs font-semibold">Direct HR Review (&lt;48 hrs)</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-dark-card border border-white/10 text-white shadow-sm backdrop-blur-md">
            <FaCheckCircle className="text-sky-400 text-xs" />
            <span className="text-xs font-semibold">Zero Fee for Candidates</span>
          </div>
        </div>

        {/* =========================================================================
            FLOATING GLASS SEARCH DOCK
            ========================================================================= */}
        <div className="glass-dark-card-elevated glass-specular-dark p-3.5 sm:p-5 rounded-3xl border border-white/15 shadow-2xl max-w-4xl mx-auto text-left backdrop-blur-2xl">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Keyword Search */}
              <div className="md:col-span-5 relative flex items-center">
                <FaSearch className="absolute left-4 text-slate-400 text-sm pointer-events-none" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl glass-dark-input text-sm text-white placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Category Dropdown */}
              <div className="md:col-span-4 relative flex items-center">
                <FaBriefcase className="absolute left-4 text-slate-400 text-sm pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl glass-dark-input text-sm text-white font-medium appearance-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Button */}
              <div className="md:col-span-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={<FaArrowRight className="text-xs" />}
                  iconPosition="right"
                  className="w-full h-[46px] rounded-2xl text-sm font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Search Positions
                </Button>
              </div>

            </div>
          </form>

          {/* Quick-filter Chips Under Dock */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Popular Searches:
            </span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="text-xs px-3 py-1 rounded-full glass-dark-subtle hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition shadow-xs"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

export default HeroSection;
