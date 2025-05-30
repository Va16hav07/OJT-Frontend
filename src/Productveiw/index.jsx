import React, { useState, useEffect } from 'react';
import { Star, StarHalf, Heart, ArrowLeft, ChevronRight, ChevronLeft, MapPin, User, Package, Tag } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../header';
import Footer from '../Footer';
import { useTheme } from '../contexts/ThemeContext';

// Helper function to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const Review = ({ review, isDarkMode, isOwnReview, onEdit, onDelete }) => (
  <div className={`border-b py-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}>
    <div className="flex items-center justify-between">
      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>{review.userName}</p>
      <div className="flex items-center gap-2">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>{formatDate(review.date)}</p>
        {isOwnReview && (
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(review)} 
              className={`text-sm px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' : 'bg-gray-100 hover:bg-gray-200 text-blue-600'}`}
            >
              Edit
            </button>
            <button 
              onClick={() => onDelete(review._id)} 
              className={`text-sm px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-red-400' : 'bg-gray-100 hover:bg-gray-200 text-red-600'}`}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
    <div className="flex items-center gap-1 text-yellow-500">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} />
      ))}
    </div>
    <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>{review.comment}</p>
  </div>
);

const ProductVeiw = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedRental, setSelectedRental] = useState('days');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isOwnProduct, setIsOwnProduct] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editReviewId, setEditReviewId] = useState(null);

  // Define fetchReviews outside useEffect so it can be called from anywhere in the component
  const fetchReviews = async () => {
    try {
      const response = await fetch(`https://equiply-jrej.onrender.com/review/product/${productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      if (data && data.success && data.reviews) {
        console.log('Reviews data:', data.reviews);
        setReviews(data.reviews);
      }

      // Get review stats
      const statsResponse = await fetch(`https://equiply-jrej.onrender.com/review/stats/${productId}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData && statsData.success) {
          setReviewStats(statsData.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    console.log('Auth token from localStorage:', token);
    if (!token) {
      console.log('No auth token found');
      setIsLoggedIn(false);
      return;
    }
    setIsLoggedIn(true);
    
    // Get the user ID from stored user data
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, []);

  useEffect(() => {
    const fetchProductById = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://equiply-jrej.onrender.com/product/${productId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        
        const data = await response.json();
        console.log('Product Details:', data);
        
        // Extract the product and reviews from the response
        if (data && data.success && data.product) {
          setProduct(data.product);
          
          // Check if current user is the owner of this product
          const userData = JSON.parse(localStorage.getItem('userData'));
          if (userData && userData._id && data.product.seller === userData._id) {
            setIsOwnProduct(true);
          } else {
            setIsOwnProduct(false);
          }
          
          // Set review statistics if available
          if (data.reviewStats) {
            setReviewStats(data.reviewStats);
          }
          
          // Set recent reviews if available
          if (data.recentReviews) {
            setReviews(data.recentReviews);
          }
        } else {
          throw new Error('Invalid product data format from API');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductById();
      fetchReviews(); // Call the function here
    }
  }, [productId]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (!token || !product?._id) {
        console.log('No token or product ID, skipping wishlist check');
        return;
      }
      
      try {
        console.log('Checking wishlist with token:', token);
        const response = await axios.get('https://equiply-jrej.onrender.com/wishlist', {
          headers: { 
            'x-access-token': token
          }
        });
        
        console.log('Wishlist response:', response.data);
        const isInWishlist = response.data.some(item => item.product._id === product._id);
        console.log('Is in wishlist:', isInWishlist);
        setIsInWishlist(isInWishlist);
        setWishlistCount(response.data.length);
      } catch (error) {
        console.error('Error checking wishlist status:', error.response?.data || error.message);
        // Don't automatically logout on wishlist check failures
        // Only logout if explicitly told by server or on critical auth failures
        if (error.response?.status === 401 && error.response?.data?.clearAuth === true) {
          console.log('Server requested auth clearing');
          localStorage.removeItem('authToken');
          setIsLoggedIn(false);
          navigate('/login');
        }
      }
    };

    if (product?._id) {
      checkWishlistStatus();
    }
  }, [product?._id, navigate]);

  const handleEditReview = (review) => {
    setEditReviewId(review._id);
    setIsEditingReview(true);
    setNewReview({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://equiply-jrej.onrender.com/review/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'x-access-token': token
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete review');
      }
      
      // Refetch reviews after deletion
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review: ' + error.message);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      // Redirect to login page if not logged in
      navigate('/login');
      return;
    }
    
    if (newReview.rating === 0) {
      setReviewError('Please select a rating');
      return;
    }
    
    if (!newReview.comment.trim()) {
      setReviewError('Please enter a comment');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setReviewError(null);
      
      const token = localStorage.getItem('authToken');
      
      // If editing an existing review
      if (isEditingReview && editReviewId) {
        const response = await fetch(`https://equiply-jrej.onrender.com/review/${editReviewId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          },
          body: JSON.stringify({
            rating: newReview.rating,
            comment: newReview.comment
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to update review');
        }
        
        // Reset edit mode
        setIsEditingReview(false);
        setEditReviewId(null);
      } 
      else {
        // Creating a new review
        const response = await fetch('https://equiply-jrej.onrender.com/review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          },
          body: JSON.stringify({
            productId: productId,
            rating: newReview.rating,
            comment: newReview.comment
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to submit review');
        }
      }
      
      // Reset form
      setNewReview({ rating: 0, comment: '' });
      
      // Refetch reviews to include the new/updated one - add a small delay to ensure server has processed the change
      setTimeout(() => {
        fetchReviews();
      }, 500);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleRentNow = () => {
    if (!product || !product._id) {
      console.error("Product data is missing ID");
      return;
    }
    
    const rentalProduct = {
      id: product._id,
      name: product.name,
      price: parseFloat(product.renting?.[selectedRental] || product.price),
      image: product.images,
      rentalDuration: selectedRental,
      rentalPeriod: 1,
      category: product.category
    };
    
    console.log("Storing product for checkout:", rentalProduct);
    
    // Validate ID before storing
    if (!rentalProduct.id) {
      console.error("Invalid product ID");
      return;
    }
    
    // Store in localStorage to access in checkout
    localStorage.setItem('selectedProducts', JSON.stringify([rentalProduct]));
    navigate('/Checkout');
  };

  // Add helper functions for image navigation
  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === (product?.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? (product?.images?.length || 1) - 1 : prev - 1
    );
  };

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (isInWishlist) {
        await axios.delete(`https://equiply-jrej.onrender.com/wishlist/remove/${product._id}`, {
          headers: { 'x-access-token': token }
        });
        setIsInWishlist(false);
        setWishlistCount(prev => prev - 1);
      } else {
        await axios.post('https://equiply-jrej.onrender.com/wishlist/add', 
          { productId: product._id },
          { headers: { 'x-access-token': token } }
        );
        setIsInWishlist(true);
        setWishlistCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    const checkIfOwnProduct = () => {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (userData && product) {
        setIsOwnProduct(userData._id === product.seller);
      }
    };

    checkIfOwnProduct();
  }, [product]);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-600'} transition-colors duration-300`}>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className={`${isDarkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-600'} border rounded-xl p-8 text-center transition-colors duration-300`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium mb-2">Error Loading Product</h3>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => navigate('/product')}
              className={`px-4 py-2 ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg transition-colors`}
            >
              Back to Products
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <Header />
        <div className="flex justify-center items-center h-96">
          <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-600'} transition-colors duration-300`}>Product not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [product.images];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/product')}
          className={`mb-6 flex items-center gap-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors font-medium`}
        >
          <ArrowLeft size={18} /> Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden transition-colors duration-300`}>
            <div className="relative h-96 overflow-hidden">
              <img
                src={images[currentImageIndex] || "https://via.placeholder.com/600x400"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${isDarkMode ? 'bg-gray-900/80 text-white hover:bg-gray-800' : 'bg-white/80 text-gray-800 hover:bg-white'} shadow-sm transition-all`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${isDarkMode ? 'bg-gray-900/80 text-white hover:bg-gray-800' : 'bg-white/80 text-gray-800 hover:bg-white'} shadow-sm transition-all`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              
              {/* Wishlist Button */}
              <button
                onClick={toggleWishlist}
                className={`absolute top-4 right-4 p-3 rounded-full ${isDarkMode ? 'bg-gray-900/80 hover:bg-gray-800' : 'bg-white/80 hover:bg-white'} shadow-sm transition-all`}
                disabled={!isLoggedIn}
              >
                <Heart 
                  size={20} 
                  fill={isInWishlist ? 'red' : 'none'} 
                  className={isInWishlist ? 'text-red-500' : `${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                />
              </button>
            </div>
            
            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? `${isDarkMode ? 'border-blue-500' : 'border-blue-600'}` 
                        : `${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 transition-colors duration-300`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>{product.name}</h1>
                  {product.category && (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'} transition-colors duration-300`}>
                      <Tag size={14} className="inline mr-1" />
                      {product.category}
                    </span>
                  )}
                </div>
                
                {/* Rating Display */}
                {reviewStats && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-500 justify-end">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < Math.round(reviewStats.averageRating) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
                      {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews} reviews)
                    </p>
                  </div>
                )}
              </div>
              
              {/* Price and Rental Options */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
                      Price per {selectedRental.replace(/s$/, '')}
                    </p>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-gray-900'} transition-colors duration-300`}>
                      ₹{product.renting?.[selectedRental] || product.price}
                    </p>
                  </div>
                </div>
                
                {/* Rental Duration Options */}
                {product.renting && (
                  <div className="space-y-3">
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} transition-colors duration-300`}>Rental Duration:</p>
                    <div className="flex gap-3">
                      {Object.entries(product.renting).map(([duration, price]) => (
                        <button
                          key={duration}
                          onClick={() => setSelectedRental(duration)}
                          className={`px-4 py-2 rounded-lg border transition-all ${
                            selectedRental === duration
                              ? `${isDarkMode ? 'bg-blue-600 border-blue-600 text-white' : 'bg-blue-600 border-blue-600 text-white'}`
                              : `${isDarkMode ? 'border-gray-600 text-gray-300 hover:border-blue-500' : 'border-gray-300 text-gray-700 hover:border-blue-600'}`
                          }`}
                        >
                          <div className="text-center">
                            <p className="text-sm capitalize">{duration}</p>
                            <p className="font-semibold">₹{price}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                {isOwnProduct ? (
                  <div className={`flex-1 px-6 py-3 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} text-center rounded-lg`}>
                    <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                      You can't rent your own product
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleRentNow}
                    className={`flex-1 px-6 py-3 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white rounded-lg font-medium transition-colors`}
                  >
                    Rent Now
                  </button>
                )}
                <button
                  onClick={toggleWishlist}
                  disabled={!isLoggedIn || isOwnProduct}
                  className={`px-6 py-3 border rounded-lg transition-all ${
                    isInWishlist 
                      ? `${isDarkMode ? 'bg-red-600 border-red-600 text-white hover:bg-red-700' : 'bg-red-600 border-red-600 text-white hover:bg-red-700'}`
                      : `${isDarkMode ? 'border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-400' : 'border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600'}`
                  } ${(isOwnProduct || !isLoggedIn) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 transition-colors duration-300`}>
              <h3 className={`font-semibold text-lg mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>Product Details</h3>
              
              <div className="space-y-3">
                {product.description && (
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>Description:</p>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>{product.description}</p>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <MapPin size={16} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`} />
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                    Location: {product.location || 'Not specified'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Package size={16} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`} />
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                    Condition: {product.condition || 'Good'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={`mt-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 transition-colors duration-300`}>
          <h3 className={`font-semibold text-xl mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>Reviews</h3>
          
          {/* Add/Edit Review Form */}
          {isLoggedIn && !isOwnProduct && (
            <div className={`mb-8 p-4 border rounded-lg ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'} transition-colors duration-300`}>
              <h4 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                {isEditingReview ? 'Edit Review' : 'Write a Review'}
              </h4>
              
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>Rating:</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className={`text-2xl transition-colors ${
                          star <= newReview.rating ? 'text-yellow-500' : `${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    placeholder="Share your experience with this product..."
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } transition-colors duration-300`}
                    rows={4}
                  />
                </div>
                
                {reviewError && (
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'} transition-colors duration-300`}>{reviewError}</p>
                )}
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition-colors disabled:opacity-50`}
                  >
                    {isSubmitting ? 'Submitting...' : isEditingReview ? 'Update Review' : 'Submit Review'}
                  </button>
                  
                  {isEditingReview && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingReview(false);
                        setEditReviewId(null);
                        setNewReview({ rating: 0, comment: '' });
                        setReviewError(null);
                      }}
                      className={`px-6 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} text-white rounded-lg transition-colors`}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
          
          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Review
                  key={review._id}
                  review={review}
                  isDarkMode={isDarkMode}
                  isOwnReview={userId && review.userId === userId}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                />
              ))}
            </div>
          ) : (
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-8 transition-colors duration-300`}>
              No reviews yet. Be the first to review this product!
            </p>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductVeiw;