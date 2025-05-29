import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../header';
import Footer from '../Footer';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { ArrowLeft } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    label: '',
    type: 'Home',
    address: '',
    phone: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  const validatePhone = (phone) => {
    if (!phone) return { isValid: false, message: "Phone number is required" };
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return { isValid: false, message: "Phone number must be exactly 10 digits" };
    }
    if (!phoneRegex.test(cleanPhone)) {
      return { isValid: false, message: "Invalid phone number format" };
    }
    return { isValid: true, message: "" };
  };

  const validateName = (name) => {
    if (!name.trim()) {
      return { isValid: false, message: "Name is required" };
    }
    if (name.trim().length < 2) {
      return { isValid: false, message: "Name must be at least 2 characters" };
    }
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return { isValid: false, message: "Name can only contain letters and spaces" };
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
    return { isValid: true, message: "" };
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        const response = await axios.get('https://equiply-jrej.onrender.com/api/profile', {
          headers: { 'x-access-token': token }
        });
        
        console.log('Raw API Response:', response.data);
        
        const { user } = response.data;
        
        // Ensure we have valid data
        if (!user) {
          throw new Error('No user data received');
        }

        // Set user data
        setUserData(user);
        setEditedData(user);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Allow only numbers for phone
      const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
      setEditedData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
      
      // Real-time validation
      const validation = validatePhone(numbersOnly);
      setValidationErrors(prev => ({
        ...prev,
        [name]: validation.isValid ? '' : validation.message
      }));
    } else if (name === 'name') {
      setEditedData(prev => ({
        ...prev,
        [name]: value
      }));
      
      const validation = validateName(value);
      setValidationErrors(prev => ({
        ...prev,
        [name]: validation.isValid ? '' : validation.message
      }));
    } else {
      setEditedData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    // Validate before saving
    const nameValidation = validateName(editedData.name || '');
    const phoneValidation = validatePhone(editedData.phone || '');
    
    const errors = {};
    if (!nameValidation.isValid) errors.name = nameValidation.message;
    if (!phoneValidation.isValid) errors.phone = phoneValidation.message;
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put('https://equiply-jrej.onrender.com/api/profile', editedData, {
        headers: { 'x-access-token': token }
      });
      
      setUserData(response.data.user);
      setIsEditing(false);
      setValidationErrors({});
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const handleAddAddress = async () => {
    // Validate address fields
    const labelValidation = validateLabel(newAddress.label);
    const addressValidation = validateAddress(newAddress.address);
    const phoneValidation = validatePhone(newAddress.phone);
    
    if (!labelValidation.isValid || !addressValidation.isValid || !phoneValidation.isValid) {
      setError(`Validation error: ${labelValidation.message || addressValidation.message || phoneValidation.message}`);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('https://equiply-jrej.onrender.com/api/profile/address', {
        ...newAddress,
        label: newAddress.label.trim(),
        address: newAddress.address.trim(),
        phone: newAddress.phone.trim()
      }, {
        headers: { 'x-access-token': token }
      });
      
      setUserData(prev => ({
        ...prev,
        addresses: response.data.addresses
      }));
      setIsAddingAddress(false);
      setNewAddress({
        label: '',
        type: 'Home',
        address: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error adding address:', error);
      setError('Failed to add address');
    }
  };

  const handleEditAddress = async (addressId) => {
    try {
      const token = localStorage.getItem('authToken');
      const address = userData.addresses.find(addr => addr._id === addressId);
      const response = await axios.put(`https://equiply-jrej.onrender.com/api/profile/address/${addressId}`, address, {
        headers: { 'x-access-token': token }
      });
      
      setUserData(prev => ({
        ...prev,
        addresses: response.data.addresses
      }));
      setEditingAddressId(null);
    } catch (error) {
      console.error('Error updating address:', error);
      setError('Failed to update address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`https://equiply-jrej.onrender.com/api/profile/address/${addressId}`, {
        headers: { 'x-access-token': token }
      });
      
      setUserData(prev => ({
        ...prev,
        addresses: response.data.addresses
      }));
    } catch (error) {
      console.error('Error deleting address:', error);
      setError('Failed to delete address');
    }
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Allow only numbers for phone
      const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
      if (editingAddressId) {
        setUserData(prev => ({
          ...prev,
          addresses: prev.addresses.map(addr =>
            addr._id === editingAddressId ? { ...addr, [name]: numbersOnly } : addr
          )
        }));
      } else {
        setNewAddress(prev => ({
          ...prev,
          [name]: numbersOnly
        }));
      }
    } else {
      if (editingAddressId) {
        setUserData(prev => ({
          ...prev,
          addresses: prev.addresses.map(addr =>
            addr._id === editingAddressId ? { ...addr, [name]: value } : addr
          )
        }));
      } else {
        setNewAddress(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-black border-r-transparent"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8 max-w-lg">
            <p className="text-lg font-medium text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 w-full flex-grow">
        {/* Back Button */}
        <button
          onClick={() => navigate('/product')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft size={18} /> Back to Products
        </button>
        
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <div className="mt-2 w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          <p className="text-gray-500 mt-3">Manage your personal information and delivery addresses</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="mb-8 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                className={`py-3 px-1 font-medium text-lg transition-colors relative ${
                  activeTab === 'profile' 
                    ? 'text-black' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                Profile Information
                {activeTab === 'profile' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
                )}
              </button>
              <button
                className={`py-3 px-1 font-medium text-lg transition-colors relative ${
                  activeTab === 'addresses' 
                    ? 'text-black' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('addresses')}
              >
                My Addresses
                {activeTab === 'addresses' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
                )}
              </button>
            </div>
          </div>

          {/* Profile Content */}
          {activeTab === 'profile' && userData && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FaEdit />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FaTimes />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <FaSave />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="name"
                            value={editedData.name || ''}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border ${
                              validationErrors.name ? 'border-red-500' : 'border-gray-300'
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Enter your full name"
                            maxLength={50}
                          />
                          {validationErrors.name && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <FaUser />
                          </div>
                          <p className="font-medium text-gray-800">{userData.name || 'Not provided'}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                          <FaEnvelope />
                        </div>
                        <p className="font-medium text-gray-800">{userData.email || 'Not provided'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      {isEditing ? (
                        <div>
                          <input
                            type="tel"
                            name="phone"
                            value={editedData.phone || ''}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border ${
                              validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Enter 10-digit mobile number"
                            maxLength={10}
                          />
                          {validationErrors.phone && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <FaPhone />
                          </div>
                          <p className="font-medium text-gray-800">{userData.phone || 'Not provided'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Content */}
          {activeTab === 'addresses' && (
            <>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Saved Addresses</h2>
                  {!isAddingAddress && (
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <FaPlus />
                      <span>Add New Address</span>
                    </button>
                  )}
                </div>

                {isAddingAddress && (
                  <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Label</label>
                        <input
                          type="text"
                          name="label"
                          value={newAddress.label}
                          onChange={handleAddressInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Home, Office"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                        <select
                          name="type"
                          value={newAddress.type}
                          onChange={handleAddressInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: `right 0.5rem center`,
                            backgroundRepeat: `no-repeat`,
                            backgroundSize: `1.5em 1.5em`,
                            paddingRight: `2.5rem`
                          }}
                        >
                          <option value="Home">Home</option>
                          <option value="Office">Office</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                        <textarea
                          name="address"
                          value={newAddress.address}
                          onChange={handleAddressInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Enter your full address including city, state and pincode"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={newAddress.phone}
                          onChange={handleAddressInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="10-digit mobile number"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setIsAddingAddress(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddAddress}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                )}

                <div className="divide-y divide-gray-100">
                  {userData?.addresses && userData.addresses.length > 0 ? (
                    userData.addresses.map((address) => (
                      <div key={address._id} className="p-6">
                        {editingAddressId === address._id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address Label</label>
                                <input
                                  type="text"
                                  name="label"
                                  value={address.label}
                                  onChange={handleAddressInputChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                                <select
                                  name="type"
                                  value={address.type}
                                  onChange={handleAddressInputChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                  style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: `right 0.5rem center`,
                                    backgroundRepeat: `no-repeat`,
                                    backgroundSize: `1.5em 1.5em`,
                                    paddingRight: `2.5rem`
                                  }}
                                >
                                  <option value="Home">Home</option>
                                  <option value="Office">Office</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                                <textarea
                                  name="address"
                                  value={address.address}
                                  onChange={handleAddressInputChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="3"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                                <input
                                  type="tel"
                                  name="phone"
                                  value={address.phone}
                                  onChange={handleAddressInputChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  maxLength={10}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-3">
                              <button
                                onClick={() => setEditingAddressId(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleEditAddress(address._id)}
                                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              <div className="mt-1 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                                <FaMapMarkerAlt />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-lg">{address.label}</h3>
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    address.type === 'Home' ? 'bg-blue-100 text-blue-800' : 
                                    address.type === 'Office' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {address.type}
                                  </span>
                                </div>
                                <p className="text-gray-600 mb-2">{address.address}</p>
                                <p className="text-gray-600">
                                  <span className="font-medium">Phone:</span> {address.phone}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingAddressId(address._id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Edit address"
                              >
                                <FaEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete address"
                              >
                                <FaTrash size={18} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                        <FaMapMarkerAlt size={64} />
                      </div>
                      <p className="text-gray-500 mb-6">You don't have any saved addresses yet</p>
                      {!isAddingAddress && (
                        <button
                          onClick={() => setIsAddingAddress(true)}
                          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Add Your First Address
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;