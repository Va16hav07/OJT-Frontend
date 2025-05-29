import React from 'react'
import { 
  FaTwitter, 
  FaFacebook, 
  FaInstagram, 
  FaLinkedin, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaGithub,
  FaWhatsapp,
  FaArrowRight,
  FaHeart
} from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleCategoryClick = (category) => {
    // Navigate to product page with category filter
    navigate(`/product?category=${encodeURIComponent(category)}`);
  };

  return (
    <footer className="bg-gradient-to-b from-[#1E3A8A] to-[#0F2057] text-white">
      {/* Main Footer Content */}
      <div className="px-8 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold">Equiply</h2>
            </div>
            <p className="text-sm text-blue-100 mb-4">
              Your trusted platform for renting equipment and tools. From cameras to power tools, 
              we connect you with everything you need at affordable rental rates.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-5 border-b border-gray-600 pb-2">Quick Links</h3>
            <ul className="space-y-3 text-sm text-white">
              <li>
                <Link to="/product" className="hover:text-yellow-300 transition-colors text-left w-full flex items-center gap-2 no-underline text-white">
                  <FaArrowRight className="text-xs text-yellow-400" /> Browse Equipment
                </Link>
              </li>
              <li>
                <Link to="/PutRent" className="hover:text-yellow-300 transition-colors text-left w-full flex items-center gap-2 no-underline text-white">
                  <FaArrowRight className="text-xs text-yellow-400" /> List Your Item
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-yellow-300 transition-colors text-left w-full flex items-center gap-2 no-underline text-white">
                  <FaArrowRight className="text-xs text-yellow-400" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-yellow-300 transition-colors text-left w-full flex items-center gap-2 no-underline text-white">
                  <FaArrowRight className="text-xs text-yellow-400" /> Contact
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-yellow-300 transition-colors text-left w-full flex items-center gap-2 no-underline text-white">
                  <FaArrowRight className="text-xs text-yellow-400" /> Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-yellow-300 transition-colors text-left w-full flex items-center gap-2 no-underline text-white">
                  <FaArrowRight className="text-xs text-yellow-400" /> FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-5 border-b border-blue-700 pb-2">Categories</h3>
            <ul className="space-y-3 text-sm text-blue-100">
              <li>
                <button 
                  onClick={() => handleCategoryClick('Mobile')}
                  className="hover:text-yellow-300 transition-colors text-left w-full flex items-center gap-2"
                >
                  <FaArrowRight className="text-xs text-yellow-400" /> Mobile
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryClick('Electronics')}
                  className="hover:text-yellow-300 transition-colors text-left w-full flex items-center gap-2"
                >
                  <FaArrowRight className="text-xs text-yellow-400" /> Electronics
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryClick('House Appliances')}
                  className="hover:text-yellow-300 transition-colors text-left w-full flex items-center gap-2"
                >
                  <FaArrowRight className="text-xs text-yellow-400" /> House Appliances
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryClick('Accessories')}
                  className="hover:text-yellow-300 transition-colors text-left w-full flex items-center gap-2"
                >
                  <FaArrowRight className="text-xs text-yellow-400" /> Accessories
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryClick('Tools')}
                  className="hover:text-yellow-300 transition-colors text-left w-full flex items-center gap-2"
                >
                  <FaArrowRight className="text-xs text-yellow-400" /> Tools
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryClick('Music')}
                  className="hover:text-yellow-300 transition-colors text-left w-full flex items-center gap-2"
                >
                  <FaArrowRight className="text-xs text-yellow-400" /> Music Equipment
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-5 border-b border-blue-700 pb-2">Contact Us</h3>
            <div className="space-y-4 text-sm text-blue-100">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-yellow-400 mt-1" />
                <span>123 Rental Street<br />Bangalore, Karnataka 560001<br />India</span>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-yellow-400" />
                <span>+91 12345 67890</span>
              </div>
              <div className="flex items-center gap-3">
                <FaWhatsapp className="text-yellow-400" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-yellow-400" />
                <span>support@equiply.com</span>
              </div>
              <div className="bg-blue-700/30 border border-blue-700 rounded-lg p-3 mt-4">
                <p className="text-xs">Customer Support Available:</p>
                <p className="font-semibold text-yellow-300">24/7 for online inquiries</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-blue-700/50">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-blue-200 mb-4 md:mb-0">
              © {currentYear} Equiply. All rights reserved. Made with <FaHeart className="inline text-red-500 mx-1" /> in India
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link to="/privacy" className="text-sm text-blue-200 hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-blue-200 hover:text-white">Terms of Service</Link>
              <Link to="/cookies" className="text-sm text-blue-200 hover:text-white">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
