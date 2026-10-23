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
    <section className="py-14 border-y border-slate-200/80 glass-surface-1 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
              <FaBuilding className="text-xs" />
              Verified Hiring Network
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Top Companies Recruiting on ZenSolve
            </h3>
          </div>

          <Link
            to="/companies"
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition group"
          >
            <span>View All Partner Companies</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Companies Content */}
      {loading ? (
        <div className="flex gap-4 overflow-hidden px-6 py-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl glass-surface-2 border border-slate-200 animate-pulse w-56 h-16 flex-shrink-0"
            />
          ))}
        </div>
      ) : companies.length > 0 ? (
        <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          <div className="flex gap-6 animate-marquee whitespace-nowrap py-3">
            {companies.concat(companies).map((comp, idx) => (
              <Link
                key={idx}
                to={`/company/${encodeURIComponent(comp.name)}`}
                className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl glass-surface-2 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition duration-300 flex-shrink-0 group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-indigo-600 text-sm overflow-hidden flex-shrink-0 shadow-xs">
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
                    <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {comp.name}
                    </span>
                    <FaCheckCircle className="text-blue-500 text-xs flex-shrink-0" />
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {comp.openRolesCount} Open Role{comp.openRolesCount > 1 ? 's' : ''} • {comp.industry}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto text-center px-4 py-4">
          <p className="text-xs sm:text-sm text-slate-500 mb-3">
            Verified employer partners and enterprise recruiting teams will appear here once registered.
          </p>
          <Link
            to="/register?role=employer"
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition"
          >
            <span>Register Your Organization</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>
      )}
    </section>
  );
};

export default TopCompanies;
