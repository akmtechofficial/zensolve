import React from 'react';
import Slideshow from '../components/Slideshow';
import TopCompanies from '../components/TopCompanies';
import PopularCategories from '../components/PopularCategories';
import JobList from '../Joblist';
import TestimonialsForm from '../components/Testimonials';
import TestimonialsList from '../components/TestimonialsList';
import { motion } from 'framer-motion'; // For smooth animations

const Home = () => {
  return (
    <div className="">
      {/* Slideshow Section */}
      <section className="my-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <Slideshow />
        </motion.div>
      </section>

      {/* Top Companies Section */}
      <section className="my-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <TopCompanies />
        </motion.div>
      </section>

      {/* Popular Categories Section */}
      <section className="my-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <PopularCategories />
        </motion.div>
      </section>

      {/* Jobs Section */}
      <section className="my-6 bg-gradient-to-r from-blue-200 to-blue-300 p-6 rounded-lg shadow-lg">
        <motion.h3
          className="text-2xl font-semibold mb-4 text-center text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          Jobs at a Glance
        </motion.h3>
        <JobList maxJobs={5} />
      </section>

      {/* Testimonials Section */}
      <section className="my-6 bg-gray-50 p-6 rounded-lg shadow-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <TestimonialsForm />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
        >
          <TestimonialsList />
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
