import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCompanies } from '../services/recruitmentService';
import { FaBuilding, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const TopCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      try {
        const compList = await getCompanies();
        if (isMounted) {
          setCompanies(compList);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
        if (isMounted) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaBuilding className="text-slate-400 text-xs" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Featured Companies Hiring Now
            </h2>
          </div>

          <Link
            to="/companies"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
          >
            <span>View All</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-14 rounded-xl bg-slate-50 border border-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : companies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {companies.slice(0, 6).map((comp) => (
              <Link
                key={comp.name}
                to={`/company/${encodeURIComponent(comp.name)}`}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-xs text-indigo-600 overflow-hidden flex-shrink-0">
                  {comp.logo ? (
                    <img
                      src={comp.logo}
                      alt={comp.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.parentNode) e.target.parentNode.textContent = comp.name.charAt(0);
                      }}
                    />
                  ) : (
                    comp.name.charAt(0)
                  )}
                </div>

                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition">
                    {comp.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {comp.openRolesCount ? `${comp.openRolesCount} Openings` : 'Actively Hiring'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-2 text-xs text-slate-400">
            Hiring partner organizations will appear here.
          </div>
        )}

      </div>
    </section>
  );
};

export default TopCompanies;
