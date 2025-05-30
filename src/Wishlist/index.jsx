import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart } from 'lucide-react';
import Header from '../header';
import Footer from '../Footer';
import { WishlistContext } from '../product';
import { useTheme } from '../contexts/ThemeContext';
import './wishlist.css';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    
    useEffect(() => {
        fetchWishlistItems();
    }, []);

    const fetchWishlistItems = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('https://equiply-jrej.onrender.com/wishlist', {
                headers: { 'x-access-token': token }
            });
            console.log('Wishlist response:', response.data);
            
            // Handle different response formats
            const items = Array.isArray(response.data) ? response.data : response.data.items || [];
            setWishlistItems(items);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            if (error.response?.status === 500) {
                // If wishlist endpoint returns 500, show empty wishlist
                console.log('Wishlist endpoint error, showing empty state');
                setWishlistItems([]);
            } else if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                navigate('/login');
            }
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            await axios.delete(`https://equiply-jrej.onrender.com/wishlist/remove/${productId}`, {
                headers: { 'x-access-token': token }
            });
            // Remove item from local state using multiple ID fields
            setWishlistItems(wishlistItems.filter(item => 
                item.id !== productId && 
                item._id !== productId && 
                item.product?._id !== productId
            ));
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            if (error.response?.status === 500) {
                // If endpoint doesn't exist, just remove from local state
                setWishlistItems(wishlistItems.filter(item => 
                    item.id !== productId && 
                    item._id !== productId && 
                    item.product?._id !== productId
                ));
            } else if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                navigate('/login');
            }
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/productview/${productId}`);
    };

    const handleRentNow = (item) => {
        const rentalProduct = {
            id: item._id || item.id,
            name: item.name,
            price: parseFloat(item.price),
            image: item.image_url || (Array.isArray(item.images) ? item.images[0] : item.images),
            rentalDuration: 'days',
            rentalPeriod: 1,
            category: item.category
        };
        
        localStorage.setItem('selectedProducts', JSON.stringify([rentalProduct]));
        navigate('/Checkout');
    };

    if (loading) {
        return (
            <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
                <Header />
                <div className="flex-grow flex justify-center items-center">
                    <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>Loading wishlist...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
            <Header />
            <div className="max-w-6xl mx-auto px-4 py-8 flex-grow w-full">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/product')}
                    className={`mb-6 flex items-center gap-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors font-medium`}
                >
                    <ArrowLeft size={18} /> Back to Products
                </button>
                
                {/* Page Title */}
                <div className="text-center mb-8">
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>My Wishlist</h1>
                    <div className={`mt-2 w-24 h-1 ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'} mx-auto rounded-full transition-colors duration-300`}></div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-3 transition-colors duration-300`}>Items you've saved for later</p>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-12 text-center transition-colors duration-300`}>
                        <div className={`w-20 h-20 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} transition-colors duration-300`}>
                            <Heart size={80} strokeWidth={1.5} />
                        </div>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg mb-6 transition-colors duration-300`}>Your wishlist is empty</p>
                        <button 
                            onClick={() => navigate('/product')}
                            className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800'} text-white px-6 py-3 rounded-lg transition-colors font-medium`}
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlistItems.map((item) => (
                            <div 
                                key={item._id || item.id} 
                                className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300`}
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img 
                                        src={item.image_url || (Array.isArray(item.images) ? item.images[0] : item.images) || "https://via.placeholder.com/300x200?text=No+Image"}
                                        alt={item.name} 
                                        onClick={() => handleProductClick(item._id || item.id)}
                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                    />
                                    {item.category && (
                                        <span className={`absolute top-2 left-2 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'} text-xs px-2 py-1 rounded transition-colors duration-300`}>
                                            {item.category}
                                        </span>
                                    )}
                                    <button 
                                        onClick={() => removeFromWishlist(item._id || item.id)}
                                        className={`absolute top-2 right-2 p-1.5 rounded-full ${isDarkMode ? 'bg-gray-700/80 hover:bg-gray-600' : 'bg-white/80 hover:bg-white'} text-red-500 shadow-sm transition-all duration-300`}
                                        title="Remove from wishlist"
                                    >
                                        <Heart size={18} fill="currentColor" />
                                    </button>
                                </div>
                                
                                <div className="p-5">
                                    <div 
                                        onClick={() => handleProductClick(item._id || item.id)}
                                        className="cursor-pointer"
                                    >
                                        <h3 className={`text-lg font-medium mb-2 line-clamp-2 ${isDarkMode ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} transition-colors duration-300`}>{item.name}</h3>
                                    </div>
                                    
                                    <div className="flex items-end justify-between mt-4">
                                        <div>
                                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1 transition-colors duration-300`}>Price</p>
                                            <p className={`text-xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-black'} transition-colors duration-300`}>₹{item.price}</p>
                                        </div>
                                        
                                        <button 
                                            className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800'} text-white rounded-lg transition-colors text-sm`}
                                            onClick={() => handleRentNow(item)}
                                        >
                                            <ShoppingCart size={16} />
                                            Rent Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {wishlistItems.length > 0 && (
                    <div className="text-center mt-10">
                        <Link 
                            to="/product" 
                            className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} inline-flex items-center gap-2 transition-colors duration-300`}
                        >
                            <span>Continue Shopping</span>
                            <ArrowLeft size={16} className="transform rotate-180" />
                        </Link>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Wishlist;