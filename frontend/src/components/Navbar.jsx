import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gray-800">Health<span className="text-teal-500">Sphere</span></span>
            </Link>
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-10">
            <Link to="/" className="text-gray-700 hover:text-teal-500 px-3 py-2 text-sm font-medium transition-colors duration-200">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-teal-500 px-3 py-2 text-sm font-medium transition-colors duration-200">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-teal-500 px-3 py-2 text-sm font-medium transition-colors duration-200">
              Contact
            </Link>
          </div>
          
          <div className="hidden md:flex md:items-center space-x-4">
            <Link to="/login" className="px-5 py-2.5 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors duration-200 font-medium">
              Login
            </Link>
            <Link to="/register" className="px-5 py-2.5 border border-teal-500 text-teal-500 rounded-md hover:bg-teal-50 transition-colors duration-200 font-medium">
              Register
            </Link>
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-100">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-500 hover:bg-gray-50">
              Home
            </Link>
            <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-500 hover:bg-gray-50">
              About
            </Link>
            <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-500 hover:bg-gray-50">
              Contact
            </Link>
            <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-teal-500 hover:bg-teal-600 mt-4">
              Login
            </Link>
            <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-teal-500 border border-teal-500 hover:bg-teal-50 mt-2">
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
