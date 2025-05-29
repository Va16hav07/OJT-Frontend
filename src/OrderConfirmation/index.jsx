import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowLeft, Home, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from "../header";
import Footer from "../Footer";

const OrderConfirmation = () => {
  const [confirmation, setConfirmation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if order confirmation exists in localStorage
    const orderConfirmation = localStorage.getItem('orderConfirmation');
    if (!orderConfirmation) {
      navigate('/');
      return;
    }

    try {
      setConfirmation(JSON.parse(orderConfirmation));
    } catch (err) {
      console.error("Error parsing confirmation data:", err);
      navigate('/');
    }
  }, [navigate]);

  const handleContinueShopping = () => {
    // Clear the order confirmation
    localStorage.removeItem('orderConfirmation');
    navigate('/');
  };

  const handleViewOrder = () => {
    // Navigate to order history page (if implemented)
    localStorage.removeItem('orderConfirmation');
    navigate('/history');
  };

  if (!confirmation) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-black border-r-transparent"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">Loading confirmation...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 flex-grow w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/product')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft size={18} /> Back to Products
        </button>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={56} className="text-green-600" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You for Your Order!</h1>
              <p className="text-gray-600 text-lg mb-6">Your payment has been successfully processed</p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-sm text-gray-500">Order Number</p>
                    <p className="font-medium">{confirmation.orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-600"></span>
                      <span className="capitalize">{confirmation.status}</span>
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 my-4 pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-800 font-medium">Total Amount</p>
                    <p className="text-xl font-bold">₹{confirmation.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-blue-800 text-sm text-left">
                <p>
                  <span className="font-medium">Note:</span> A confirmation email has been sent to your registered email address with the complete order details.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button 
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={handleContinueShopping}
                >
                  <Home size={18} />
                  Continue Shopping
                </button>
                <button 
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={handleViewOrder}
                >
                  <Package size={18} />
                  View My Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
