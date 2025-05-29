import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
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
    navigate('/account/orders');
  };

  if (!confirmation) {
    return (
      <>
        <Header />
        <div className="min-h-screen p-8 flex justify-center items-center">
          <p>Loading confirmation details...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen p-8 bg-white flex flex-col justify-center items-center">
        <div className="w-full max-w-2xl text-center">
          <CheckCircle size={80} className="mx-auto text-green-500 mb-6" />
          
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-xl mb-8">Your order has been placed.</p>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="mb-4">
              <p className="text-gray-600">Order ID</p>
              <p className="font-semibold">{confirmation.orderId}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600">Status</p>
              <p className="font-semibold capitalize">{confirmation.status}</p>
            </div>
            
            <div>
              <p className="text-gray-600">Total Amount</p>
              <p className="font-semibold">${confirmation.total.toFixed(2)}</p>
            </div>
          </div>
          
          <p className="mb-6 text-gray-700">
            A confirmation email has been sent with your order details.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button 
              className="px-6 py-3 bg-black text-white rounded-lg"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </button>
            <button 
              className="px-6 py-3 border border-black rounded-lg"
              onClick={handleViewOrder}
            >
              View Order
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmation;
