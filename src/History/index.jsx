import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../header';
import Footer from '../Footer';
import axios from 'axios';

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [myProducts, setMyProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const navigate = useNavigate();

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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-lg">Loading orders...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-lg text-red-600">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex mb-8 border-b">
          <button
            className={`py-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-black font-medium' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Order History
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'products' ? 'border-b-2 border-black font-medium' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            My Items
          </button>
        </div>

        {/* Content */}
        {activeTab === 'orders' ? (
          <>
            <h1 className="text-3xl font-bold mb-8">Order History</h1>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">You haven't placed any orders yet</p>
                <button 
                  onClick={() => navigate('/product')}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:opacity-90"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order._id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Order ID</p>
                          <p className="font-medium">{order._id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Order Date</p>
                          <p className="font-medium">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>

                      <div className="border-t border-b py-4 my-4">
                        {order.products?.map((product, idx) => (
                          <div 
                            key={idx}
                            className="flex justify-between items-center mb-2 last:mb-0"
                          >
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">
                                {product.rentalPeriod} {product.rentalDuration} rental
                              </p>
                            </div>
                            <p className="font-medium">₹{product.price}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-xl font-bold">₹{order.total}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                        <p className="text-sm">
                          {order.address?.fullAddress}
                        </p>
                        <p className="text-sm">{order.address?.phone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-8">My Items</h1>
            {productsLoading ? (
              <div className="text-center py-12">
                <p className="text-lg">Loading your items...</p>
              </div>
            ) : productsError ? (
              <div className="text-center py-12">
                <p className="text-lg text-red-600">{productsError}</p>
              </div>
            ) : myProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">You haven't listed any items for rent</p>
                <button 
                  onClick={() => navigate('/PutRent')}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:opacity-90"
                >
                  List an Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProducts.map((product) => (
                  <div key={product._id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <img
                      src={Array.isArray(product.images) ? product.images[0] : product.images}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-medium mb-2">{product.name}</h3>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">₹{product.price}</p>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/productveiw/${product._id}`)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Details
                        </button>
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