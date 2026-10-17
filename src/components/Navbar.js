import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ? user : null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg text-white py-4">
      <div className="container mx-auto flex justify-between items-center px-6">
        <h1 className="text-3xl font-extrabold tracking-wide">ZenSolve Infotech</h1>
        
        {/* Hamburger menu for mobile */}
        <div className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes size={28} className="cursor-pointer" /> : <FaBars size={28} className="cursor-pointer" />}
        </div>

        {/* Navbar Links */}
        <ul className={`md:flex md:items-center md:space-x-6 absolute md:static top-16 left-0 w-full md:w-auto bg-blue-600 md:bg-transparent shadow-md md:shadow-none transition-all ${isOpen ? 'block' : 'hidden'}`}>
          <li className="hover:text-gray-300 text-lg"><Link to="/">Home</Link></li>
          <li className="hover:text-gray-300 text-lg"><Link to="/jobs">Jobs</Link></li>
          <li className="hover:text-gray-300 text-lg">
            <a href="https://membership2-0.vercel.app/" target="_blank" rel="noopener noreferrer">Join Membership</a>
          </li>
          <li className="hover:text-gray-300 text-lg"><Link to="/contactus">Contact Us</Link></li>
          
          {user ? (
            <>
              <li className="flex items-center space-x-2 text-lg hover:text-gray-300">
                <FaUserCircle size={22} />
                <span>{user.email}</span>
              </li>
              <li className="flex items-center space-x-2 text-lg hover:text-gray-300 cursor-pointer" onClick={handleLogout}>
                <FaSignOutAlt size={22} />
                <span>Logout</span>
              </li>
              <li className="hover:text-gray-300 text-lg"><Link to="/saved-jobs">Saved Jobs</Link></li>
            </>
          ) : (
            <>
              <li className="hover:text-gray-300 text-lg"><Link to="/login">Login</Link></li>
              <li className="hover:text-gray-300 text-lg"><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;