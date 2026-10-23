import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { FaStar, FaQuoteLeft, FaCheckCircle, FaUser } from 'react-icons/fa';

const TestimonialsList = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        const snap = await getDocs(collection(db, 'testimonials'));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (isMounted) {
          setTestimonials(list);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        if (isMounted) setLoading(false);
      }
    };
    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="glass-panel bg-white/80 p-6 rounded-2xl border border-slate-200 animate-pulse space-y-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-4 h-4 bg-slate-200 rounded-full" />
              ))}
            </div>
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
            <div className="h-10 bg-slate-200 rounded-xl mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div className="glass-panel bg-white/80 p-8 rounded-3xl border border-slate-200/90 text-center max-w-xl mx-auto shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <FaQuoteLeft className="text-lg" />
        </div>
        <h4 className="text-base font-bold text-slate-900 font-display">No reviews published yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Share your placement journey or recruiter feedback below to help other candidates navigate their careers.
        </p>
      </div>
    );
  }

  const displayList = testimonials;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {displayList.slice(0, 6).map((item) => (
        <div
          key={item.id}
          className="glass-panel bg-white/90 p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-indigo-400/50 hover:shadow-md transition duration-300 relative group"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex text-amber-500 gap-1 text-sm">
                {[...Array(item.rating || 5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <FaQuoteLeft className="text-slate-300 text-lg group-hover:text-indigo-400 transition" />
            </div>

            <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">
              "{item.review}"
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {item.name ? item.name.charAt(0) : <FaUser size={12} />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900">{item.name}</span>
                <FaCheckCircle className="text-blue-500 text-xs" />
              </div>
              <span className="text-xs text-slate-500">
                {item.role || 'Verified Candidate'}
                {item.company ? ` • ${item.company}` : ''}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestimonialsList;
