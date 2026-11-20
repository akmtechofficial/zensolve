import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaLaptopCode,
  FaChartLine,
  FaStethoscope,
  FaBriefcase,
  FaGraduationCap,
  FaHardHat,
  FaTruck,
  FaHeadset,
} from 'react-icons/fa';

const categories = [
  {
    id: 'it-software',
    name: 'IT & Software',
    param: 'IT & Software',
    icon: <FaLaptopCode size={18} className="text-indigo-600" />,
  },
  {
    id: 'finance',
    name: 'Finance & Banking',
    param: 'Finance',
    icon: <FaChartLine size={18} className="text-emerald-600" />,
  },
  {
    id: 'sales-marketing',
    name: 'Sales & Business',
    param: 'Business',
    icon: <FaBriefcase size={18} className="text-blue-600" />,
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Pharma',
    param: 'Healthcare',
    icon: <FaStethoscope size={18} className="text-rose-600" />,
  },
  {
    id: 'education',
    name: 'Education & Teaching',
    param: 'Education',
    icon: <FaGraduationCap size={18} className="text-amber-600" />,
  },
  {
    id: 'logistics',
    name: 'Logistics & Supply Chain',
    param: 'Logistics',
    icon: <FaTruck size={18} className="text-cyan-600" />,
  },
  {
    id: 'construction',
    name: 'Construction & Civil',
    param: 'Construction',
    icon: <FaHardHat size={18} className="text-orange-600" />,
  },
  {
    id: 'bpo',
    name: 'BPO & Support',
    param: 'Business',
    icon: <FaHeadset size={18} className="text-purple-600" />,
  },
];

const PopularCategories = () => {
  const navigate = useNavigate();

  return (
    <section className="py-10 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
            Popular Job Categories
          </h2>
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            All Categories →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => navigate(`/jobs?category=${encodeURIComponent(cat.param)}`)}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                {cat.icon}
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                  {cat.name}
                </span>
                <span className="text-[11px] text-slate-400">Browse roles</span>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PopularCategories;
