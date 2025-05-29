import React, { useState, useEffect } from "react";
import Header from "../header";
import Footer from "../Footer";
import { Link } from "react-router-dom";

const Homepage = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div>
      <Header />
      <div className="max-w-[90%] mx-auto px-2 sm:px-4">
        <div className="flex justify-center items-center m-[12px] w-full h-52 bg-slate-800 rounded-2xl">
          <div className="text-center px-8">
            <div className="text-white text-3xl font-normal font-['Inter'] leading-loose">
              Why Buy?
            </div>
            <div className="text-white text-5xl font-normal font-['Inter'] leading-loose">
              When you can rent one.
            </div>
          </div>
        </div>

        <div>
          <div className="m-[31px] text-center justify-center text-neutral-700 text-4xl font-bold font-['Oxygen']">
            Featured Products
          </div>
        </div>

        <div>
          {loading ? (
            <div className="text-center">Loading products...</div>
          ) : error ? (
            <div className="text-center text-red-500">Error: {error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6">
              {Array.isArray(featuredProducts) && featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div
                    key={product._id || Math.random().toString()}
                    className="border rounded-lg p-4 flex flex-col items-center text-center"
                  >
                    <img
                      src={product.images || "https://via.placeholder.com/150"}
                      alt={product.name}
                      className="w-28 h-28 object-contain mb-4"
                    />
                    <h3 className="text-sm font-medium mb-2">{product.name}</h3>
                    <p className="text-lg font-bold mb-2">₹{product.price}</p>
                    <Link to={`/productview/${product._id}`}>
                      <button className="bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800">
                        Rent Now
                      </button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-4">
                  No featured products available at the moment.
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex w-full justify-between items-center">
          <div className="text-center text-neutral-700 text-4xl font-bold font-['Oxygen']">
            Most Popular Products
          </div>
          <Link to="/product">
            <div className="px-6 py-4 bg-zinc-800 rounded-[64px] inline-flex justify-end items-center gap-2.5 overflow-hidden cursor-pointer">
              <div className="text-center text-white text-xl font-semibold font-['Exo']">
                View All
              </div>
              <div className="w-6 h-6 relative overflow-hidden">
                <div className="w-0 h-6 left-[-0.11px] top-0 absolute origin-top-left -rotate-90 overflow-hidden">
                  <div className="w-2 h-4 left-[7.50px] top-[4.12px] absolute bg-white"></div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Homepage;