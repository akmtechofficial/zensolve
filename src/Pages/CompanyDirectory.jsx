import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCompanies } from '../services/recruitmentService';
import { FaBuilding, FaSearch, FaMapMarkerAlt, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const CompanyDirectory = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      setLoading(true);
      const data = await getCompanies();
      if (isMounted) {
        setCompanies(data);
        setLoading(false);
      }
    };
    fetch();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = companies.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(s)) ||
      (c.industry && c.industry.toLowerCase().includes(s)) ||
      (c.location && c.location.toLowerCase().includes(s))
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              Verified Hiring Companies
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Explore companies and recruitment consultancies hiring actively on ZenSolve.
            </p>
          </div>

          <div className="relative sm:w-72">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            <input
              type="text"
              placeholder="Search by company or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-2xs"
            />
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-8 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((comp) => (
              <Link
                key={comp.name}
                to={`/company/${encodeURIComponent(comp.name)}`}
                className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition duration-150 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-sm text-indigo-600 flex-shrink-0 overflow-hidden">
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
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                          {comp.name}
                        </h2>
                        {comp.verified !== false && (
                          <FaCheckCircle className="text-emerald-500 text-[10px] flex-shrink-0" title="Verified" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {comp.industry || 'Technology & Services'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                    <FaMapMarkerAlt className="text-slate-400 text-[10px]" />
                    <span className="truncate">{comp.location || 'Pan India'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {comp.openRolesCount ? `${comp.openRolesCount} Openings` : 'Active Employer'}
                  </span>

                  <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>View Jobs</span>
                    <FaArrowRight className="text-[10px]" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-sm font-bold text-slate-800">No companies found</p>
            <p className="text-xs text-slate-500 mt-1">Try searching for a different company name or location.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CompanyDirectory;
