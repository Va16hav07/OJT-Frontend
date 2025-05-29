import React from 'react';
import Header from '../header';
import Footer from '../Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">About Equiply</h1>
          
          <div className="mb-12">
            <img 
              src="https://via.placeholder.com/800x300?text=Equiply+Team" 
              alt="Equiply Team" 
              className="w-full h-64 object-cover rounded-lg mb-8"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                At Equiply, we believe that everyone should have access to quality equipment without 
                the burden of ownership. Our mission is to create a sustainable sharing economy where 
                people can rent what they need, when they need it, at affordable prices.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
              <p className="text-gray-700 leading-relaxed">
                We envision a world where resources are shared efficiently, reducing waste and 
                environmental impact while making equipment accessible to everyone. By connecting 
                renters with owners, we're building a community-driven marketplace.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Why Choose Equiply?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-lg">
                <div className="text-3xl mb-4">🛠️</div>
                <h3 className="font-semibold mb-2">Quality Equipment</h3>
                <p className="text-gray-600">All equipment is verified and maintained to ensure quality and safety.</p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <div className="text-3xl mb-4">💰</div>
                <h3 className="font-semibold mb-2">Affordable Pricing</h3>
                <p className="text-gray-600">Rent at a fraction of the cost of buying new equipment.</p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <div className="text-3xl mb-4">🤝</div>
                <h3 className="font-semibold mb-2">Trusted Community</h3>
                <p className="text-gray-600">Join thousands of verified users in our trusted rental community.</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Our Story</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 leading-relaxed mb-4">
                Founded in 2025, Equiply started with a simple idea: why buy when you can rent? 
                Our founders noticed that expensive equipment often sits unused for months, while 
                others struggle to afford the tools they need for their projects.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Today, we've grown into a platform that serves thousands of users across India, 
                facilitating everything from camera rentals for special occasions to power tools 
                for home improvement projects. We're proud to be part of the sharing economy revolution.
              </p>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
            <p className="text-gray-700 mb-6">
              Whether you're looking to rent equipment or share your own, we're here to help.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                className="bg-black text-white px-6 py-2 rounded-lg hover:opacity-90"
                onClick={() => window.location.href = '/product'}
              >
                Browse Equipment
              </button>
              <button 
                className="border border-black text-black px-6 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => window.location.href = '/PutRent'}
              >
                List Your Item
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
