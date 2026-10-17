import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { saveContactDetails } from './inhelp';
import { db } from '../firebaseConfig';
import { Button } from '../components/ui/Button';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUser,
  FaComment,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
} from 'react-icons/fa';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [contactDetails, setContactDetails] = useState({
    email: 'support@zensolve.com',
    phone: '+91 (Support Desk)',
    address: 'Patna, Bihar, India',
  });

  useEffect(() => {
    let isMounted = true;
    const fetchContactData = async () => {
      try {
        const docRef = doc(db, 'settings', 'contactData');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && isMounted) {
          setContactDetails((prev) => ({ ...prev, ...docSnap.data() }));
        }
      } catch (err) {
        console.error('Error fetching contact settings:', err);
      }
    };
    fetchContactData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError('Please provide your name, email, and message inquiry.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await saveContactDetails({ name, email, phone, message });

    if (result.success) {
      setSuccess('Your message has been sent successfully! Our recruitment support team will respond within 24 hours.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } else {
      setError(result.message || 'Failed to submit inquiry. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 mask-radial" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            Assistance & Inquiries
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display mt-3">
            Get in Touch With Us
          </h1>
          <p className="text-slate-400 text-base mt-2">
            Have questions about career matching, employer registration, or corporate partnerships? We are here to help.
          </p>
        </div>

        {/* 2-Column Split: Form & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto">
          
          {/* Contact Details Column (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <h3 className="text-xl font-bold text-white tracking-tight">Contact Information</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connect directly with our recruitment desk, employer solutions specialists, and candidate career coaches.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaMapMarkerAlt size={16} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Office Address</span>
                    <span className="text-sm text-slate-200 font-medium leading-snug">
                      {contactDetails.address}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <FaEnvelope size={15} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Email Inquiry</span>
                    <a
                      href={`mailto:${contactDetails.email}`}
                      className="text-sm text-indigo-400 hover:underline font-medium"
                    >
                      {contactDetails.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center flex-shrink-0">
                    <FaPhone size={15} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Direct Hotline</span>
                    <a
                      href={`tel:${contactDetails.phone}`}
                      className="text-sm text-slate-200 hover:text-white font-medium"
                    >
                      {contactDetails.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <FaClock size={15} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Support Hours</span>
                    <span className="text-sm text-slate-200 font-medium">Monday – Saturday: 9:30 AM – 6:30 PM IST</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column (Span 7) */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-2xl bg-slate-900/90"
            >
              <h3 className="text-xl font-bold text-white mb-2">Send Us a Direct Message</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Your Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ramesh@example.com"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Message / Inquiry <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="4"
                  placeholder="How can our recruitment or consultancy team assist you today?"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                  <FaExclamationTriangle className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                  <FaCheckCircle className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full"
              >
                Send Message
              </Button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ContactUs;
