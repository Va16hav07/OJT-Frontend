import React from 'react';
import Header from '../header';
import Footer from '../Footer';
import { FaSearch, FaBook, FaQuestionCircle, FaHeadset, FaShieldAlt, FaCreditCard } from 'react-icons/fa';

const HelpCenter = () => {
  const helpCategories = [
    {
      icon: <FaBook />,
      title: "Getting Started",
      description: "Learn the basics of using Equiply",
      topics: ["Account Setup", "Profile Verification", "First Rental", "Navigation Guide"]
    },
    {
      icon: <FaSearch />,
      title: "Renting Equipment",
      description: "Everything about renting equipment",
      topics: ["How to Search", "Booking Process", "Delivery Options", "Return Process"]
    },
    {
      icon: <FaCreditCard />,
      title: "Payments & Billing",
      description: "Payment methods and billing information",
      topics: ["Payment Options", "Billing Cycle", "Refunds", "Security Deposits"]
    },
    {
      icon: <FaShieldAlt />,
      title: "Safety & Security",
      description: "Stay safe while using our platform",
      topics: ["User Verification", "Equipment Safety", "Insurance Coverage", "Dispute Resolution"]
    },
    {
      icon: <FaQuestionCircle />,
      title: "Listing Equipment",
      description: "How to list your equipment for rent",
      topics: ["Create Listing", "Pricing Guide", "Photo Tips", "Managing Bookings"]
    },
    {
      icon: <FaHeadset />,
      title: "Support",
      description: "Get help when you need it",
      topics: ["Contact Support", "Report Issues", "Live Chat", "Emergency Help"]
    }
  ];

  const quickActions = [
    { title: "Track Your Order", description: "See the status of your current rentals" },
    { title: "Manage Listings", description: "Edit or update your equipment listings" },
    { title: "Payment History", description: "View your transaction history" },
    { title: "Account Settings", description: "Update your profile and preferences" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-gray-600 text-lg mb-8">
              Find answers, get support, and learn how to make the most of Equiply
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Help Categories */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Browse by Category</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category, index) => (
                <div key={index} className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                  <div className="text-blue-600 text-2xl mb-4">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <ul className="space-y-1">
                    {category.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="text-sm text-blue-600 hover:underline cursor-pointer">
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Articles */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Popular Articles</h2>
            <div className="space-y-4">
              {[
                "How to rent equipment for the first time",
                "Setting up your profile and verification",
                "Understanding rental pricing and fees",
                "What to do if equipment is damaged",
                "How to list your equipment safely",
                "Payment methods and security"
              ].map((article, index) => (
                <div key={index} className="p-4 border-l-4 border-blue-500 bg-blue-50 hover:bg-blue-100 cursor-pointer">
                  <p className="font-medium text-gray-800">{article}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-semibold mb-4">Still Need Help?</h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button 
                className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-90"
                onClick={() => window.location.href = '/contact'}
              >
                Contact Support
              </button>
              <button 
                className="border border-black text-black px-6 py-3 rounded-lg hover:bg-gray-100"
                onClick={() => window.location.href = '/FAQ'}
              >
                View FAQ
              </button>
            </div>
            
            <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Email Support</h4>
                <p className="text-gray-600">support@equiply.com</p>
                <p className="text-gray-500">Response within 2-4 hours</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Phone Support</h4>
                <p className="text-gray-600">+91 12345 67890</p>
                <p className="text-gray-500">24/7 available</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Live Chat</h4>
                <p className="text-gray-600">Available on website</p>
                <p className="text-gray-500">Mon-Fri, 9 AM - 6 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HelpCenter;
