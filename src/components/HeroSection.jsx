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
  FaUserCheck,
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
    <div className="relative min-h-[720px] flex flex-col justify-center pt-8 pb-16 overflow-hidden">
      {/* Aceternity Spotlight Lighting */}
      <Spotlight className="-top-40 left-0 md:left-40 md:-top-20" fill="#6366F1" />
      <Spotlight className="top-10 left-full md:left-[65%] -top-10" fill="#A855F7" />
      <Spotlight className="bottom-0 left-1/3" fill="#38BDF8" />

      {/* Grid Pattern overlay with radial mask */}
      <div className="absolute inset-0 bg-grid-pattern opacity-35 mask-radial pointer-events-none" />

      {/* Hero Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-sky-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Main Two-Column Hero Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center mb-12">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 text-left">
            {/* Luminous Platform Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-surface-1 border border-indigo-200 text-indigo-700 text-xs sm:text-sm font-semibold tracking-wide mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verified Glassmorphism Talent Network</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">Direct Recruiter Console</span>
            </div>

            {/* Primary Headline: "Make Career With Us" */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 font-display leading-[1.08]">
              Make Career <br />
              <span className="text-gradient-accent">With Us</span>
            </h1>

            {/* Editorial Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mb-8 font-normal leading-relaxed">
              Connect with India's most credible verified employers. Discover high-growth roles, transparent compensation, and accelerated recruitment workflows through an authentic glass interface.
            </p>

            {/* Candidate & Recruiter CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 mb-10">
              <Button
                variant="primary"
                size="lg"
                icon={<FaArrowRight className="text-xs" />}
                iconPosition="right"
                onClick={() => navigate('/jobs')}
                className="rounded-2xl shadow-glow-sm"
              >
                Explore Open Positions
              </Button>

              <Button
                variant="ghost"
                size="lg"
                icon={<FaBuilding className="text-emerald-600" />}
                onClick={() => navigate('/dashboard/post-job')}
                className="rounded-2xl glass-surface-1 border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-slate-900 shadow-sm"
              >
                For Employers: Post a Job
              </Button>
            </div>

            {/* Micro Trust Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg glass-surface-1 text-indigo-600 flex items-center justify-center border border-indigo-200">
                  <FaShieldAlt size={11} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Verified</p>
                  <p className="text-[10px] text-slate-500">100% Genuine</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg glass-surface-1 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <FaMoneyBillWave size={11} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Transparent</p>
                  <p className="text-[10px] text-slate-500">Salary Disclosed</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg glass-surface-1 text-violet-600 flex items-center justify-center border border-violet-200">
                  <FaBolt size={11} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Fast Review</p>
                  <p className="text-[10px] text-slate-500">Direct Recruiter</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg glass-surface-1 text-sky-600 flex items-center justify-center border border-sky-200">
                  <FaCheckCircle size={11} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Zero Fee</p>
                  <p className="text-[10px] text-slate-500">Free For Seekers</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Original AI Visual Asset Centerpiece (Asset A) */}
          <div className="lg:col-span-5 relative">
            {/* Ambient Background Aura behind glass art */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/10 via-sky-500/10 to-purple-500/10 blur-2xl rounded-3xl pointer-events-none" />

            {/* Glass Container Housing Signature Architecture Artwork */}
            <div className="relative glass-surface-2 glass-specular rounded-3xl p-3 border border-slate-200/90 shadow-xl overflow-hidden group">
              
              {/* The Actual Generated Visual Asset */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/10]">
                <img
                  src="/images/hero_glass_architecture.jpg"
                  alt="ZenSolve Architectural Glass Portal"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Subtle Refractive Glass Film Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent pointer-events-none" />

                {/* Specular internal reflection highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 pointer-events-none" />

                {/* Floating Glass Telemetry Chip Top-Right */}
                <div className="absolute top-3.5 right-3.5 glass-surface-3 glass-specular px-3 py-1.5 rounded-full border border-white/40 flex items-center gap-2 shadow-lg backdrop-blur-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-semibold text-white tracking-wide">
                    Live Openings: 1,240+
                  </span>
                </div>

                {/* Floating Glass Candidate Metric Card Bottom-Left */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 glass-surface-3 glass-specular p-3 rounded-xl border border-white/30 shadow-xl backdrop-blur-2xl">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-xs">
                        <FaLayerGroup />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Multi-Enterprise Portal</p>
                        <p className="text-[10px] text-slate-200">Verified HR screening speed: &lt; 48 hrs</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Floating Glass Search Dock */}
        <div className="glass-dock glass-specular p-3 sm:p-4 rounded-3xl border border-slate-200/90 shadow-xl max-w-5xl mx-auto">
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
                  className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Category Dropdown */}
              <div className="md:col-span-4 relative flex items-center">
                <FaBriefcase className="absolute left-4 text-slate-400 text-sm pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm text-slate-900 font-medium appearance-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-white text-slate-900">
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
                  className="w-full h-[46px] rounded-2xl text-sm font-semibold shadow-glow-sm"
                >
                  Search Positions
                </Button>
              </div>

            </div>
          </form>

          {/* Quick-filter Chips Under Dock */}
          <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Popular Searches:
            </span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="text-xs px-2.5 py-1 rounded-full glass-surface-1 hover:glass-surface-2 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-indigo-400 transition shadow-xs"
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
