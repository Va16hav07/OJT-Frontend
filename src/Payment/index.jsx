import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaPaypal, FaMapMarkerAlt } from 'react-icons/fa';
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
    <>
      <Header />
      <div className="min-h-screen p-8 bg-white flex flex-col justify-center items-center">
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between w-full mb-8 relative">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center z-10">
                <FaMapMarkerAlt className="text-xs text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Step 1</p>
                <p className="text-sm font-semibold text-gray-400">Address</p>
              </div>
            </div>
            <div className="h-0.5 bg-gray-300 absolute top-3 left-1/4 right-1/4 z-0"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center z-10">
                <FaCreditCard className="text-xs text-white" />
              </div>
              <div>
                <p className="text-xs text-black">Step 2</p>
                <p className="text-sm font-semibold text-black">Payment</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold">Payment Method</h1>
            {error && (
              <div className="bg-red-100 p-3 rounded-md mt-3 text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div
              className={`p-4 border rounded-lg flex items-center gap-4 cursor-pointer ${
                paymentMethod === 'card' ? 'border-black' : 'border-gray-300'
              }`}
              onClick={() => setPaymentMethod('card')}
            >
              <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
              <FaCreditCard className="text-xl" />
              <span className="font-medium">Credit/Debit Card</span>
            </div>

            <div
              className={`p-4 border rounded-lg flex items-center gap-4 cursor-pointer ${
                paymentMethod === 'paypal' ? 'border-black' : 'border-gray-300'
              }`}
              onClick={() => setPaymentMethod('paypal')}
            >
              <input type="radio" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} />
              <FaPaypal className="text-xl" />
              <span className="font-medium">PayPal</span>
            </div>
          </div>

          {paymentMethod === 'card' && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234567890123456"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardDetails.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">CVC</label>
                  <input
                    type="text"
                    name="cvc"
                    value={cardDetails.cvc}
                    onChange={handleInputChange}
                    placeholder="123"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name on Card</label>
                <input
                  type="text"
                  name="cardholderName"
                  value={cardDetails.cardholderName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">PayPal Email</label>
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          )}

          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">Payment Summary</h3>
            <div className="border-t mt-2 pt-3">
              <div className="flex justify-between font-semibold text-base mt-3">
                <p>Total</p>
                <p>₹{orderDetails?.total?.toFixed(2) || "0.00"}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button className="px-6 py-2 border border-black rounded" onClick={handleBack} disabled={loading}>
              Back to Checkout
            </button>
            <button className="px-6 py-2 bg-black text-white rounded" onClick={handleConfirmPayment} disabled={loading}>
              {loading ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Payment;
