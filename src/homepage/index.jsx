import React, { useState, useEffect } from "react";
import Header from "../header";
import Footer from "../Footer";
import { Link, useNavigate } from "react-router-dom";

const Homepage = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get featured products from the public endpoint
        const featuredResponse = await fetch("https://equiply-jrej.onrender.com/product/featured");
        const featuredData = await featuredResponse.json();
        
        if (featuredData.success && Array.isArray(featuredData.featuredProducts)) {
          setFeaturedProducts(featuredData.featuredProducts);
        } else {
          setFeaturedProducts([]);
        }
        
        // Get all products for the "Most Popular" section
        const response = await fetch("https://equiply-jrej.onrender.com/product");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
        
        setLoading(false);
      } catch (err) {
        console.error("Error in fetchProducts:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/productview/${productId}`);
  };

  return (
    <div>
      <Header />
      <div className="max-w-[90%] mx-auto px-2 sm:px-4 pb-8 pt-8 md:pt-10">
        {/* Enhanced Hero Section */}
        <div className="relative rounded-2xl overflow-hidden mb-12 mt-4 md:mt-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-90 z-10"></div>
          
          {/* Background pattern */}
          <div className="absolute inset-0 z-0 opacity-20">
            <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between py-16 px-8 md:px-16 relative z-20">
            {/* Text Content */}
            <div className="text-left mb-8 md:mb-0 md:w-1/2">
              <h2 className="text-white text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Why <span className="text-yellow-400">Buy?</span> When You Can <span className="text-yellow-400">Rent</span>
              </h2>
              <p className="text-blue-100 text-xl md:text-2xl mb-6">
                Access quality equipment without the commitment of ownership.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/product" className="bg-white text-blue-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-400 hover:text-blue-900 transition-all transform hover:scale-105">
                  Browse Equipment
                </Link>
                <Link to="/putrent" className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-900 transition-all">
                  List Your Equipment
                </Link>
              </div>
            </div>
            
            {/* Images */}
            <div className="relative w-full md:w-1/2 flex justify-center">
              <div className="grid grid-cols-2 gap-3">
                <div className="transform -rotate-6 transition-transform hover:rotate-0 hover:scale-105">
                  <img 
                    src="https://images.unsplash.com/photo-1575318634028-6a0cfcb60c1a?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=200" 
                    alt="Camera equipment" 
                    className="rounded-lg shadow-lg h-36 w-36 object-cover"
                  />
                </div>
                <div className="transform rotate-6 transition-transform hover:rotate-0 hover:scale-105 mt-8">
                  <img 
                    src="https://images.unsplash.com/photo-1580974928064-f0aeef70895a?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=200" 
                    alt="Power tools" 
                    className="rounded-lg shadow-lg h-36 w-36 object-cover" 
                  />
                </div>
                <div className="transform rotate-6 transition-transform hover:rotate-0 hover:scale-105">
                  <img 
                    src="https://images.unsplash.com/photo-1545127398-14699f92334b?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=200" 
                    alt="Sports equipment" 
                    className="rounded-lg shadow-lg h-36 w-36 object-cover"
                  />
                </div>
                <div className="transform -rotate-6 transition-transform hover:rotate-0 hover:scale-105 mt-8">
                  <img 
                    src="https://images.unsplash.com/photo-1541664885972-9724a6d60d8f?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=200" 
                    alt="Musical instruments" 
                    className="rounded-lg shadow-lg h-36 w-36 object-cover"
                  />
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full font-bold transform rotate-12 shadow-lg">
                Save 70%
              </div>
              <div className="absolute bottom-0 left-0 bg-white text-blue-900 px-3 py-1 rounded-full font-bold transform -rotate-12 shadow-lg">
                Eco-friendly
              </div>
            </div>
          </div>
          
          {/* Benefits bar */}
          <div className="bg-white/10 backdrop-blur-sm py-4 px-8 flex flex-wrap justify-around items-center gap-4 border-t border-white/20 relative z-20">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white">Short-term rentals</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-white">Save money</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white">Verified equipment</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-white">Secure payments</span>
            </div>
          </div>
        </div>

        {/* Featured Products Section - Enhanced Title Only */}
        <div className="mb-12">
          <div className="relative text-center mb-10">
            <h2 className="text-neutral-700 text-4xl font-bold font-['Oxygen']">
              Featured Products
            </h2>
            <div className="mt-2 w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
            <p className="text-gray-500 mt-3">Premium equipment handpicked for you</p>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">Error: {error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.isArray(featuredProducts) && featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div
                    key={product._id || Math.random().toString()}
                    className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div 
                      className="cursor-pointer" 
                      onClick={() => handleProductClick(product._id)}
                    >
                      <img
                        src={product.images || "https://via.placeholder.com/150"}
                        alt={product.name}
                        className="w-32 h-32 object-contain mb-4"
                      />
                    </div>
                    <h3 className="text-base font-medium mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-lg font-bold mb-4 text-slate-700">₹{product.price}</p>
                    <Link to={`/productview/${product._id}`} className="w-full">
                      <button className="w-full bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800 transition-colors">
                        Rent Now
                      </button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No featured products available at the moment.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Popular Products Section - Enhanced Title Only */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <div className="relative mb-4 md:mb-0">
              <h2 className="text-neutral-700 text-4xl font-bold font-['Oxygen']">
                Most Popular Products
              </h2>
              <div className="mt-2 w-24 h-1 bg-blue-600 rounded-full"></div>
              <p className="text-gray-500 mt-2">Top picks from our rental collection</p>
            </div>
            <Link to="/product">
              <div className="px-6 py-3 bg-blue-600 rounded-full inline-flex justify-center items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
                <div className="text-white text-lg font-semibold">
                  View All
                </div>
                <div className="w-5 h-5 text-white">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.isArray(products) && products.length > 0 ? (
              products.slice(0, 8).map((product) => (
                <div
                  key={product._id || Math.random().toString()}
                  className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div 
                    className="cursor-pointer" 
                    onClick={() => handleProductClick(product._id)}
                  >
                    <img
                      src={product.images || "https://via.placeholder.com/150"}
                      alt={product.name}
                      className="w-32 h-32 object-contain mb-4"
                    />
                  </div>
                  <h3 className="text-base font-medium mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-lg font-bold mb-4 text-slate-700">₹{product.price}</p>
                  <Link to={`/productview/${product._id}`} className="w-full">
                    <button className="w-full bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800 transition-colors">
                      Rent Now
                    </button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No products available at the moment.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Homepage;