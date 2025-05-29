import React from 'react'
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    // Navigate to product page with category filter
    navigate(`/product?category=${encodeURIComponent(category)}`);
  };

  return (
    <footer className="bg-[#1E3A8A] text-white px-8 py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Equiply</h2>
          <p className="text-sm text-gray-300 mb-4">
            Your trusted platform for renting equipment and tools. From cameras to power tools, 
            we connect you with everything you need at affordable rental rates.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-md font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="/product" className="hover:text-white">Browse Equipment</a></li>
            <li><a href="/PutRent" className="hover:text-white">List Your Item</a></li>
            <li><a href="/about" className="hover:text-white">About Us</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
            <li><a href="/help" className="hover:text-white">Help Center</a></li>
            <li><a href="/faq" className="hover:text-white">FAQ</a></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-md font-semibold mb-4">Categories</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <button 
                onClick={() => handleCategoryClick('Mobile')}
                className="hover:text-white text-left w-full"
              >
                Mobile
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleCategoryClick('Electronics')}
                className="hover:text-white text-left w-full"
              >
                Electronics
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleCategoryClick('House Appliances')}
                className="hover:text-white text-left w-full"
              >
                House Appliances
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleCategoryClick('Accessories')}
                className="hover:text-white text-left w-full"
              >
                Accessories
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleCategoryClick('Tools')}
                className="hover:text-white text-left w-full"
              >
                Tools
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleCategoryClick('Music')}
                className="hover:text-white text-left w-full"
              >
                Music Equipment
              </button>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-md font-semibold mb-4">Contact Us</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-400" />
              <span>Bangalore, Karnataka, India</span>
            </div>
            <div className="flex items-center gap-2">
              <FaPhone className="text-gray-400" />
              <span>+91 12345 67890</span>
            </div>
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-gray-400" />
              <span>support@equiply.com</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-400">Available 24/7 for support</p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-600">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400">
            © 2025 Equiply. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="text-sm text-gray-400 hover:text-white">Privacy Policy</a>
            <a href="/terms" className="text-sm text-gray-400 hover:text-white">Terms of Service</a>
            <a href="/cookies" className="text-sm text-gray-400 hover:text-white">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
