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
              <p>Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide information to website owners.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
              <p>We use cookies for several purposes:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>To keep you signed in to your account</li>
                <li>To remember your preferences and settings</li>
                <li>To analyze how our website is used</li>
                <li>To provide personalized content and recommendations</li>
                <li>To improve our services and user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Essential Cookies</h3>
                  <p>These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Performance Cookies</h3>
                  <p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Functional Cookies</h3>
                  <p>These cookies enable enhanced functionality and personalization, such as remembering your login details and preferences.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Targeting Cookies</h3>
                  <p>These cookies may be set by our advertising partners to build a profile of your interests and show relevant ads on other sites.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
              <p>We may also use third-party services that place cookies on your device. These include:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Google Analytics for website analytics</li>
                <li>Payment processors for secure transactions</li>
                <li>Social media platforms for sharing functionality</li>
                <li>Customer support tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Managing Cookies</h2>
              <p>You can control and manage cookies in various ways:</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Browser Settings</h3>
                  <p>Most browsers allow you to view, delete, and block cookies. You can usually find these options in your browser's privacy or security settings.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Opt-Out Tools</h3>
                  <p>Many advertising companies provide opt-out tools to stop them from collecting your data for advertising purposes.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Platform Controls</h3>
                  <p>You can adjust your cookie preferences in your account settings when logged in to Equiply.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Impact of Disabling Cookies</h2>
              <p>Please note that disabling certain cookies may impact your experience on our website. Some features may not work properly, and you may need to re-enter information more frequently.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
              <p>We may update this Cookie Policy from time to time. When we do, we will post the updated policy on this page and update the "Last updated" date.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
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
