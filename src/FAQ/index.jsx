import React, { useState } from 'react';
import Header from '../header';
import Footer from '../Footer';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I sign up for Equiply?",
          answer: "Simply click the 'Sign Up' button in the top right corner, fill in your details, and verify your email address. Once verified, you can start browsing and renting equipment immediately."
        },
        {
          question: "Is there a fee to join Equiply?",
          answer: "No, joining Equiply is completely free. You only pay when you rent equipment or list your items for rent."
        },
        {
          question: "How do I verify my account?",
          answer: "After signing up, you'll receive a verification email. Click the link in the email to verify your account. For additional security, you may also verify your phone number."
        }
      ]
    },
    {
      category: "Renting Equipment",
      questions: [
        {
          question: "How do I rent equipment?",
          answer: "Browse our catalog, select the equipment you need, choose your rental period, and proceed to checkout. You'll need to provide a delivery address and payment method."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through our encrypted payment system."
        },
        {
          question: "Can I extend my rental period?",
          answer: "Yes, you can extend your rental period by contacting the equipment owner directly through our messaging system or by calling our support team."
        },
        {
          question: "What if the equipment is damaged during my rental?",
          answer: "If equipment is damaged during your rental, please report it immediately. Depending on the damage, you may be responsible for repair costs or replacement fees as outlined in our terms of service."
        }
      ]
    },
    {
      category: "Listing Equipment",
      questions: [
        {
          question: "How do I list my equipment for rent?",
          answer: "Click 'Put for Rent' in your user menu, fill out the equipment details, upload photos, set your pricing, and publish your listing. Our team will review it before it goes live."
        },
        {
          question: "How much can I earn from renting my equipment?",
          answer: "Earnings depend on your equipment type, demand, and pricing. Our platform takes a small commission from each rental, and you keep the rest."
        },
        {
          question: "How do I set fair rental prices?",
          answer: "Check similar listings on our platform for pricing guidance. Consider factors like equipment value, depreciation, maintenance costs, and market demand."
        },
        {
          question: "What if my equipment gets damaged by a renter?",
          answer: "All rentals are covered by our protection program. Renters are responsible for damages, and we help facilitate resolution through our support team."
        }
      ]
    },
    {
      category: "Safety & Security",
      questions: [
        {
          question: "How do you ensure user safety?",
          answer: "All users must verify their identity and contact information. We also have a rating system and community guidelines to maintain a safe environment."
        },
        {
          question: "What if I have issues with a rental?",
          answer: "Contact our support team immediately through the help center. We're available 24/7 to help resolve any issues between renters and equipment owners."
        },
        {
          question: "Are transactions secure?",
          answer: "Yes, all transactions are processed through secure, encrypted payment gateways. We never store your complete payment information on our servers."
        }
      ]
    },
    {
      category: "Support",
      questions: [
        {
          question: "How can I contact customer support?",
          answer: "You can reach us through the contact form, email us at support@equiply.com, or call us at +91 12345 67890. We're available 24/7 for urgent issues."
        },
        {
          question: "How long does it take to get a response from support?",
          answer: "We typically respond to emails within 2-4 hours during business hours. For urgent issues, please call our support line for immediate assistance."
        },
        {
          question: "Can I cancel my rental after booking?",
          answer: "Cancellation policies vary by equipment owner. Check the cancellation policy on the listing page before booking. Some rentals may allow free cancellation within a certain timeframe."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
          
          <div className="mb-8 text-center">
            <p className="text-gray-600">
              Find answers to common questions about Equiply. If you can't find what you're looking for, 
              feel free to <a href="/contact" className="text-blue-600 hover:underline">contact us</a>.
            </p>
          </div>

          <div className="space-y-8">
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-semibold mb-4 text-blue-600">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const itemKey = `${categoryIndex}-${faqIndex}`;
                    return (
                      <div key={itemKey} className="border rounded-lg">
                        <button
                          className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
                          onClick={() => toggleItem(itemKey)}
                        >
                          <span className="font-medium">{faq.question}</span>
                          {openItems[itemKey] ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                        {openItems[itemKey] && (
                          <div className="p-4 border-t bg-gray-50">
                            <p className="text-gray-700">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you with any questions not covered above.
            </p>
            <button 
              className="bg-black text-white px-6 py-2 rounded-lg hover:opacity-90"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
