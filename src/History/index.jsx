import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../header';
import Footer from '../Footer';
import axios from 'axios';
import { ChevronRight, Package, MapPin, Clock, CreditCard, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [myProducts, setMyProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('https://equiply-jrej.onrender.com/checkout/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-access-token': token
          }
        });
        console.log('Orders response:', response.data); 
        setOrders(response.data.orders || []); 
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error.response?.data || error.message);
        setError(error.response?.data?.message || 'Failed to load orders');
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    const fetchMyProducts = async () => {
      const token = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!token || !userData) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('https://equiply-jrej.onrender.com/product', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-access-token': token
          }
        });
        // Filter products where seller matches current user ID
        const myProducts = response.data.products.filter(
          product => product.seller === userData._id
        );
        setMyProducts(myProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProductsError('Failed to load your products');
      } finally {
        setProductsLoading(false);
      }
    };

    if (activeTab === 'products') {
      fetchMyProducts();
    }
  }, [activeTab, navigate]);

  // Enhanced status color and icon mapping
  const getStatusDetails = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { 
          color: `${isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`,
          icon: <Clock size={16} className="mr-1" />,
          text: 'Pending'
        };
      case 'processing':
        return { 
          color: `${isDarkMode ? 'bg-indigo-900/30 text-indigo-400 border-indigo-800' : 'bg-indigo-100 text-indigo-800 border-indigo-200'}`,
          icon: <Package size={16} className="mr-1" />,
          text: 'Processing'
        };
      case 'paid':
        return { 
          color: `${isDarkMode ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-100 text-green-800 border-green-200'}`,
          icon: <CreditCard size={16} className="mr-1" />,
          text: 'Paid'
        };
      case 'shipped':
        return { 
          color: `${isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-blue-100 text-blue-800 border-blue-200'}`,
          icon: <ShoppingBag size={16} className="mr-1" />,
          text: 'Shipped'
        };
      case 'delivered':
        return { 
          color: `${isDarkMode ? 'bg-purple-900/30 text-purple-400 border-purple-800' : 'bg-purple-100 text-purple-800 border-purple-200'}`,
          icon: <MapPin size={16} className="mr-1" />,
          text: 'Delivered'
        };
      case 'cancelled':
        return { 
          color: `${isDarkMode ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-100 text-red-800 border-red-200'}`,
          icon: <Package size={16} className="mr-1" />,
          text: 'Cancelled'
        };
      default:
        return { 
          color: `${isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200'}`,
          icon: <Package size={16} className="mr-1" />,
          text: status || 'Unknown'
        };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className={`inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid ${isDarkMode ? 'border-blue-600 border-r-transparent' : 'border-black border-r-transparent'} transition-colors duration-300`}></div>
            <p className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} transition-colors duration-300`}>Loading orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p className={`text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'} transition-colors duration-300`}>{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 flex-grow w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/product')}
          className={`mb-6 flex items-center gap-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors font-medium`}
        >
          <ArrowLeft size={18} /> Back to Products
        </button>
        
        {/* Page Title Section */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>My Account</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 transition-colors duration-300`}>Manage your orders and listings</p>
        </div>
        
        {/* Tab Navigation */}
        <div className={`mb-8 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-b transition-colors duration-300`}>
          <div className="flex space-x-8">
            <button
              className={`py-3 px-1 font-medium text-lg transition-colors relative ${
                activeTab === 'orders' 
                  ? `${isDarkMode ? 'text-white' : 'text-black'}` 
                  : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-800'}`
              }`}
              onClick={() => setActiveTab('orders')}
            >
              Order History
              {activeTab === 'orders' && (
                <div className={`absolute bottom-0 left-0 w-full h-0.5 ${isDarkMode ? 'bg-blue-500' : 'bg-black'} transition-colors duration-300`}></div>
              )}
            </button>
            <button
              className={`py-3 px-1 font-medium text-lg transition-colors relative ${
                activeTab === 'products' 
                  ? `${isDarkMode ? 'text-white' : 'text-black'}` 
                  : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-800'}`
              }`}
              onClick={() => setActiveTab('products')}
            >
              My Items
              {activeTab === 'products' && (
                <div className={`absolute bottom-0 left-0 w-full h-0.5 ${isDarkMode ? 'bg-blue-500' : 'bg-black'} transition-colors duration-300`}></div>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'orders' ? (
          <>
            {orders.length === 0 ? (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-12 text-center transition-colors duration-300`}>
                <div className={`w-20 h-20 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} transition-colors duration-300`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg mb-6 transition-colors duration-300`}>You haven't placed any orders yet</p>
                <button 
                  onClick={() => navigate('/product')}
                  className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800'} text-white px-6 py-3 rounded-lg transition-colors font-medium`}
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const statusDetails = getStatusDetails(order.status);
                  
                  return (
                    <div key={order._id} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all`}>
                      {/* Order Header */}
                      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'} p-4 border-b transition-colors duration-300`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Order placed</p>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="flex items-center">
                            <span className={`px-3 py-1 rounded-full text-sm flex items-center border ${statusDetails.color}`}>
                              {statusDetails.icon} {statusDetails.text}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Order Content */}
                      <div className="p-6">
                        {/* Products */}
                        <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'} transition-colors duration-300`}>
                          {order.products?.map((product, idx) => (
                            <div 
                              key={idx}
                              className="py-4 first:pt-0 last:pb-0 flex justify-between items-center"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md flex items-center justify-center transition-colors duration-300`}>
                                  {product.image ? (
                                    <img 
                                      src={Array.isArray(product.image) ? product.image[0] : product.image}
                                      alt={product.name}
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  ) : (
                                    <Package size={24} className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
                                  )}
                                </div>
                                <div>
                                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>{product.name}</p>
                                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
                                    {product.rentalPeriod} {product.rentalDuration} rental
                                  </p>
                                  {product.category && (
                                    <span className={`text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'} px-2 py-1 rounded mt-1 inline-block transition-colors duration-300`}>
                                      {product.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-black'} transition-colors duration-300`}>₹{product.price}</p>
                            </div>
                          ))}
                        </div>
                        
                        {/* Order Summary */}
                        <div className={`mt-6 pt-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} border-t transition-colors duration-300`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1 transition-colors duration-300`}>Delivery Address</p>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} transition-colors duration-300`}>{order.address?.fullAddress}</p>
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} transition-colors duration-300`}>{order.address?.phone}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between">
                                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mr-8 transition-colors duration-300`}>Subtotal:</span>
                                  <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>₹{order.subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mr-8 transition-colors duration-300`}>Tax:</span>
                                  <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>₹{order.tax}</span>
                                </div>
                                <div className={`flex justify-between font-bold text-lg mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                                  <span className="mr-8">Total:</span>
                                  <span>₹{order.total}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 text-right">
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Order ID: {order._id}</p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Payment Method: {order.paymentMethod}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          // My Items Tab - Enhanced UI
          <>
            {productsLoading ? (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-8 text-center transition-colors duration-300`}>
                <div className={`inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid ${isDarkMode ? 'border-blue-600 border-r-transparent' : 'border-black border-r-transparent'} transition-colors duration-300`}></div>
                <p className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} transition-colors duration-300`}>Loading your items...</p>
              </div>
            ) : productsError ? (
              <div className={`${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-xl shadow-sm p-8 text-center transition-colors duration-300`}>
                <p className={`text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'} transition-colors duration-300`}>{productsError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className={`mt-4 px-4 py-2 ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg transition-colors`}
                >
                  Try Again
                </button>
              </div>
            ) : myProducts.length === 0 ? (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-12 text-center transition-colors duration-300`}>
                <div className={`w-20 h-20 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} transition-colors duration-300`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg mb-6 transition-colors duration-300`}>You haven't listed any items for rent</p>
                <button 
                  onClick={() => navigate('/PutRent')}
                  className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800'} text-white px-6 py-3 rounded-lg transition-colors font-medium`}
                >
                  List an Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProducts.map((product) => (
                  <div 
                    key={product._id} 
                    className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all`}
                    onClick={() => navigate(`/productveiw/${product._id}`)}
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={Array.isArray(product.images) ? product.images[0] : product.images || "https://via.placeholder.com/300x200?text=No+Image"}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-medium text-lg line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>{product.name}</h3>
                        {product.category && (
                          <span className={`text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'} px-2 py-1 rounded transition-colors duration-300`}>
                            {product.category}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'} transition-colors duration-300`}>₹{product.price}</p>
                        <div className={`flex items-center cursor-pointer ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-black hover:text-gray-700'} transition-colors duration-300`}>
                          <span className="text-sm font-medium">View Details</span>
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default History;