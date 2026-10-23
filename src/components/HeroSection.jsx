import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaArrowRight,
  FaCheckCircle,
  FaBuilding,
  FaBriefcase,
  FaShieldAlt,
} from 'react-icons/fa';
import { Button } from './ui/Button';

const quickTags = ['Remote', 'Engineering', 'Finance', 'Design', 'Healthcare', 'Management'];

const HeroSection = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('search', keyword.trim());
    if (location.trim()) params.append('location', location.trim());
    
    navigate(`/jobs?${params.toString()}`);
  };

  const handleTagClick = (tag) => {
    if (tag.toLowerCase() === 'remote') {
      navigate('/jobs?location=Remote');
    } else {
      navigate(`/jobs?search=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50/60 pt-10 sm:pt-16 pb-16 sm:pb-24 border-b border-slate-200/80 overflow-hidden">
      {/* Subtle architectural dot grid background */}
      <div 
        className="absolute inset-0 opacity-[0.4] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold tracking-wider uppercase mb-6 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          YOUR NEXT OPPORTUNITY STARTS HERE
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-5 font-display leading-[1.12]">
          Find the work that moves you forward.
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          Discover opportunities from companies hiring across industries. Search roles that match your skills, experience, and career goals.
        </p>

        {/* Search Experience Dock (Clean, High-Trust Card) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-3 sm:p-4 max-w-4xl mx-auto text-left mb-8">
          <form onSubmit={handleSearch} className="space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 sm:gap-3">
              
              {/* Keyword Input */}
              <div className="relative flex-1 flex items-center">
                <FaSearch className="absolute left-4 text-slate-400 text-sm pointer-events-none" />
                <input
                  type="text"
                  placeholder="Job title, skills or company"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl sm:rounded-2xl bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 transition"
                  aria-label="Job title, skills or company"
                />
              </div>

              {/* Location Input */}
              <div className="relative flex-1 flex items-center">
                <FaMapMarkerAlt className="absolute left-4 text-slate-400 text-sm pointer-events-none" />
                <input
                  type="text"
                  placeholder="City, state or remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl sm:rounded-2xl bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 transition"
                  aria-label="City, state or remote"
                />
              </div>

              {/* Search Button */}
              <div className="sm:w-auto">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={<FaArrowRight className="text-xs" />}
                  iconPosition="right"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl sm:rounded-2xl text-sm font-bold shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all"
                >
                  Search Jobs
                </Button>
              </div>

            </div>
          </form>

          {/* Quick-Filter Shortcuts */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Popular Searches:
            </span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200/80 transition font-medium"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Benefits Row (High-Trust India Recruitment Standards) */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
              <FaBriefcase className="text-[10px]" />
            </div>
            <span>Explore opportunities</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              <FaCheckCircle className="text-[10px]" />
            </div>
            <span>Track applications</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center text-xs">
              <FaBuilding className="text-[10px]" />
            </div>
            <span>Connect with hiring companies</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
