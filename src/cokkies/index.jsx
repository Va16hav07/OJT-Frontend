import React from 'react';
import Header from '../header';
import Footer from '../Footer';

const Cookies = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Cookie Policy</h1>
          
          <div className="text-sm text-gray-600 mb-8 text-center">
            Last updated: May 2025
          </div>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
              <p>Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better browsing experience by remembering your preferences and enabling certain features.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
              <p>We use cookies for various purposes including:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Authentication and security</li>
                <li>Remembering your preferences and settings</li>
                <li>Analyzing website traffic and usage patterns</li>
                <li>Providing personalized content and recommendations</li>
                <li>Enabling social media features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Essential Cookies</h3>
                  <p>These cookies are necessary for the website to function properly and cannot be disabled.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Analytics Cookies</h3>
                  <p>Help us understand how visitors interact with our website by collecting anonymous information.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Functional Cookies</h3>
                  <p>Remember your preferences and provide enhanced, personalized features.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Marketing Cookies</h3>
                  <p>Used to track visitors across websites to display relevant advertisements.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Managing Cookies</h2>
              <p>You can control and manage cookies in several ways:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Browser settings: Most browsers allow you to control cookies through their settings</li>
                <li>Cookie consent banner: Use our cookie preferences center when you first visit our site</li>
                <li>Opt-out links: Some third-party cookies can be disabled through their opt-out mechanisms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Third-Party Cookies</h2>
              <p>We may use third-party services that place cookies on your device, including:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Google Analytics for website analytics</li>
                <li>Payment processors for secure transactions</li>
                <li>Social media platforms for sharing features</li>
                <li>Advertising networks for targeted ads</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
              <p>If you have questions about our use of cookies, please contact us at:</p>
              <div className="ml-4 mt-2">
                <p>Email: privacy@equiply.com</p>
                <p>Phone: +91 12345 67890</p>
                <p>Address: Koramangala, Bangalore, Karnataka 560034, India</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cookies;
