import React, { useState, useEffect } from 'react';
import { FaEdit, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
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
      <>
        <Header />
        <div className="min-h-screen p-8 flex flex-col justify-center items-center">
          <div className="bg-red-100 p-4 rounded-md mb-4">
            <p className="text-red-700">{error}</p>
          </div>
          <button 
            className="px-6 py-2 bg-black text-white rounded"
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
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
          {/* Step Header */}
          <div className="flex items-center justify-between w-full mb-8 relative">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center z-10">
                <FaMapMarkerAlt className="text-xs text-white" />
              </div>
              <div>
                <p className="text-xs text-black">Step 1</p>
                <p className="text-sm font-semibold text-black">Address</p>
              </div>
            </div>
            
            {/* Connecting Line */}
            <div className="h-0.5 bg-gray-300 absolute top-3 left-1/4 right-1/4 z-0"></div>
            
            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center z-10">
                <FaCreditCard className="text-xs text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Step 2</p>
                <p className="text-sm font-semibold text-gray-400">Payment</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Delivery Address</h2>
              <button 
                className="text-blue-600 text-sm"
                onClick={() => setShowAddressModal(true)}
              >
                + Add New Address
              </button>
            </div>

            {addresses.length > 0 ? (
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`flex items-start justify-between p-4 mb-4 rounded-lg border ${
                    selectedAddress === addresses.findIndex(a => a.id === addr.id) ? "border-black" : "border-gray-300"
                  } bg-gray-50`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedAddress === addresses.findIndex(a => a.id === addr.id)}
                      onChange={() => setSelectedAddress(addresses.findIndex(a => a.id === addr.id))}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{addr.label}</p>
                        <span className="text-xs px-2 py-0.5 bg-black text-white rounded">
                          {addr.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mt-1">{addr.address}</p>
                      <p className="text-gray-600 text-sm">{addr.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-gray-500">
                    <FaEdit 
                      className="cursor-pointer" 
                      onClick={() => handleEditAddress(addr.id)}
                    />
                    <MdClose 
                      className="cursor-pointer" 
                      onClick={() => handleRemoveAddress(addr.id)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 border rounded-lg border-dashed">
                <p className="text-gray-500">No addresses available. Please add a delivery address.</p>
                <button 
                  className="mt-2 text-blue-600 underline"
                  onClick={() => setShowAddressModal(true)}
                >
                  Add Address
                </button>
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-3">
              {orderSummary.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-600">{item.days} days rental</p>
                  </div>
                  <p>₹{item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-3">
              <div className="flex justify-between text-sm">
                <p>Subtotal</p>
                <p>₹{orderSummary.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <p>Tax</p>
                <p>₹{orderSummary.tax.toFixed(2)}</p>
              </div>
              <div className="flex justify-between font-semibold text-base mt-3">
                <p>Total</p>
                <p>₹{orderSummary.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button 
              className="px-6 py-2 bg-black text-white rounded"
              onClick={handleProceedToPayment}
              disabled={loading || addresses.length === 0}
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {newAddress.id !== undefined ? "Edit Address" : "Add New Address"}
            </h3>
            
            {addressError && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
                {addressError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="label"
                  value={newAddress.label}
                  onChange={handleAddressChange}
                  placeholder="John Doe"
                  className={`w-full p-2 border rounded-md ${
                    !addressValidation.label.isValid ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={50}
                />
                {!addressValidation.label.isValid && (
                  <p className="text-red-500 text-sm mt-1">{addressValidation.label.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Address Type</label>
                <select
                  name="type"
                  value={newAddress.type}
                  onChange={handleAddressChange}
                  className="w-full p-2 border rounded-md border-gray-300"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Full Address</label>
                <textarea
                  name="address"
                  value={newAddress.address}
                  onChange={handleAddressChange}
                  placeholder="Street, City, State, ZIP Code"
                  className={`w-full p-2 border rounded-md ${
                    !addressValidation.address.isValid ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={3}
                  maxLength={200}
                ></textarea>
                {!addressValidation.address.isValid && (
                  <p className="text-red-500 text-sm mt-1">{addressValidation.address.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={newAddress.phone}
                  onChange={handleAddressChange}
                  placeholder="9876543210"
                  className={`w-full p-2 border rounded-md ${
                    !addressValidation.phone.isValid ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={15}
                />
                {!addressValidation.phone.isValid && (
                  <p className="text-red-500 text-sm mt-1">{addressValidation.phone.message}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Enter 10-digit mobile number</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                className="px-4 py-2 border rounded"
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
                className="px-4 py-2 bg-black text-white rounded"
                onClick={newAddress.editingId ? handleUpdateAddress : handleAddAddress}
                disabled={loading}
              >
                {loading ? "Saving..." : (newAddress.editingId ? "Update" : "Add")} Address
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Checkout;
