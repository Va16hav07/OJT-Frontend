import React from 'react';
import Header from '../header';
import Footer from '../Footer';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
          
          <div className="text-sm text-gray-600 mb-8 text-center">
            Last updated: May 2025
          </div>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using Equiply, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p>Permission is granted to temporarily use Equiply for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Modify or copy the materials</li>
                <li>Use the materials for commercial purposes or for public display</li>
                <li>Remove any copyright or proprietary notations</li>
                <li>Transfer the materials to another person</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">For Renters:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Treat rented equipment with care and respect</li>
                  <li>Return equipment in the same condition as received</li>
                  <li>Pay all fees on time</li>
                  <li>Report damages immediately</li>
                </ul>
                
                <h3 className="text-lg font-medium">For Owners:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Provide accurate descriptions of equipment</li>
                  <li>Ensure equipment is in good working condition</li>
                  <li>Respond promptly to rental requests</li>
                  <li>Maintain proper insurance coverage</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Payment and Fees</h2>
              <p>Users agree to pay all fees associated with their use of the platform. This includes:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Rental fees for equipment use</li>
                <li>Platform service fees</li>
                <li>Late return penalties</li>
                <li>Damage repair costs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
              <p>Equiply shall not be liable for any damages arising from the use or inability to use the platform or equipment listed thereon. This includes but is not limited to equipment malfunction, injury, or property damage.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Account Termination</h2>
              <p>We reserve the right to terminate accounts that violate these terms, engage in fraudulent activity, or pose a risk to other users. Users may also terminate their accounts at any time.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
              <p>We reserve the right to revise these terms at any time. Changes will be effective immediately upon posting. Continued use of the platform constitutes acceptance of revised terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
              <p>For questions about these Terms of Service, please contact us at:</p>
              <div className="ml-4 mt-2">
                <p>Email: legal@equiply.com</p>
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

export default Terms;
