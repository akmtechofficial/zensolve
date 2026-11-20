import React, { useState } from 'react';
import { db } from '../firebaseConfig'; // Import Firestore
import { collection, addDoc } from 'firebase/firestore';
import { FaEnvelope, FaPhoneAlt, FaUser, FaMapMarkerAlt, FaFileAlt } from 'react-icons/fa'; // Icons for inputs

const ApplyJobForm = ({ job }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [resume, setResume] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the file is a valid PDF or DOC
    if (resume && !/\.(pdf|doc|docx)$/i.test(resume.name)) {
      setError('Only PDF or DOC files are allowed for the resume.');
      return;
    }

    try {
      // Prepare application data
      const applicationData = {
        name,
        email,
        phone,
        age,
        address,
        resume: resume ? resume.name : '', // Save the resume file name
        jobPosition: job.position,
        companyName: job.companyName,
      };

      // Save application data to Firestore
      await addDoc(collection(db, 'jobApplications'), applicationData);
      alert('Application submitted successfully!');
    } catch (error) {
      setError('Failed to submit application. Please try again.');
      console.error('Error adding document: ', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setResume(file);
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-8 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl shadow-xl animate__animated animate__fadeIn animate__delay-1s">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-3xl font-bold text-white mb-6 text-center animate__animated animate__fadeInUp">
          Apply for {job.position} at {job.companyName}
        </h2>

        {/* Name Input with Icon */}
        <div className="relative">
          <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="border p-3 pl-12 w-full rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Your Name"
            required
          />
        </div>

        {/* Email Input with Icon */}
        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="border p-3 pl-12 w-full rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Your Email"
            required
          />
        </div>

        {/* Phone Input with Icon */}
        <div className="relative">
          <FaPhoneAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            className="border p-3 pl-12 w-full rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Your Phone Number"
            required
          />
        </div>

        {/* Age Input */}
        <div className="relative">
          <input 
            type="number" 
            value={age} 
            onChange={(e) => setAge(e.target.value)} 
            className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Your Age"
            required
          />
        </div>

        {/* Address Input with Icon */}
        <div className="relative">
          <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
          <textarea 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            className="border p-3 pl-12 w-full rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Your Address"
            required
          />
        </div>

        {/* Resume File Upload with Custom Styling */}
        <div className="relative mt-4">
          <h4 className="text-white font-semibold mb-2">Upload Resume</h4>
          <label className="w-full flex justify-between items-center bg-white text-blue-600 p-3 rounded-lg cursor-pointer hover:bg-blue-100">
            <FaFileAlt size={20} className="mr-2" />
            <span className="text-gray-600">{resume ? resume.name : 'Choose File'}</span>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange} 
              className="hidden"
              required
            />
          </label>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Submit Button */}
        <div className="text-center">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none transform transition-all hover:scale-105">
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplyJobForm;
