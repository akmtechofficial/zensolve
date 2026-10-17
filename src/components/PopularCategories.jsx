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
  FaCogs,
  FaArrowRight,
} from 'react-icons/fa';
import { BentoGrid, BentoGridItem } from './ui/BentoGrid';

const categories = [
  {
    id: 'it-software',
    name: 'IT & Software',
    categoryParam: 'IT & Software',
    description: 'Cloud engineering, full-stack development, AI/ML, DevOps, and cybersecurity.',
    icon: <FaLaptopCode size={22} />,
    badge: 'High Demand',
    colSpan: 'md:col-span-2',
  },
  {
    id: 'finance',
    name: 'Finance & Banking',
    categoryParam: 'Finance',
    description: 'Corporate finance, auditing, risk analysis, fintech, and accounting.',
    icon: <FaChartLine size={22} />,
    badge: 'Popular',
    colSpan: 'md:col-span-1',
  },
  {
    id: 'business',
    name: 'Business & Management',
    categoryParam: 'Business',
    description: 'Product management, executive leadership, sales strategy, and consultancy.',
    icon: <FaBriefcase size={22} />,
    badge: 'Executive',
    colSpan: 'md:col-span-1',
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    categoryParam: 'Healthcare',
    description: 'Clinical roles, biomedical research, healthcare administration, and nursing.',
    icon: <FaStethoscope size={22} />,
    badge: 'Verified',
    colSpan: 'md:col-span-1',
  },
  {
    id: 'education',
    name: 'Education & Training',
    categoryParam: 'Education',
    description: 'Academic faculties, curriculum design, corporate training, and EdTech.',
    icon: <FaGraduationCap size={22} />,
    badge: 'Growth',
    colSpan: 'md:col-span-1',
  },
  {
    id: 'construction',
    name: 'Construction & Civil',
    categoryParam: 'Construction',
    description: 'Civil engineering, structural design, project superintendents, and surveying.',
    icon: <FaHardHat size={22} />,
    badge: 'Infrastructure',
    colSpan: 'md:col-span-1',
  },
  {
    id: 'logistics',
    name: 'Logistics & Supply Chain',
    categoryParam: 'Logistics',
    description: 'Warehouse operations, procurement, fleet dispatch, and global shipping.',
    icon: <FaTruck size={22} />,
    badge: 'Operations',
    colSpan: 'md:col-span-2',
  },
];

const PopularCategories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryParam) => {
    navigate(`/jobs?category=${encodeURIComponent(categoryParam)}`);
  };

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Specialized Industry Tracks
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Explore Popular Categories
            </h2>
            <p className="text-slate-400 text-base mt-2 max-w-xl">
              Discover curated career opportunities tailored to your specialized domain and industry skill set.
            </p>
          </div>

          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 md:mt-0 text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-2 group transition"
          >
            <span>View All Categories</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Bento Grid layout */}
        <BentoGrid className="max-w-7xl">
          {categories.map((cat) => (
            <BentoGridItem
              key={cat.id}
              title={cat.name}
              description={cat.description}
              icon={cat.icon}
              badge={cat.badge}
              className={cat.colSpan}
              onClick={() => handleCategoryClick(cat.categoryParam)}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
};

export default PopularCategories;
