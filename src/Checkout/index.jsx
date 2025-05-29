import React, { useState, useEffect } from 'react';
import { FaEdit, FaMapMarkerAlt, FaCreditCard, FaTimes, FaHome, FaBuilding } from 'react-icons/fa';
import { ArrowLeft } from 'lucide-react';
import Header from "../header";
import Footer from "../Footer";
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [addresses, setAddresses] = useState([]);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    type: "Home",
    address: "",
    phone: ""
  });
  const [addressError, setAddressError] = useState("");
  const [addressValidation, setAddressValidation] = useState({
    label: { isValid: true, message: "" },
    address: { isValid: true, message: "" },
    phone: { isValid: true, message: "" }
  });
  const [orderSummary, setOrderSummary] = useState({
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login', { state: { redirectTo: '/checkout' } });
      return;
    }
    
    // Get selected products from localStorage
    const storedProducts = localStorage.getItem('selectedProducts');
    if (!storedProducts) {
      navigate('/');
      return;
    }

    try {
      const parsedProducts = JSON.parse(storedProducts);
      setProducts(parsedProducts);
      
      // Calculate order summary
      const subtotal = parsedProducts.reduce((sum, item) => {
        return sum + (item.price * (item.rentalPeriod || 1));
      }, 0);
      
      const tax = subtotal * 0.08; // 8% tax rate
      const total = subtotal + tax;
      
      setOrderSummary({
        items: parsedProducts.map(p => ({
          name: p.name,
          days: p.rentalPeriod || 1,
          price: p.price * (p.rentalPeriod || 1)
        })),
        subtotal,
        tax,
        total
      });

      // Fetch user's addresses from backend
      fetchUserAddresses(token);
    } catch (err) {
      console.error("Error parsing products from localStorage:", err);
      setError("Failed to load product data");
    }
  }, [navigate]);

  // Function to fetch user addresses from backend
  const fetchUserAddresses = async (token) => {
    try {
      setLoading(true);
      const response = await fetch('https://equiply-jrej.onrender.com/user/addresses', {
        headers: {
          'x-access-token': token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.addresses && data.addresses.length > 0) {
          setAddresses(data.addresses);
          
          // Find default address and select it if available
          const defaultAddressIndex = data.addresses.findIndex(addr => addr.isDefault);
          if (defaultAddressIndex >= 0) {
            setSelectedAddress(defaultAddressIndex);
          }
          
          // Only storing in localStorage for emergency offline fallback
          // localStorage.setItem('userAddresses', JSON.stringify(data.addresses));
          
          setLoading(false);
          return;
        }
      }
      
      // Fall back to localStorage if backend fetch fails or returns empty
      const savedAddresses = localStorage.getItem('userAddresses');
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      // Fall back to localStorage
      const savedAddresses = localStorage.getItem('userAddresses');
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      }
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!products.length || !addresses[selectedAddress]) {
      setError("Missing product or address information");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      
      const selectedAddr = addresses[selectedAddress];
      
      console.log('Sending order with products:', products);
      
      // Save the selected address as the user's default address
      try {
        await fetch('https://equiply-jrej.onrender.com/user/default-address', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          },
          body: JSON.stringify({ addressId: selectedAddr.id })
        });
      } catch (addressError) {
        // Not critical, continue with checkout even if setting default address fails
        console.warn("Could not set default address:", addressError);
      }
      
      // Create order in backend
      const response = await fetch('https://equiply-jrej.onrender.com/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({
          products: products.map(p => ({
            productId: p.id,
            name: p.name,
            price: parseFloat(p.price) || 0,
            rentalDuration: p.rentalDuration || 'days',
            rentalPeriod: parseInt(p.rentalPeriod) || 1
          })),
          address: {
            label: selectedAddr.label || '',
            type: selectedAddr.type || '',
            fullAddress: selectedAddr.address || '',
            phone: selectedAddr.phone || ''
          },
          subtotal: orderSummary.subtotal,
          tax: orderSummary.tax,
          total: orderSummary.total,
          paymentMethod: 'pending' // Will be updated in payment page
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to create order");
      }
      
      // Store order ID for payment page
      localStorage.setItem('currentOrder', JSON.stringify({
        orderId: data.order._id,
        total: data.order.total
      }));
      
      navigate('/payment');
    } catch (err) {
      console.error("Error creating order:", err);
      setError(err.message || "Error processing checkout");
    } finally {
      setLoading(false);
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{9,14}$/; // International format
    const indianPhoneRegex = /^[6-9]\d{9}$/; // Indian 10-digit format
    const cleanPhone = phone.replace(/[\s+()-]/g, '');
    
    if (!cleanPhone) {
      return { isValid: false, message: "Phone number is required" };
    }
    if (cleanPhone.length < 10) {
      return { isValid: false, message: "Phone number must be at least 10 digits" };
    }
    if (!/^\d+$/.test(cleanPhone)) {
      return { isValid: false, message: "Phone number can only contain digits" };
    }
    if (cleanPhone.length === 10 && !indianPhoneRegex.test(cleanPhone)) {
      return { isValid: false, message: "Invalid Indian phone number format" };
    }
    if (cleanPhone.length > 15) {
      return { isValid: false, message: "Phone number is too long" };
    }
    return { isValid: true, message: "" };
  };

  const validateAddress = (address) => {
    if (!address.trim()) {
      return { isValid: false, message: "Address is required" };
    }
    if (address.trim().length < 10) {
      return { isValid: false, message: "Please provide a complete address" };
    }
    return { isValid: true, message: "" };
  };

  const validateLabel = (label) => {
    if (!label.trim()) {
      return { isValid: false, message: "Label is required" };
    }
    if (label.trim().length < 2) {
      return { isValid: false, message: "Label must be at least 2 characters" };
    }
    if (!/^[a-zA-Z\s]+$/.test(label.trim())) {
      return { isValid: false, message: "Label can only contain letters and spaces" };
    }
    return { isValid: true, message: "" };
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    
    // Allow only numbers for phone input
    if (name === 'phone') {
      const numbersOnly = value.replace(/\D/g, '');
      setNewAddress({
        ...newAddress,
        [name]: numbersOnly
      });
      
      // Real-time validation for phone
      const validation = validatePhone(numbersOnly);
      setAddressValidation(prev => ({
        ...prev,
        phone: validation
      }));
    } else {
      setNewAddress({
        ...newAddress,
        [name]: value
      });
      
      // Real-time validation for other fields
      if (name === 'label') {
        const validation = validateLabel(value);
        setAddressValidation(prev => ({
          ...prev,
          label: validation
        }));
      } else if (name === 'address') {
        const validation = validateAddress(value);
        setAddressValidation(prev => ({
          ...prev,
          address: validation
        }));
      }
    }
  };

  const handleAddAddress = async () => {
    setAddressError("");
    
    // Validate all fields
    const labelValidation = validateLabel(newAddress.label);
    const addressValidation = validateAddress(newAddress.address);
    const phoneValidation = validatePhone(newAddress.phone);
    
    setAddressValidation({
      label: labelValidation,
      address: addressValidation,
      phone: phoneValidation
    });
    
    // Check if all validations pass
    if (!labelValidation.isValid || !addressValidation.isValid || !phoneValidation.isValid) {
      setAddressError("Please fix the validation errors above");
      return;
    }

    try {
      setLoading(true);
      
      // Save address to backend
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://equiply-jrej.onrender.com/user/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({
          label: newAddress.label.trim(),
          type: newAddress.type || 'Home',
          address: newAddress.address.trim(),
          phone: newAddress.phone.trim()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save address");
      }
      
      // Refresh address list after adding
      await fetchUserAddresses(token);
      
      // Close the modal and reset form
      setShowAddressModal(false);
      setNewAddress({
        label: "",
        type: "Home",
        address: "",
        phone: ""
      });
      setAddressValidation({
        label: { isValid: true, message: "" },
        address: { isValid: true, message: "" },
        phone: { isValid: true, message: "" }
      });
    } catch (error) {
      console.error("Error saving address:", error);
      setAddressError("Failed to save address: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAddress = async (id) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://equiply-jrej.onrender.com/user/address/${id}`, {
        method: 'DELETE',
        headers: {
          'x-access-token': token
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete address");
      }
      
      // Refresh addresses after deletion
      await fetchUserAddresses(token);
      
      // Remove the line that saves to localStorage
    } catch (error) {
      console.error("Error removing address:", error);
      setError("Failed to remove address: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = async (id) => {
    const addressToEdit = addresses.find(addr => addr.id === id);
    if (addressToEdit) {
      setNewAddress({...addressToEdit});
      setShowAddressModal(true);
      
      // When editing, we'll keep track of the old ID to update it properly
      setNewAddress(prev => ({ ...prev, editingId: id }));
    }
  };

  const handleUpdateAddress = async () => {
    if (!newAddress.editingId) {
      return handleAddAddress();
    }
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://equiply-jrej.onrender.com/user/address/${newAddress.editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({
          label: newAddress.label,
          type: newAddress.type,
          address: newAddress.address,
          phone: newAddress.phone
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update address");
      }
      
      // Refresh addresses
      await fetchUserAddresses(token);
      
      // Close modal and reset form
      setShowAddressModal(false);
      setNewAddress({
        label: "",
        type: "Home",
        address: "",
        phone: ""
      });
    } catch (error) {
      console.error("Error updating address:", error);
      setAddressError("Failed to update address: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8 flex-grow w-full flex flex-col justify-center items-center">
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-8 max-w-lg w-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="mb-6">{error}</p>
            <button 
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              onClick={() => navigate('/')}
            >
              Return to Home
            </button>
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
        
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
          <div className="mt-2 w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          <p className="text-gray-500 mt-3">Complete your rental order</p>
        </div>

        {/* Checkout Process Steps - Without horizontal line */}
        <div className="relative flex justify-center items-center mb-12">
          <div className="relative z-10 flex justify-between w-full max-w-md">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-2">
                <FaMapMarkerAlt size={18} />
              </div>
              <p className="text-sm font-medium text-black">Address</p>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center mb-2">
                <FaCreditCard size={18} />
              </div>
              <p className="text-sm font-medium text-gray-500">Payment</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Addresses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Delivery Address</h2>
                  <button 
                    className="px-4 py-2 flex items-center gap-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={() => setShowAddressModal(true)}
                  >
                    <span>Add New Address</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((addr, index) => (
                      <div
                        key={addr.id || index}
                        className={`border rounded-lg transition-all ${
                          selectedAddress === index 
                            ? "border-blue-600 bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <label className="flex cursor-pointer p-4">
                          <div className="flex items-start gap-4 flex-1">
                            <input
                              type="radio"
                              name="deliveryAddress"
                              checked={selectedAddress === index}
                              onChange={() => setSelectedAddress(index)}
                              className="mt-1.5"
                            />
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{addr.label}</span>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                  addr.type === 'Home' 
                                    ? 'bg-green-100 text-green-800' 
                                    : addr.type === 'Office'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {addr.type}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-1">{addr.address}</p>
                              <p className="text-gray-500 text-sm">
                                <span className="font-medium">Phone:</span> {addr.phone}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditAddress(addr.id);
                              }}
                              className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                              title="Edit address"
                            >
                              <FaEdit size={18} />
                            </button>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveAddress(addr.id);
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                              title="Remove address"
                            >
                              <FaTimes size={18} />
                            </button>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                      <FaMapMarkerAlt size={64} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No addresses found</h3>
                    <p className="text-gray-500 mb-6">Please add a delivery address to continue</p>
                    <button 
                      className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      onClick={() => setShowAddressModal(true)}
                    >
                      Add New Address
                    </button>
                  </div>
                )}
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
                <div className="space-y-4 mb-6">
                  {orderSummary.items.map((item, index) => (
                    <div key={index} className="flex justify-between pb-4 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.days} {item.days > 1 ? 'days' : 'day'} rental</p>
                      </div>
                      <p className="font-medium">₹{item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2 pb-4">
                  <div className="flex justify-between text-gray-600">
                    <p>Subtotal</p>
                    <p>₹{orderSummary.subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <p>Tax (8%)</p>
                    <p>₹{orderSummary.tax.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <p>Total</p>
                    <p>₹{orderSummary.total.toFixed(2)}</p>
                  </div>
                </div>
                
                <button 
                  className="w-full mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  onClick={handleProceedToPayment}
                  disabled={loading || addresses.length === 0}
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Payment</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  {newAddress.editingId ? "Edit Address" : "Add New Address"}
                </h3>
                <button 
                  onClick={() => {
                    setShowAddressModal(false);
                    setAddressError("");
                    setNewAddress({
                      label: "",
                      type: "Home",
                      address: "",
                      phone: ""
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {addressError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                  {addressError}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Name/Label</label>
                  <input
                    type="text"
                    name="label"
                    value={newAddress.label}
                    onChange={handleAddressChange}
                    placeholder="John Doe / Home / Office"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      !addressValidation.label.isValid ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {!addressValidation.label.isValid && (
                    <p className="text-red-500 text-xs mt-1">{addressValidation.label.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Address Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer ${newAddress.type === 'Home' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="type"
                        value="Home"
                        checked={newAddress.type === 'Home'}
                        onChange={handleAddressChange}
                        className="sr-only"
                      />
                      <FaHome size={18} />
                      <span>Home</span>
                    </label>
                    <label className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer ${newAddress.type === 'Office' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="type"
                        value="Office"
                        checked={newAddress.type === 'Office'}
                        onChange={handleAddressChange}
                        className="sr-only"
                      />
                      <FaBuilding size={18} />
                      <span>Office</span>
                    </label>
                    <label className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer ${newAddress.type === 'Other' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="type"
                        value="Other"
                        checked={newAddress.type === 'Other'}
                        onChange={handleAddressChange}
                        className="sr-only"
                      />
                      <FaMapMarkerAlt size={18} />
                      <span>Other</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Full Address</label>
                  <textarea
                    name="address"
                    value={newAddress.address}
                    onChange={handleAddressChange}
                    placeholder="Street, City, State, ZIP Code"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      !addressValidation.address.isValid ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={3}
                  ></textarea>
                  {!addressValidation.address.isValid && (
                    <p className="text-red-500 text-xs mt-1">{addressValidation.address.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Contact Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">+91</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={newAddress.phone}
                      onChange={handleAddressChange}
                      placeholder="9876543210"
                      className={`w-full p-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !addressValidation.phone.isValid ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {!addressValidation.phone.isValid && (
                    <p className="text-red-500 text-xs mt-1">{addressValidation.phone.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setShowAddressModal(false);
                    setAddressError("");
                    setNewAddress({
                      label: "",
                      type: "Home",
                      address: "",
                      phone: ""
                    });
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                  onClick={newAddress.editingId ? handleUpdateAddress : handleAddAddress}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </span>
                  ) : (
                    newAddress.editingId ? "Update Address" : "Save Address"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Checkout;
