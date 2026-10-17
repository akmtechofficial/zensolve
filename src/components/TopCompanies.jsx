import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { getCompanies } from '../services/recruitmentService';
import { FaBuilding, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { VerifiedBadge } from './ui/Badge';

const TopCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      try {
        // 1. Fetch logos from companyLogos
        const logosRef = collection(db, 'companyLogos');
        const logosSnap = await getDocs(logosRef);
        const fetchedLogos = logosSnap.docs.map((doc) => doc.data().logoUrl).filter(Boolean);

        // 2. Fetch companies from jobs
        const compList = await getCompanies();

        if (isMounted) {
          setLogos(fetchedLogos);
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
    <section className="py-14 border-y border-slate-850/80 bg-slate-950/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <FaBuilding className="text-xs" />
              Verified Hiring Network
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Top Companies Recruiting on ZenSolve
            </h3>
          </div>

          <Link
            to="/companies"
            className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition group"
          >
            <span>View All Partner Companies</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Marquee Banner */}
      <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <div className="flex gap-6 animate-marquee whitespace-nowrap py-3">
          {companies.length > 0 ? (
            companies.concat(companies).map((comp, idx) => (
              <Link
                key={idx}
                to={`/company/${encodeURIComponent(comp.name)}`}
                className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl glass-panel bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-850 transition duration-300 flex-shrink-0 group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-indigo-300 text-sm overflow-hidden flex-shrink-0">
                  {comp.logo ? (
                    <img
                      src={comp.logo}
                      alt={comp.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.textContent = comp.name.charAt(0);
                      }}
                    />
                  ) : (
                    comp.name.charAt(0)
                  )}
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                      {comp.name}
                    </span>
                    <FaCheckCircle className="text-blue-400 text-xs flex-shrink-0" />
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    {comp.openRolesCount} Open Role{comp.openRolesCount > 1 ? 's' : ''} • {comp.industry}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            // Fallback partner cards while loading or if empty
            ['Tech Mahindra', 'Infosys', 'HCL Technologies', 'TCS', 'Wipro', 'Accenture', 'Cognizant'].concat(
              ['Tech Mahindra', 'Infosys', 'HCL Technologies', 'TCS', 'Wipro', 'Accenture', 'Cognizant']
            ).map((partner, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl glass-panel bg-slate-900/80 border border-slate-800 flex-shrink-0"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-sm">
                  {partner.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-slate-300">{partner}</span>
                <VerifiedBadge text="Verified" size="sm" />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default TopCompanies;
