import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaPaypal, FaMapMarkerAlt, FaLock } from 'react-icons/fa';
import { ArrowLeft } from 'lucide-react';
import Header from "../header";
import Footer from "../Footer";
import { useNavigate } from 'react-router-dom';

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: ''
  });
  const [paypalEmail, setPaypalEmail] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login', { state: { redirectTo: '/payment' } });
      return;
    }

    const currentOrder = localStorage.getItem('currentOrder');
    if (!currentOrder) {
      navigate('/checkout');
      return;
    }

    try {
      setOrderDetails(JSON.parse(currentOrder));
    } catch (err) {
      console.error("Error parsing order from localStorage:", err);
      setError("Failed to load order data");
      navigate('/checkout');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    switch (name) {
      case 'cardNumber':
        filteredValue = value.replace(/\D/g, '').slice(0, 16);
        break;
      case 'expiryDate':
        filteredValue = value.replace(/[^0-9/]/g, '').slice(0, 5);
        if (filteredValue.length === 2 && !filteredValue.includes('/')) {
          filteredValue = filteredValue + '/';
        }
        break;
      case 'cvc':
        filteredValue = value.replace(/\D/g, '').slice(0, 4);
        break;
      case 'cardholderName':
        filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
        break;
      default:
        break;
    }

    setCardDetails(prev => ({
      ...prev,
      [name]: filteredValue
    }));
  };

  const handleBack = () => {
    navigate('/checkout');
  };

  const handleConfirmPayment = async () => {
    if (!orderDetails?.orderId) {
      setError("Missing order information");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      let paymentDetails;

      if (paymentMethod === 'card') {
        const { cardNumber, expiryDate, cvc, cardholderName } = cardDetails;
        if (!cardNumber || !expiryDate || !cvc || !cardholderName) {
          throw new Error("Please fill all card details");
        }

        paymentDetails = {
          cardholderName,
          last4: cardNumber.slice(-4),
          expiryDate
        };
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(paypalEmail)) {
          throw new Error("Please enter a valid PayPal email address");
        }

        paymentDetails = {
          paypalEmail
        };
      }

      const response = await fetch('https://equiply-jrej.onrender.com/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({
          orderId: orderDetails.orderId,
          paymentMethod,
          paymentDetails
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment processing failed");
      }

      localStorage.removeItem('selectedProducts');
      localStorage.removeItem('currentOrder');

      localStorage.setItem('orderConfirmation', JSON.stringify({
        orderId: data.order._id,
        status: data.order.status,
        total: data.order.total,
        paymentId: data.payment._id
      }));

      navigate('/order-confirmation');
    } catch (err) {
      console.error("Payment processing error:", err);
      setError(err.message || "Error processing payment");
    } finally {
      setLoading(false);
    }
  };

  if (!orderDetails) {
    return (
      <>
        <Header />
        <div className="min-h-screen p-8 flex justify-center items-center">
          <p>Loading order details...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 flex-grow w-full">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft size={18} /> Back to Checkout
        </button>
        
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800">Payment</h1>
          <div className="mt-2 w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          <p className="text-gray-500 mt-3">Secure payment for your rental</p>
        </div>

        {/* Checkout Process Steps - Without horizontal line */}
        <div className="relative flex justify-center items-center mb-12">
          <div className="relative z-10 flex justify-between w-full max-w-md">
            {/* Step 1 - Completed */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-2">
                <FaMapMarkerAlt size={18} />
              </div>
              <p className="text-sm font-medium text-black">Address</p>
            </div>
            
            {/* Step 2 - Current */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-2">
                <FaCreditCard size={18} />
              </div>
              <p className="text-sm font-medium text-black">Payment</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Select Payment Method</h2>
              </div>
              
              {error && (
                <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="p-6 space-y-4">
                {/* Card Payment Option */}
                <div
                  className={`border rounded-lg transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <label className="flex cursor-pointer p-4">
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        checked={paymentMethod === 'card'} 
                        onChange={() => setPaymentMethod('card')}
                        className="mt-0.5"
                      />
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <FaCreditCard size={20} />
                      </div>
                      <div>
                        <p className="font-medium">Credit / Debit Card</p>
                        <p className="text-sm text-gray-500">Secure payment via credit or debit card</p>
                      </div>
                    </div>
                  </label>
                  
                  {paymentMethod === 'card' && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-full">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="cardNumber"
                              value={cardDetails.cardNumber}
                              onChange={handleInputChange}
                              placeholder="1234 5678 9012 3456"
                              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <FaCreditCard className="text-gray-400" />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={cardDetails.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                          <input
                            type="text"
                            name="cvc"
                            value={cardDetails.cvc}
                            onChange={handleInputChange}
                            placeholder="123"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div className="col-span-full">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                          <input
                            type="text"
                            name="cardholderName"
                            value={cardDetails.cardholderName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* PayPal Option */}
                <div
                  className={`border rounded-lg transition-all ${
                    paymentMethod === 'paypal' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <label className="flex cursor-pointer p-4">
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        checked={paymentMethod === 'paypal'} 
                        onChange={() => setPaymentMethod('paypal')}
                        className="mt-0.5"
                      />
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <FaPaypal size={20} />
                      </div>
                      <div>
                        <p className="font-medium">PayPal</p>
                        <p className="text-sm text-gray-500">Fast and secure payment with PayPal</p>
                      </div>
                    </div>
                  </label>
                  
                  {paymentMethod === 'paypal' && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Email</label>
                        <input
                          type="email"
                          value={paypalEmail}
                          onChange={(e) => setPaypalEmail(e.target.value)}
                          placeholder="your-email@example.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
              </div>
              
              <div className="p-6">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <p className="text-gray-500 mb-1">Order Total</p>
                  <p className="text-2xl font-bold">₹{orderDetails?.total?.toFixed(2) || "0.00"}</p>
                </div>
                
                <button 
                  className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  onClick={handleConfirmPayment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FaLock size={16} />
                      <span>Complete Payment</span>
                    </>
                  )}
                </button>
                
                <div className="mt-4 text-center">
                  <button 
                    onClick={handleBack}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Return to checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Payment;
