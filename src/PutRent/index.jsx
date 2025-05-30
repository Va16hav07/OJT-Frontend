import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "../header";
import Footer from "../Footer";
import indianCities from "../data/cities";

const PutRent = () => {
  const [ratePeriod, setRatePeriod] = useState("days");
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [prices, setPrices] = useState([{ 
    period: "days", 
    price: "", 
    error: "",
    isSaved: false, // Add this field
    tempPrice: "", // Add this field for temporary price storage
    tempPeriod: "days" // Add this field for temporary period storage
  }]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tools");
  const [availability, setAvailability] = useState({
    duration: "1",
    period: "weeks"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const categories = [
    "Mobile",
    "Electronics", 
    "House Appliances",
    "Accessories",
    "Tools",
    "Music",
    "Transport",
    "Gaming",
    "Books",
    "Costume",
    "Other"
  ];

  // Add city-state mapping
  const cityStateMap = {
    "Bengaluru": "Karnataka",
    "Mumbai": "Maharashtra",
    "Delhi": "Delhi",
    "Hyderabad": "Telangana",
    "Chennai": "Tamil Nadu",
    "Kolkata": "West Bengal",
    "Pune": "Maharashtra",
    "Ahmedabad": "Gujarat",
    "Jaipur": "Rajasthan",
    "Lucknow": "Uttar Pradesh",
    "Kochin": "Kerala",
    "Thiruvananthapuram": "Kerala",
    "Guwahati": "Assam",
    "Patna": "Bihar"
  };

  // Add function to handle city change
  const handleCityChange = (selectedCity) => {
    setCity(selectedCity);
    setState(cityStateMap[selectedCity] || "");
  };

  const addPrice = () => {
    // Get all available periods for the new price entry
    const availablePeriods = getAvailablePeriods(prices.length);
    // Use the first available period as default
    const defaultPeriod = availablePeriods[0] || "hours";
    setPrices([...prices, { 
      period: defaultPeriod, 
      price: "", 
      error: "",
      isSaved: false,
      tempPrice: "",
      tempPeriod: defaultPeriod
    }]);
  };

  const removePrice = (index) => {
    setPrices(prices.filter((_, i) => i !== index));
  };

  const getAvailablePeriods = (currentIndex) => {
    const allPeriods = ["hours", "days", "weeks", "months"];
    const usedPeriods = prices
      .filter((_, index) => index !== currentIndex)
      .map((price) => price.period);
    return allPeriods.filter((period) => !usedPeriods.includes(period));
  };

  const updatePrice = (index, field, value) => {
    const newPrices = [...prices];
    if (field === "price") {
      if (parseFloat(value) < 0) return;
      newPrices[index].tempPrice = value;
      if (value.trim() === "") {
        newPrices[index].error = "Price cannot be empty";
      } else {
        newPrices[index].error = "";
      }
    } else if (field === "period") {
      newPrices[index].tempPeriod = value;
    }
    setPrices(newPrices);
  };

  const savePrice = (index) => {
    const newPrices = [...prices];
    const currentPrice = newPrices[index];
    
    if (!currentPrice.tempPrice || currentPrice.tempPrice.trim() === "") {
      currentPrice.error = "Price cannot be empty";
      setPrices(newPrices);
      return;
    }

    currentPrice.price = currentPrice.tempPrice;
    currentPrice.period = currentPrice.tempPeriod;
    currentPrice.isSaved = true;
    currentPrice.error = "";
    setPrices(newPrices);
  };

  const editPrice = (index) => {
    const newPrices = [...prices];
    newPrices[index].isSaved = false;
    setPrices(newPrices);
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const validFiles = Array.from(files).filter(file => 
        file.type === "image/jpeg" || file.type === "image/png"
      );
      uploadFiles(validFiles);
    }
  };

  const uploadFiles = async (files) => {
    try {
      const uploadedUrls = [];
      setUploadError(null);

      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('https://equiply-jrej.onrender.com/upload/image', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          uploadedUrls.push(data.url);
        }
      }

      setUploadedImages(prev => [...prev, ...uploadedUrls]);
      setSelectedFiles(prev => [...prev, ...files]);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Error uploading files. Please try again.');
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type === "image/jpeg" || file.type === "image/png"
      );
      uploadFiles(validFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Validate required fields
      if (!productName || !productDescription || !selectedCategory) {
        throw new Error("Please fill all required fields");
      }

      // Validate at least one price is saved
      const savedPrices = prices.filter(p => p.isSaved);
      if (savedPrices.length === 0) {
        throw new Error("Please save at least one price");
      }

      // Format rental prices
      const rentingPrices = {};
      savedPrices.forEach(price => {
        rentingPrices[price.period] = parseFloat(price.price);
      });

      // Format address
      const location = `${addressLine1}${addressLine2 ? `, ${addressLine2}` : ''}, ${city}, ${state} ${pincode}`;

      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const productData = {
        name: productName,
        description: productDescription,
        price: savedPrices[0].price,
        category: selectedCategory,
        images: uploadedImages,
        location,
        renting: rentingPrices,
        availability: `${availability.duration} ${availability.period}`
      };

      const response = await fetch('https://equiply-jrej.onrender.com/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to create product");
      }

      // Change navigation to redirect to the product page instead of product view
      navigate('/product');
      
    } catch (error) {
      console.error('Error creating product:', error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
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
          <h1 className="text-3xl font-bold text-gray-800">List Your Item for Rent</h1>
          <div className="mt-2 w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          <p className="text-gray-500 mt-3">Share your equipment with others and earn money</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Upload Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Images</h2>
              <div 
                className={`w-full h-96 bg-gray-100 rounded-xl ${
                  dragActive ? 'border-2 border-dashed border-blue-600 bg-blue-50' : 'border-2 border-dashed border-gray-300'
                } relative cursor-pointer transition-all`}
                onClick={() => fileInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedFiles.length > 0 ? (
                  <div className="absolute inset-0 p-4 overflow-auto">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden shadow-sm h-40">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFiles(files => files.filter((_, i) => i !== index));
                                setUploadedImages(images => images.filter((_, i) => i !== index));
                              }}
                              className="text-white bg-red-500 p-2 rounded-full hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                          <span className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 text-xs rounded-full">
                            Image {index + 1}
                          </span>
                        </div>
                      ))}
                      {selectedFiles.length < 6 && (
                        <div 
                          className="h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current.click();
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-gray-500 mt-2">Add More</span>
                        </div>
                      )}
                    </div>
                    {selectedFiles.length >= 6 && (
                      <p className="text-sm text-gray-500 mt-4 text-center">Maximum 6 images allowed</p>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drag & drop files or <span className="text-blue-600 underline cursor-pointer">Browse</span>
                    </p>
                    <p className="text-gray-500 text-sm">Supported formats: JPEG, PNG (Max 6 images)</p>
                  </div>
                )}
              </div>
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                  {uploadError}
                </div>
              )}
              
              {/* General Guidelines */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-2">Image Guidelines:</h3>
                <ul className="text-sm text-gray-600 space-y-1 pl-4 list-disc">
                  <li>Clear, well-lit photos increase your chances of renting</li>
                  <li>Include multiple angles of your product</li>
                  <li>Show any special features or accessories included</li>
                  <li>Ensure images accurately represent the item's condition</li>
                </ul>
              </div>
            </div>

            {/* Product Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Information</h2>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: `right 0.5rem center`,
                    backgroundRepeat: `no-repeat`,
                    backgroundSize: `1.5em 1.5em`,
                    paddingRight: `2.5rem`
                  }}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                  placeholder="Describe your product in detail: condition, specifications, features, etc."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Pickup Location <span className="text-red-500">*</span>
                </label>
                {!isAddressExpanded ? (
                  <button
                    onClick={() => setIsAddressExpanded(true)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                  >
                    Click to enter pickup address
                  </button>
                ) : (
                  <div className="space-y-3">
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Address Line 1"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                    />
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Address Line 2 (Optional)"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <select
                        className="px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                        value={city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: `right 0.5rem center`,
                          backgroundRepeat: `no-repeat`,
                          backgroundSize: `1.5em 1.5em`,
                          paddingRight: `2.5rem`
                        }}
                      >
                        <option value="">Select City</option>
                        {indianCities.map((cityName) => (
                          <option key={cityName} value={cityName}>
                            {cityName}
                          </option>
                        ))}
                      </select>
                      <input
                        className="px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="State"
                        value={state}
                        readOnly
                      />
                      <input
                        className="px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Availability Period
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    value={availability.duration}
                    onChange={(e) => setAvailability(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-1/3 px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Duration"
                  />
                  <select
                    value={availability.period}
                    onChange={(e) => setAvailability(prev => ({ ...prev, period: e.target.value }))}
                    className="w-2/3 px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: `right 0.5rem center`,
                      backgroundRepeat: `no-repeat`,
                      backgroundSize: `1.5em 1.5em`,
                      paddingRight: `2.5rem`
                    }}
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Rental Pricing</h2>
              <button
                onClick={addPrice}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Price Option
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                Set different rental rates for different durations. For example, you can charge ₹100 per day and ₹500 per week.
              </p>
            </div>

            <div className="space-y-4">
              {prices.map((priceItem, index) => (
                <div key={index} className={`p-4 rounded-lg transition-all ${priceItem.isSaved ? 'bg-blue-50 border border-blue-100' : 'bg-white border border-gray-200'}`}>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={priceItem.isSaved ? priceItem.price : priceItem.tempPrice}
                          onChange={(e) => updatePrice(index, "price", e.target.value)}
                          disabled={priceItem.isSaved}
                          className={`w-full px-4 pl-8 py-3 border ${
                            priceItem.error ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            priceItem.isSaved ? 'bg-blue-50' : 'bg-white'
                          }`}
                          placeholder="0.00"
                        />
                        {priceItem.error && (
                          <p className="text-red-500 text-sm mt-1">{priceItem.error}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Period
                      </label>
                      <select
                        value={priceItem.isSaved ? priceItem.period : priceItem.tempPeriod}
                        onChange={(e) => updatePrice(index, "period", e.target.value)}
                        disabled={priceItem.isSaved}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                          priceItem.isSaved ? 'bg-blue-50' : 'bg-white'
                        }`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: `right 0.5rem center`,
                          backgroundRepeat: `no-repeat`,
                          backgroundSize: `1.5em 1.5em`,
                          paddingRight: `2.5rem`
                        }}
                      >
                        {getAvailablePeriods(index).map((period) => (
                          <option key={period} value={period}>
                            per {period.charAt(0).toUpperCase() + period.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end gap-2">
                      {!priceItem.isSaved ? (
                        <button
                          onClick={() => savePrice(index)}
                          className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => editPrice(index)}
                          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                      {prices.length > 1 && (
                        <button
                          onClick={() => removePrice(index)}
                          className="px-4 py-3 text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Submit Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{submitError}</p>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
                      </svg>
                      <span>List Your Product</span>
                    </>
                  )}
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

export default PutRent;
