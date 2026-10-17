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
} from 'react-icons/fa';
import { Spotlight } from './ui/Spotlight';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

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

  return (
    <div className="relative min-h-[620px] flex items-center justify-center pt-10 pb-16 overflow-hidden">
      {/* Aceternity Spotlight Effect */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#6366F1" />
      <Spotlight className="top-10 left-full md:left-[70%] -top-10" fill="#A855F7" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 mask-radial pointer-events-none" />

      {/* Hero Ambient Radial Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Luminous Platform Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel bg-slate-900/80 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-semibold tracking-wide mb-6 shadow-glow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Verified Multi-Company Recruitment Platform</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Direct HR Connections</span>
        </div>

        {/* Primary Headline: "Make Career With Us" */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 font-display leading-[1.1]">
          Make Career <br className="hidden sm:inline" />
          <span className="text-gradient-accent">With Us</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          Connect with India's most credible verified employers. Discover high-growth roles, transparent compensation, and accelerated recruitment workflows.
        </p>

        {/* Sophisticated Job Search Bar */}
        <form
          onSubmit={handleSearch}
          className="glass-panel p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-slate-750/90 shadow-2xl max-w-4xl mx-auto mb-10 text-left bg-slate-900/90 backdrop-blur-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            
            {/* Keyword Input */}
            <div className="md:col-span-5 relative flex items-center">
              <FaSearch className="absolute left-3.5 text-slate-500 text-sm" />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-slate-950/70 border border-slate-800 rounded-xl sm:rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/80 transition"
              />
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-4 relative flex items-center">
              <FaBriefcase className="absolute left-3.5 text-slate-500 text-sm" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-slate-950/70 border border-slate-800 rounded-xl sm:rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500/80 transition appearance-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={<FaArrowRight className="text-xs" />}
                iconPosition="right"
                className="w-full h-[46px] rounded-xl sm:rounded-2xl text-sm font-semibold"
              >
                Search Openings
              </Button>
            </div>

          </div>
        </form>

        {/* Actions for Candidates & Employers */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Button
            variant="secondary"
            size="md"
            icon={<FaBriefcase className="text-indigo-400" />}
            onClick={() => navigate('/jobs')}
            className="text-xs sm:text-sm"
          >
            Explore Open Positions
          </Button>

          <Button
            variant="ghost"
            size="md"
            icon={<FaBuilding className="text-emerald-400" />}
            onClick={() => navigate('/dashboard/post-job')}
            className="text-xs sm:text-sm border border-slate-800 hover:border-slate-700 bg-slate-900/50"
          >
            For Employers: Post a Job
          </Button>
        </div>

        {/* Platform Trust Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-slate-800/60">
          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <FaShieldAlt size={13} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white">Verified Employers</p>
              <p className="text-[11px] text-slate-400">100% genuine postings</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <FaMoneyBillWave size={13} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white">Transparent Salary</p>
              <p className="text-[11px] text-slate-400">Real compensation</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0">
              <FaBolt size={13} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white">Direct HR Reach</p>
              <p className="text-[11px] text-slate-400">Fast application review</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <FaCheckCircle size={13} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white">Zero Candidate Fee</p>
              <p className="text-[11px] text-slate-400">Always free for seekers</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroSection;
