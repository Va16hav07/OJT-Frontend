import React from 'react';
import Header from '../header';
import Footer from '../Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
          
          <div className="text-sm text-gray-600 mb-8 text-center">
            Last updated: May 2025
          </div>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <p>We collect information you provide directly to us, such as when you create an account, list equipment, or contact us. This includes:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Name, email address, and phone number</li>
                  <li>Profile information and photos</li>
                  <li>Payment information (processed securely through third parties)</li>
                  <li>Equipment listings and descriptions</li>
                  <li>Messages and communications</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Communicate with you about products, services, and events</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect, investigate, and prevent fraudulent transactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
              <p>We may share information about you in the following situations:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>With other users as necessary to facilitate transactions</li>
                <li>With vendors and service providers who perform services for us</li>
                <li>In response to legal process or government requests</li>
                <li>To protect the rights, property, and safety of Equiply and others</li>
                <li>In connection with a merger, sale, or other business transfer</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p>We take reasonable measures to protect your personal information from loss, theft, misuse, and unauthorized access. However, no internet transmission is completely secure, and we cannot guarantee absolute security.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Access and update your personal information</li>
                <li>Delete your account and personal data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your data</li>
                <li>Lodge a complaint with a data protection authority</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at:</p>
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

export default Privacy;
