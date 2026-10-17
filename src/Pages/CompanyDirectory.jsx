import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCompanies } from '../services/recruitmentService';
import { VerifiedBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FaBuilding, FaSearch, FaMapMarkerAlt, FaBriefcase, FaArrowRight } from 'react-icons/fa';

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
      c.name.toLowerCase().includes(s) ||
      (c.industry && c.industry.toLowerCase().includes(s)) ||
      (c.location && c.location.toLowerCase().includes(s))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 relative overflow-hidden">
      {/* Background Ambient Glass Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.10] bg-cover bg-center mix-blend-screen z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 px-3.5 py-1 rounded-full glass-surface-1 border border-indigo-500/30">
            Employer Network
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display mt-3">
            Verified Partner Companies
          </h1>
          <p className="text-slate-300 text-base mt-2">
            Explore credible organizations hiring through ZenSolve. Learn about company cultures, benefits, and view active roles.
          </p>

          {/* Search bar */}
          <div className="relative mt-8 max-w-md mx-auto">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search companies by name, industry, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm text-white placeholder:text-slate-400 shadow-xl"
            />
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="glass-surface-2 p-6 rounded-3xl border border-white/10 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-white/5 rounded w-1/2" />
                    <div className="h-3 bg-white/5 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-10 bg-white/5 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((comp) => (
              <Link
                key={comp.name}
                to={`/company/${encodeURIComponent(comp.name)}`}
                className="group glass-surface-2 glass-specular glass-card-interactive p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl glass-surface-1 border border-white/15 p-1 flex items-center justify-center font-bold text-indigo-400 text-lg flex-shrink-0 group-hover:scale-105 transition shadow-inner">
                        {comp.logo ? (
                          <img
                            src={comp.logo}
                            alt={comp.name}
                            className="w-full h-full object-contain rounded-xl"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentNode.textContent = comp.name.charAt(0);
                            }}
                          />
                        ) : (
                          comp.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition tracking-tight font-display">
                          {comp.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <FaMapMarkerAlt className="text-indigo-400 text-[10px]" />
                          <span>{comp.location || 'India'}</span>
                        </div>
                      </div>
                    </div>

                    {comp.verified && <VerifiedBadge text="Verified" size="sm" />}
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                    {comp.about}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-300 group-hover:text-indigo-200">
                    Explore Profile & Jobs
                  </span>
                  <div className="w-8 h-8 rounded-xl glass-surface-1 text-slate-300 group-hover:text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <FaArrowRight size={10} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 glass-surface-2 glass-specular rounded-3xl border border-white/15 max-w-md mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl glass-surface-1 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <FaBuilding size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-display">No Companies Found</h3>
            <p className="text-slate-300 text-xs mb-4">
              Try adjusting your search query to find matching employers.
            </p>
            <Button variant="ghost" size="sm" onClick={() => setSearch('')} className="rounded-xl glass-surface-1">
              Clear Search
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CompanyDirectory;
