import React, { useState, useEffect } from 'react';
import { Star, StarHalf, Heart, ArrowLeft, ChevronRight, ChevronLeft, MapPin, User, Package, Tag } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../header';
import Footer from '../Footer';

// Helper function to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const Review = ({ name, date, comment, rating }) => (
  <div className="border-b py-4">
    <div className="flex items-center justify-between">
      <p className="font-semibold">{name}</p>
      <p className="text-sm text-gray-500">{date}</p>
    </div>
    <div className="flex items-center gap-1 text-yellow-500">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={16} fill={i < rating ? 'currentColor' : 'none'} />
      ))}
    </div>
    <p className="text-sm mt-2 text-gray-700">{comment}</p>
  </div>
);

const ProductVeiw = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
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

    // Fetch all reviews for this product
    const fetchAllReviews = async () => {
      try {
        const response = await fetch(`https://equiply-jrej.onrender.com/review/product/${productId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        if (data && data.success && data.reviews) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    if (productId) {
      fetchProductById();
      fetchAllReviews();
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
      
      // Reset form and refresh reviews
      setNewReview({ rating: 0, comment: '' });
      
      // Refetch reviews to include the new one
      const updatedReviewsResponse = await fetch(`https://equiply-jrej.onrender.com/review/product/${productId}`);
      const updatedReviewsData = await updatedReviewsResponse.json();
      
      if (updatedReviewsData && updatedReviewsData.success) {
        setReviews(updatedReviewsData.reviews);
      }
      
      // Refetch product to update review stats
      const updatedProductResponse = await fetch(`https://equiply-jrej.onrender.com/product/${productId}`);
      const updatedProductData = await updatedProductResponse.json();
      
      if (updatedProductData && updatedProductData.success && updatedProductData.reviewStats) {
        setReviewStats(updatedProductData.reviewStats);
      }
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError(error.message);
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
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <p className="text-lg font-medium text-red-500">Error: {error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <p className="text-lg font-medium">Product not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 flex-grow w-full">
        <button
          onClick={() => navigate('/product')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft size={18} /> Back to Products
        </button>

        {/* Product Overview Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Gallery */}
            <div className="bg-white p-6 border-r border-gray-100">
              {/* Main Image with Navigation */}
              <div className="relative aspect-square">
                <img
                  src={Array.isArray(product.images) ? 
                    product.images[currentImageIndex] : 
                    product.images || "https://via.placeholder.com/500x300?text=No+Image+Available"
                  }
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain rounded-lg"
                />
                
                {Array.isArray(product.images) && product.images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {Array.isArray(product.images) && product.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 justify-center">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 rounded-md overflow-hidden transition-all ${
                        currentImageIndex === idx 
                          ? 'ring-2 ring-black ring-offset-2' 
                          : 'ring-1 ring-gray-200 hover:ring-gray-400'
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        className="w-16 h-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-8">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold mb-3 text-gray-800">{product.name}</h1>
                <button
                  onClick={toggleWishlist}
                  className={`p-2 rounded-full transition-colors ${
                    isInWishlist ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-400'
                  }`}
                  title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={24} fill={isInWishlist ? 'currentColor' : 'none'} />
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="text-yellow-500 flex">
                  {[...Array(Math.floor(reviewStats?.averageRating || 0))].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                  {reviewStats?.averageRating % 1 >= 0.5 && (
                    <StarHalf size={16} fill="currentColor" />
                  )}
                  {[...Array(5 - Math.ceil(reviewStats?.averageRating || 0))].map((_, i) => (
                    <Star key={i} size={16} />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {reviewStats?.averageRating?.toFixed(1) || '0.0'} ({reviewStats?.totalReviews || 0} reviews)
                </span>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Rental Options</h2>
                {isOwnProduct ? (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200">
                    <p className="font-medium">You cannot rent your own product</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {product.renting && (
                      <>
                        {product.renting.hours && (
                          <div 
                            className={`border rounded-lg p-3 text-center cursor-pointer transition-all hover:shadow-md ${
                              selectedRental === 'hours' 
                                ? 'bg-black text-white border-black' 
                                : 'hover:border-gray-500'
                            }`}
                            onClick={() => setSelectedRental('hours')}
                          >
                            <p className="text-lg font-bold">₹{product.renting.hours}</p>
                            <p className={`text-sm ${selectedRental === 'hours' ? 'text-gray-300' : 'text-gray-500'}`}>
                              per hour
                            </p>
                          </div>
                        )}
                        {product.renting.days && (
                          <div 
                            className={`border rounded-lg p-3 text-center cursor-pointer transition-all hover:shadow-md ${
                              selectedRental === 'days' 
                                ? 'bg-black text-white border-black' 
                                : 'hover:border-gray-500'
                            }`}
                            onClick={() => setSelectedRental('days')}
                          >
                            <p className="text-lg font-bold">₹{product.renting.days}</p>
                            <p className={`text-sm ${selectedRental === 'days' ? 'text-gray-300' : 'text-gray-500'}`}>
                              per day
                            </p>
                          </div>
                        )}
                        {product.renting.weeks && (
                          <div 
                            className={`border rounded-lg p-3 text-center cursor-pointer transition-all hover:shadow-md ${
                              selectedRental === 'weeks' 
                                ? 'bg-black text-white border-black' 
                                : 'hover:border-gray-500'
                            }`}
                            onClick={() => setSelectedRental('weeks')}
                          >
                            <p className="text-lg font-bold">₹{product.renting.weeks}</p>
                            <p className={`text-sm ${selectedRental === 'weeks' ? 'text-gray-300' : 'text-gray-500'}`}>
                              per week
                            </p>
                          </div>
                        )}
                        {product.renting.months && (
                          <div 
                            className={`border rounded-lg p-3 text-center cursor-pointer transition-all hover:shadow-md ${
                              selectedRental === 'months' 
                                ? 'bg-black text-white border-black' 
                                : 'hover:border-gray-500'
                            }`}
                            onClick={() => setSelectedRental('months')}
                          >
                            <p className="text-lg font-bold">₹{product.renting.months}</p>
                            <p className={`text-sm ${selectedRental === 'months' ? 'text-gray-300' : 'text-gray-500'}`}>
                              per month
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {!product.renting && (
                      <div className="border rounded-lg p-3 text-center">
                        <p className="text-lg font-bold">₹{product.price}</p>
                        <p className="text-sm text-gray-500">per day</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {!isOwnProduct && (
                  <button 
                    className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex-grow md:flex-grow-0 font-medium"
                    onClick={handleRentNow}
                  >
                    Rent Now
                  </button>
                )}
                <button 
                  onClick={toggleWishlist}
                  className={`flex items-center justify-center gap-2 border px-4 py-2 rounded-lg transition-colors ${
                    isInWishlist 
                      ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
                  {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
              
              <div className="border-t border-b border-gray-100 py-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Product Information</h2>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                    <span>Location: <span className="font-medium text-gray-900">{product.location || 'Not specified'}</span></span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <User size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                    <span>Seller: <span className="font-medium text-gray-900">{product.sellerName || 'Anonymous'}</span></span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <Package size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                    <span>Available for: <span className="font-medium text-gray-900">{product.availability || 'Limited time'}</span></span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <Tag size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                    <span>Category: <span className="font-medium text-gray-900">{product.category || 'Uncategorized'}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-8 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Product Details</h2>
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-700">
              {product.description || 'No description available for this product.'}
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Customer Reviews</h2>
          
          <div className="grid md:grid-cols-12 gap-6 mb-8">
            {/* Review Summary */}
            <div className="md:col-span-4 p-6 bg-gray-50 rounded-xl">
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold text-gray-800 mb-1">
                  {reviewStats ? reviewStats.averageRating.toFixed(1) : '0.0'}
                </div>
                <div className="text-yellow-500 flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => {
                    if (!reviewStats) return <Star key={i} size={20} />;
                    
                    const rating = reviewStats.averageRating;
                    if (i < Math.floor(rating)) {
                      return <Star key={i} size={20} fill="currentColor" />;
                    } else if (i === Math.floor(rating) && rating % 1 >= 0.5) {
                      return <StarHalf key={i} size={20} fill="currentColor" />;
                    } else {
                      return <Star key={i} size={20} />;
                    }
                  })}
                </div>
                <div className="text-sm text-gray-600 mb-6">
                  Based on {reviewStats ? reviewStats.totalReviews : 0} reviews
                </div>
                
                {reviewStats && (
                  <div className="w-full space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviewStats.ratingDistribution[rating] || 0;
                      const percentage = reviewStats.totalReviews 
                        ? Math.round((count / reviewStats.totalReviews) * 100) 
                        : 0;
                      
                      return (
                        <div key={rating} className="flex items-center gap-2">
                          <div className="text-sm text-gray-700 w-8">{rating} ★</div>
                          <div className="flex-grow bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-yellow-400 h-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-700 w-8 text-right">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Write Review Form */}
            <div className="md:col-span-8">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Write a Review</h3>
                {!isLoggedIn ? (
                  <p className="text-gray-600 mb-4">
                    Please <a href="/login" className="text-gray-800 hover:underline font-medium">login</a> to submit a review
                  </p>
                ) : (
                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="text-yellow-500 hover:scale-110 transition-transform"
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                          >
                            <Star 
                              size={28} 
                              fill={star <= newReview.rating ? 'currentColor' : 'none'} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        placeholder="Share your experience with this product"
                      ></textarea>
                    </div>
                    {reviewError && (
                      <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg">
                        {reviewError}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </span>
                      ) : (
                        "Submit Review"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
          
          {/* Customer Reviews List */}
          <div className="mt-8">
            <h3 className="font-semibold text-gray-800 mb-4">Customer Feedback</h3>
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                          {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="font-medium">{review.userName}</span>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-yellow-500 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="italic">No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductVeiw;