import { useState, useEffect, createContext, useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Header from "../header";
import Footer from "../Footer";
import { Heart, ArrowLeft } from "lucide-react";
import axios from "axios";
import { useTheme } from '../contexts/ThemeContext';

// Create Wishlist Context
export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistUpdateTrigger, setWishlistUpdateTrigger] = useState(0);

  const fetchWishlist = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    try {
      const response = await axios.get('https://equiply-jrej.onrender.com/wishlist', {
        headers: { 'x-access-token': token }
      });
      console.log('Wishlist API Response:', response.data);
      
      // Handle different response formats
      const items = Array.isArray(response.data) ? response.data : response.data.items || [];
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      // Set empty array on error instead of failing
      setWishlistItems([]);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [wishlistUpdateTrigger]);

  const updateWishlist = () => {
    setWishlistUpdateTrigger(prev => prev + 1);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, updateWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out bg-blue-500 text-white">
      {message}
    </div>
  );
};

const Product = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const searchTerm = params.get("search") || "";
  const categoryParam = params.get("category") || "";
  const pageParam = params.get("page") || "1";
  const limitParam = params.get("limit") || "10";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [pagination, setPagination] = useState({
    currentPage: parseInt(pageParam),
    totalPages: 1,
    totalProducts: 0,
    productsPerPage: parseInt(limitParam)
  });
  const [sortOrder, setSortOrder] = useState("default"); // Add this new state for price sorting
  const { isDarkMode } = useTheme();
  
  // Add default empty arrays to prevent "undefined.map()" errors
  const { wishlistItems = [], updateWishlist } = useContext(WishlistContext) || {};

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    // Set initial category filter from URL parameter
    if (categoryParam) {
      setSelectedCategories(categoryParam.split(','));
    }
  }, [categoryParam]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams();
        if (searchTerm) {
          searchParams.append('search', searchTerm);
        }
        if (selectedCategories.length > 0) {
          searchParams.append('category', selectedCategories.join(','));
        }
        searchParams.append('page', pagination.currentPage.toString());
        searchParams.append('limit', pagination.productsPerPage.toString());
        
        // Add city parameter from localStorage
        const selectedCity = localStorage.getItem('selectedCity') || 'Bengaluru';
        searchParams.append('city', selectedCity);

        const url = `https://equiply-jrej.onrender.com/product/search?${searchParams.toString()}`;
        console.log('Fetching products from:', url);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        console.log('Received products data:', data);

        if (!data.success) {
          throw new Error(data.message || 'Failed to load products');
        }

        // Ensure products is always an array even if the API returns null/undefined
        setProducts(data.products || []);
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination?.totalPages || 1,
          totalProducts: data.pagination?.totalProducts || 0
        }));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || "Failed to load products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedCategories, pagination.currentPage, pagination.productsPerPage]);

  const handleCategoryChange = (category) => {
    const newCategories = selectedCategories.includes(category) 
      ? selectedCategories.filter((c) => c !== category) 
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page when changing categories
    
    const newParams = new URLSearchParams(location.search);
    if (newCategories.length > 0) {
      newParams.set('category', newCategories.join(','));
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1'); // Reset to first page
    
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page when clearing filters
    
    const newParams = new URLSearchParams(location.search);
    newParams.delete('category');
    newParams.set('page', '1'); // Reset to first page
    
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    const newParams = new URLSearchParams(location.search);
    newParams.set('page', newPage.toString());
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  const handleItemsPerPageChange = (newLimit) => {
    setPagination(prev => ({ ...prev, productsPerPage: newLimit, currentPage: 1 }));
    const newParams = new URLSearchParams(location.search);
    newParams.set('limit', newLimit.toString());
    newParams.set('page', '1');
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  // Add this new handler for sorting products by price
  const handleSortChange = (order) => {
    setSortOrder(order);
    
    // Sort products based on the selected order
    const sortedProducts = [...products];
    if (order === "lowToHigh") {
      sortedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (order === "highToLow") {
      sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
    
    setProducts(sortedProducts);
  };

  const handleWishlistClick = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const isInWishlist = wishlistItems.some(item => 
        item._id === productId || 
        item.id === productId || 
        item.product?._id === productId
      );
      
      if (isInWishlist) {
        await axios.delete(`https://equiply-jrej.onrender.com/wishlist/remove/${productId}`, {
          headers: { 'x-access-token': token }
        });
        setToast({
          show: true,
          message: 'Removed from wishlist',
          type: 'success'
        });
      } else {
        await axios.post('https://equiply-jrej.onrender.com/wishlist/add', 
          { productId },
          { headers: { 'x-access-token': token } }
        );
        setToast({
          show: true,
          message: 'Added to wishlist',
          type: 'success'
        });
      }
      updateWishlist();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setToast({
        show: true,
        message: error.response?.data?.message || 'Error updating wishlist',
        type: 'error'
      });
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    }
  };

  return (
    <div className={`bg-gray-50 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Header />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}

      <div className="max-w-[90%] mx-auto px-2 sm:px-4 pb-12 pt-6">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors font-medium`}
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Enhanced Title Section */}
        <div className="mb-10">
          <div className="text-center">
            <h1 className={`text-neutral-700 text-4xl font-bold font-['Oxygen'] mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
              Browse Products
            </h1>
            <div className="mt-2 w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
            <p className={`text-gray-500 mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
              Find the perfect equipment for your needs
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar */}
          <aside className="w-full lg:w-1/5 space-y-6">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 transition-colors duration-300`}>
              {/* Add Sort by Price section */}
              <div className="mb-8">
                <h2 className={`font-semibold text-lg mb-3 border-b pb-2 ${isDarkMode ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'} transition-colors duration-300`}>
                  Sort by Price
                </h2>
                <div className="space-y-3 pt-2">
                  <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                    <input
                      type="radio"
                      name="sort"
                      className="mr-2"
                      checked={sortOrder === "default"}
                      onChange={() => handleSortChange("default")}
                    />
                    Default
                  </label>
                  <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                    <input
                      type="radio"
                      name="sort"
                      className="mr-2"
                      checked={sortOrder === "lowToHigh"}
                      onChange={() => handleSortChange("lowToHigh")}
                    />
                    Price: Low to High
                  </label>
                  <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                    <input
                      type="radio"
                      name="sort"
                      className="mr-2"
                      checked={sortOrder === "highToLow"}
                      onChange={() => handleSortChange("highToLow")}
                    />
                    Price: High to Low
                  </label>
                </div>
              </div>

              {/* Enhanced Category Filter */}
              <h2 className={`font-semibold text-lg mb-3 border-b pb-2 ${isDarkMode ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'} transition-colors duration-300`}>
                Filter by Category
              </h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {["Mobile", "Electronics", "House Appliances", "Accessories", "Tools", "Music", "Transport", "Gaming", "Books", "Costume", "Other"].map((cat) => (
                  <label key={cat} className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryChange(cat)}
                    />
                    {cat}
                  </label>
                ))}
              </div>
              
              {selectedCategories.length > 0 && (
                <button
                  onClick={handleClearFilters}
                  className={`mt-4 text-sm flex items-center gap-1 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors duration-300`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Clear all filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content - Keep product cards the same */}
          <main className="flex-1">
            {/* Enhanced Active Filters Display */}
            {selectedCategories.length > 0 && (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-4 mb-6 transition-colors duration-300`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 font-medium transition-colors duration-300`}>Active filters:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((category) => (
                    <span
                      key={category}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'} transition-colors duration-300`}
                    >
                      {category}
                      <button
                        onClick={() => handleCategoryChange(category)}
                        className="ml-2 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Loading State */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-600'} transition-colors duration-300`}>
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg font-medium">Loading products...</p>
                </div>
              </div>
            ) : error ? (
              <div className={`${isDarkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-600'} border rounded-xl p-8 text-center transition-colors duration-300`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
                <p className="mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className={`px-4 py-2 ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg transition-colors`}
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-12 text-center transition-colors duration-300`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4 transition-colors duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>No products found</h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6 transition-colors duration-300`}>
                  {searchTerm ? 
                    `No products match your search "${searchTerm}" in ${localStorage.getItem('selectedCity') || 'All Cities'}` : 
                    `No products available in ${localStorage.getItem('selectedCity') || 'All Cities'} at the moment.`
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  {searchTerm && (
                    <button 
                      onClick={() => {
                        navigate('/product');
                        window.location.reload();
                      }}
                      className={`px-6 py-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition-colors`}
                    >
                      Browse All Products
                    </button>
                  )}
                  <button 
                    onClick={() => navigate('/')}
                    className={`px-6 py-2 border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors`}
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Products Count Info */}
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-sm p-4 mb-6 transition-colors duration-300`}>
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <p className={`mb-2 sm:mb-0 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                      Showing <span className="font-medium">{products.length}</span> of <span className="font-medium">{pagination.totalProducts}</span> products
                    </p>
                    <div className="flex items-center gap-2">
                      <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Items per page:</label>
                      <select
                        value={pagination.productsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className={`border rounded px-2 py-1 text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} transition-colors duration-300`}
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Products Grid - Keep exactly as is */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* Original product cards - unchanged */}
                  {products.map((product) => {
                    const isInWishlist = wishlistItems.some(item => 
                      item._id === product._id || 
                      item.id === product._id || 
                      item.product?._id === product._id
                    );
                    
                    return (
                      <div
                        key={product._id || product.id}
                        className={`border rounded-lg p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow relative ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                      >
                        <button
                          className={`absolute top-2 right-2 p-1 rounded-full bg-white hover:bg-gray-100 transition-colors ${
                            isInWishlist ? 'text-red-500' : 'text-gray-400'
                          }`}
                          onClick={(e) => handleWishlistClick(e, product._id)}
                          title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
                        </button>
                        <Link
                          to={`/productview/${product._id || product.id}`}
                          className="w-full flex flex-col items-center no-underline"
                        >
                          <img
                            src={Array.isArray(product.images) ? product.images[0] : product.images || "https://via.placeholder.com/150"}
                            alt={product.name}
                            className="w-32 h-32 object-contain mb-4"
                          />
                          <h3 className={`text-base font-medium mb-2 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-800'} no-underline`}>
                            {product.name}
                          </h3>
                          <p className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-slate-700'}`}>
                            ₹{product.price}
                          </p>
                          <button className={`w-full px-4 py-2 text-sm rounded transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
                            Rent Now
                          </button>
                        </Link>
                      </div>
                    );
                  })}
                </div>

                {/* Enhanced Pagination Controls */}
                <div className="mt-8 flex justify-center">
                  <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm inline-flex items-center overflow-hidden transition-colors duration-300`}>
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.currentPage === 1}
                      className={`px-3 py-2 border-r disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      title="First page"
                    >
                      «
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className={`px-3 py-2 border-r disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      ‹
                    </button>
                    
                    <div className={`px-4 py-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                      {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`px-3 py-2 border-l disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      ›
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`px-3 py-2 border-l disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      title="Last page"
                    >
                      »
                    </button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default function ProductWithProvider() {
  return (
    <WishlistProvider>
      <Product />
    </WishlistProvider>
  );
}
