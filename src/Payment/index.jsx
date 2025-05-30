import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaPaypal, FaMapMarkerAlt, FaLock } from 'react-icons/fa';
import { ArrowLeft } from 'lucide-react';
import Header from "../header";
import Footer from "../Footer";
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

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
  const { isDarkMode } = useTheme();

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
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <Header />
        <div className="min-h-screen p-8 flex justify-center items-center">
          <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>Loading order details...</p>
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
          onClick={handleBack}
          className={`mb-6 flex items-center gap-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors font-medium`}
        >
          <ArrowLeft size={18} /> Back to Checkout
        </button>
        
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>Payment</h1>
          <div className={`mt-2 w-24 h-1 ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'} mx-auto rounded-full transition-colors duration-300`}></div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-3 transition-colors duration-300`}>Secure payment for your rental</p>
        </div>

        {/* Checkout Process Steps */}
        <div className="relative flex justify-center items-center mb-12">
          <div className="relative z-10 flex justify-between w-full max-w-md">
            {/* Step 1 - Completed */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-600' : 'bg-black'} text-white flex items-center justify-center mb-2 transition-colors duration-300`}>
                <FaMapMarkerAlt size={18} />
              </div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-black'} transition-colors duration-300`}>Address</p>
            </div>
            
            {/* Step 2 - Current */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-600' : 'bg-black'} text-white flex items-center justify-center mb-2 transition-colors duration-300`}>
                <FaCreditCard size={18} />
              </div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-black'} transition-colors duration-300`}>Payment</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods Section */}
          <div className="lg:col-span-2">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border rounded-xl shadow-sm overflow-hidden transition-colors duration-300`}>
              <div className={`p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} border-b transition-colors duration-300`}>
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>Select Payment Method</h2>
              </div>
              
              {error && (
                <div className={`mx-6 mt-6 ${isDarkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-600'} border px-4 py-3 rounded-lg text-sm transition-colors duration-300`}>
                  {error}
                </div>
              )}
              
              <div className="p-6 space-y-4">
                {/* Card Payment Option */}
                <div
                  className={`border rounded-lg transition-all ${
                    paymentMethod === 'card' 
                      ? `${isDarkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-600 bg-blue-50'}` 
                      : `${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'}`
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
                      <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} flex items-center justify-center transition-colors duration-300`}>
                        <FaCreditCard size={20} />
                      </div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>Credit / Debit Card</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Secure payment via credit or debit card</p>
                      </div>
                    </div>
                  </label>
                  
                  {paymentMethod === 'card' && (
                    <div className={`${isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-100 bg-gray-50'} border-t p-4 space-y-4 transition-colors duration-300`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-full">
                          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>Card Number</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="cardNumber"
                              value={cardDetails.cardNumber}
                              onChange={handleInputChange}
                              placeholder="1234 5678 9012 3456"
                              className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                isDarkMode 
                                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                  : 'border-gray-300 bg-white text-gray-900'
                              } transition-colors duration-300`}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <FaCreditCard className={`${isDarkMode ? 'text-gray-400' : 'text-gray-400'} transition-colors duration-300`} />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>Expiry Date</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={cardDetails.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              isDarkMode 
                                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                : 'border-gray-300 bg-white text-gray-900'
                            } transition-colors duration-300`}
                          />
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>CVC</label>
                          <input
                            type="text"
                            name="cvc"
                            value={cardDetails.cvc}
                            onChange={handleInputChange}
                            placeholder="123"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              isDarkMode 
                                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                : 'border-gray-300 bg-white text-gray-900'
                            } transition-colors duration-300`}
                          />
                        </div>
                        
                        <div className="col-span-full">
                          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>Name on Card</label>
                          <input
                            type="text"
                            name="cardholderName"
                            value={cardDetails.cardholderName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              isDarkMode 
                                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                : 'border-gray-300 bg-white text-gray-900'
                            } transition-colors duration-300`}
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
                      ? `${isDarkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-600 bg-blue-50'}` 
                      : `${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'}`
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
                      <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} flex items-center justify-center transition-colors duration-300`}>
                        <FaPaypal size={20} />
                      </div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>PayPal</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Fast and secure payment with PayPal</p>
                      </div>
                    </div>
                  </label>
                  
                  {paymentMethod === 'paypal' && (
                    <div className={`${isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-100 bg-gray-50'} border-t p-4 transition-colors duration-300`}>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>PayPal Email</label>
                        <input
                          type="email"
                          value={paypalEmail}
                          onChange={(e) => setPaypalEmail(e.target.value)}
                          placeholder="your-email@example.com"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            isDarkMode 
                              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                              : 'border-gray-300 bg-white text-gray-900'
                          } transition-colors duration-300`}
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
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border rounded-xl shadow-sm overflow-hidden sticky top-8 transition-colors duration-300`}>
              <div className={`p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} border-b transition-colors duration-300`}>
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>Order Summary</h2>
              </div>
              
              <div className="p-6">
                <div className={`${isDarkMode ? 'border-gray-700' : 'border-gray-100'} border-b pb-4 mb-4 transition-colors duration-300`}>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1 transition-colors duration-300`}>Order Total</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>₹{orderDetails?.total?.toFixed(2) || "0.00"}</p>
                </div>
                
                <button 
                  className={`w-full px-6 py-3 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800'} text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2`}
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
                    className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'} text-sm transition-colors duration-300`}
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
