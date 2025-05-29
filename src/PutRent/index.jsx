import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../header";
import Footer from "../Footer";

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
        images: uploadedImages, // Changed from uploadedImages[0] to send all images
        location,
        renting: rentingPrices,
        availability: `${availability.duration} ${availability.period}` // Format: "2 weeks", "3 months", etc.
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

      // Redirect to product view page
      navigate(`/productveiw/${data.product._id}`);
    } catch (error) {
      console.error('Error creating product:', error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <div className="flex gap-[180px] mt-8">
          <div className="space-y-4">
            <div 
              className={`w-96 h-96 bg-gray-200 rounded shadow-[0px_24px_24px_0px_rgba(0,0,0,0.05)] border-2 border-dashed ${
                dragActive ? 'border-[#0D2C85] bg-blue-50' : 'border-blue-800/30'
              } relative cursor-pointer`}
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
                  <div className="grid grid-cols-2 gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-40 object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFiles(files => files.filter((_, i) => i !== index));
                              setUploadedImages(images => images.filter((_, i) => i !== index));
                            }}
                            className="text-white bg-red-500 p-1 rounded-full hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                        <span className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                    {selectedFiles.length < 6 && (
                      <div 
                        className="w-full h-40 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-[#0D2C85] hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current.click();
                        }}
                      >
                        <span className="text-gray-500">+ Add More</span>
                      </div>
                    )}
                  </div>
                  {selectedFiles.length >= 6 && (
                    <p className="text-sm text-gray-500 mt-2">Maximum 6 images allowed</p>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="text-center">
                    <span className="text-stone-950 text-base font-bold font-['Poppins'] leading-normal">
                      Drag & drop files or
                    </span>
                    <span className="text-indigo-800 text-base font-bold font-['Poppins'] underline leading-normal ml-1">
                      Browse
                    </span>
                  </div>
                  <div className="text-center text-stone-500 text-xs mt-2">
                    Supported formats: JPEG, PNG
                  </div>
                </div>
              )}
            </div>
            {uploadError && (
              <p className="text-red-500 text-sm">{uploadError}</p>
            )}
          </div>

          <div className="w-[500px] space-y-8">
            <label className="block text-stone-500 text-lg font-normal font-['Poppins']">
              Product Name
              <input
                className="w-full mt-2 px-6 py-5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 font-['Poppins']"
                placeholder="Enter product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </label>

            <label className="block text-stone-500 text-lg font-normal font-['Poppins']">
              Category
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full mt-2 px-6 py-5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 font-['Poppins'] appearance-none cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-stone-500 text-lg font-normal font-['Poppins']">
              Product Description
              <textarea
                className="w-full mt-2 px-6 py-5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 font-['Poppins'] min-h-[120px] resize-none"
                placeholder="Enter product description"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </label>

            <label className="block text-stone-500 text-lg font-normal font-['Poppins']">
              Product Address
              {!isAddressExpanded ? (
                <input
                  className="w-full mt-2 px-6 py-5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 font-['Poppins']"
                  placeholder="Enter pickup address"
                  onClick={() => setIsAddressExpanded(true)}
                />
              ) : (
                <div className="space-y-4 mt-2">
                  <input
                    className="w-full px-6 py-5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 font-['Poppins']"
                    placeholder="Address Line 1"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                  />
                  <input
                    className="w-full px-6 py-5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 font-['Poppins']"
                    placeholder="Address Line 2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                  <div className="flex gap-4">
                    <input
                      className="flex-1 px-6 py-5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 font-['Poppins']"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                    <input
                      className="flex-1 px-6 py-5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 font-['Poppins']"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                    <input
                      className="flex-1 px-6 py-5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 font-['Poppins']"
                      placeholder="Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </label>

            <label className="block text-stone-500 text-lg font-normal font-['Poppins']">
              Product Availability
              <div className="flex gap-4 mt-2">
                <input
                  type="number"
                  min="1"
                  value={availability.duration}
                  onChange={(e) => setAvailability(prev => ({ ...prev, duration: e.target.value }))}
                  className="flex-1 px-6 py-5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 font-['Poppins']"
                  placeholder="Duration"
                />
                <select
                  value={availability.period}
                  onChange={(e) => setAvailability(prev => ({ ...prev, period: e.target.value }))}
                  className="flex-1 px-6 py-5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 font-['Poppins'] appearance-none cursor-pointer"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </label>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-stone-500 text-lg font-normal font-['Poppins']">
                  Product Prices
                </label>
                <button
                  onClick={addPrice}
                  className="px-4 py-2 bg-[#0D2C85] text-white rounded-lg hover:opacity-90"
                >
                  Add Price
                </button>
              </div>

              {prices.map((priceItem, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <label className="block text-stone-500 text-lg font-normal font-['Poppins'] flex-1">
                    Price
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={priceItem.isSaved ? priceItem.price : priceItem.tempPrice}
                        onChange={(e) => updatePrice(index, "price", e.target.value)}
                        disabled={priceItem.isSaved}
                        className={`w-full mt-2 pl-10 pr-6 py-5 border ${
                          priceItem.error ? 'border-red-500' : 'border-gray-300'
                        } rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 font-['Poppins'] ${
                          priceItem.isSaved ? 'bg-gray-100' : ''
                        }`}
                        placeholder="0.00"
                      />
                      {priceItem.error && (
                        <p className="text-red-500 text-sm mt-1">{priceItem.error}</p>
                      )}
                    </div>
                    </label>

                    <label className="block text-stone-500 text-lg font-normal font-['Poppins'] flex-1">
                      Rate Per
                      <select
                        value={priceItem.isSaved ? priceItem.period : priceItem.tempPeriod}
                        onChange={(e) => updatePrice(index, "period", e.target.value)}
                        disabled={priceItem.isSaved}
                        className={`w-full mt-2 px-6 py-5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 font-['Poppins'] appearance-none cursor-pointer ${
                          priceItem.isSaved ? 'bg-gray-100' : 'bg-white'
                        }`}
                      >
                        {getAvailablePeriods(index).map((period) => (
                          <option key={period} value={period}>
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="flex gap-2">
                      {!priceItem.isSaved ? (
                        <button
                          onClick={() => savePrice(index)}
                          className="mb-2 px-4 py-2 bg-[#0D2C85] text-white rounded-lg hover:opacity-90"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => editPrice(index)}
                          className="mb-2 px-4 py-2 bg-[#0D2C85] text-white rounded-lg hover:opacity-90"
                        >
                          Edit
                        </button>
                      )}
                      {prices.length > 1 && (
                        <button
                          onClick={() => removePrice(index)}
                          className="mb-2 px-4 py-2 text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            
            {submitError && (
              <div className="text-red-500 text-sm mt-4">{submitError}</div>
            )}
            
            <div className="pt-8">
              <button 
                className="w-full px-16 py-3 bg-black rounded-lg inline-flex justify-center items-center gap-2 hover:bg-gray-800"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <div className="text-center text-white text-sm font-medium font-['Inter'] leading-normal">
                  {isSubmitting ? "Uploading..." : "Upload Your Product"}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
                <Footer />
    </div>
  );
};

export default PutRent;
