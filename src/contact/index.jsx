import React, { useState } from 'react';
import Header from '../header';
import Footer from '../Footer';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return { isValid: false, message: "Email is required" };
    if (!emailRegex.test(email)) return { isValid: false, message: "Please enter a valid email address" };
    return { isValid: true, message: "" };
  };

  const validateName = (name) => {
    if (!name.trim()) return { isValid: false, message: "Name is required" };
    if (name.trim().length < 2) return { isValid: false, message: "Name must be at least 2 characters" };
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return { isValid: false, message: "Name can only contain letters and spaces" };
    return { isValid: true, message: "" };
  };

  const validateSubject = (subject) => {
    if (!subject.trim()) return { isValid: false, message: "Subject is required" };
    if (subject.trim().length < 5) return { isValid: false, message: "Subject must be at least 5 characters" };
    return { isValid: true, message: "" };
  };

  const validateMessage = (message) => {
    if (!message.trim()) return { isValid: false, message: "Message is required" };
    if (message.trim().length < 10) return { isValid: false, message: "Message must be at least 10 characters" };
    return { isValid: true, message: "" };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Real-time validation
    let validation = { isValid: true, message: "" };
    switch (name) {
      case 'name':
        validation = validateName(value);
        break;
      case 'email':
        validation = validateEmail(value);
        break;
      case 'subject':
        validation = validateSubject(value);
        break;
      case 'message':
        validation = validateMessage(value);
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? '' : validation.message
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const nameValidation = validateName(formData.name);
    const emailValidation = validateEmail(formData.email);
    const subjectValidation = validateSubject(formData.subject);
    const messageValidation = validateMessage(formData.message);
    
    const errors = {};
    if (!nameValidation.isValid) errors.name = nameValidation.message;
    if (!emailValidation.isValid) errors.email = emailValidation.message;
    if (!subjectValidation.isValid) errors.subject = subjectValidation.message;
    if (!messageValidation.isValid) errors.message = messageValidation.message;
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert('Thank you for your message! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setValidationErrors({});
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
              <p className="text-gray-700 mb-8">
                Have questions about Equiply? We're here to help! Reach out to us through 
                any of the methods below or fill out the contact form.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-gray-600">
                      Equiply Headquarters<br />
                      Koramangala, Bangalore<br />
                      Karnataka 560034, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaPhone className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-gray-600">+91 12345 67890</p>
                    <p className="text-gray-600">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaEnvelope className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-600">support@equiply.com</p>
                    <p className="text-gray-600">info@equiply.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaClock className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold">Business Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your full name"
                    maxLength={50}
                  />
                  {validationErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="What is this regarding?"
                    maxLength={100}
                  />
                  {validationErrors.subject && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tell us how we can help you..."
                    maxLength={500}
                  ></textarea>
                  {validationErrors.message && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.message}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">{formData.message.length}/500 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
