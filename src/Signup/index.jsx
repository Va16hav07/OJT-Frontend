import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GoogleLoginButton from '../components/GoogleLoginButton'
import { ArrowLeft } from 'lucide-react'

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    profileName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [fieldValidation, setFieldValidation] = useState({
    profileName: { isValid: true, message: "" },
    email: { isValid: true, message: "" },
    password: { isValid: true, message: "" },
    phone: { isValid: true, message: "" }
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return { isValid: false, message: "Email is required" };
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Please enter a valid email address" };
    }
    return { isValid: true, message: "" };
  };

  const validatePassword = (password) => {
    if (!password) {
      return { isValid: false, message: "Password is required" };
    }
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters" };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one lowercase letter" };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one uppercase letter" };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: "Password must contain at least one number" };
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

  const validatePhone = (phone) => {
    if (!phone) {
      return { isValid: true, message: "" }; // Phone is optional in signup
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!/^\d+$/.test(phone)) {
      return { isValid: false, message: "Phone number can only contain digits" };
    }
    if (phone.length !== 10) {
      return { isValid: false, message: "Phone number must be exactly 10 digits" };
    }
    if (!phoneRegex.test(phone)) {
      return { isValid: false, message: "Invalid phone number format" };
    }
    return { isValid: true, message: "" };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For phone, allow only numbers
    if (name === 'phone') {
      const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: numbersOnly });
      
      // Real-time validation
      const validation = validatePhone(numbersOnly);
      setFieldValidation(prev => ({
        ...prev,
        [name]: validation
      }));
    } else {
      setFormData({ ...formData, [name]: value });
      
      // Real-time validation
      let validation = { isValid: true, message: "" };
      switch (name) {
        case 'profileName':
          validation = validateName(value);
          break;
        case 'email':
          validation = validateEmail(value);
          break;
        case 'password':
          validation = validatePassword(value);
          break;
      }
      
      setFieldValidation(prev => ({
        ...prev,
        [name]: validation
      }));
    }
  };

  useEffect(() => {
    // Check if form is valid whenever formData changes
    const { profileName, email, password } = formData;
    const nameValid = validateName(profileName).isValid;
    const emailValid = validateEmail(email).isValid;
    const passwordValid = validatePassword(password).isValid;
    const phoneValid = validatePhone(formData.phone || '').isValid;
    
    const isValid = nameValid && emailValid && passwordValid && phoneValid;
    setIsFormValid(isValid);
  }, [formData]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://equiply-jrej.onrender.com/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.profileName,
          email: formData.email,
          password: formData.password,
          phone: parseInt(formData.phone, 10)
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign up');
      }
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        if (data.user) {
          localStorage.setItem('userData', JSON.stringify(data.user));
        }
      }
      
      console.log("Signup successful:", data);
      navigate('/');
      window.location.reload();
      
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 px-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Back Button */}
      <div className="max-w-2xl mx-auto mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>
      
      <h1 className="text-center text-4xl mb-1">Create an account</h1>
      <p className="text-center text-lg mb-8">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link></p>
      
      <div className="flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl p-6 space-y-6"
        >
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm text-gray-600">
              What should we call you?
            </label>
            <input
              type="text"
              name="profileName"
              placeholder="Enter your profile name"
              value={formData.profileName}
              onChange={handleChange}
              className={`w-full px-4 py-4 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                !fieldValidation.profileName.isValid ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              maxLength={50}
            />
            {!fieldValidation.profileName.isValid && (
              <p className="text-red-500 text-sm mt-1">{fieldValidation.profileName.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-600">
              What's your email?
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-4 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                !fieldValidation.email.isValid ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {!fieldValidation.email.isValid && (
              <p className="text-red-500 text-sm mt-1">{fieldValidation.email.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-600">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="9876543210"
              value={formData.phone || ''}
              onChange={handleChange}
              className={`w-full px-4 py-4 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                !fieldValidation.phone.isValid ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={10}
            />
            {!fieldValidation.phone.isValid && (
              <p className="text-red-500 text-sm mt-1">{fieldValidation.phone.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Enter your 10-digit mobile number
            </p>
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-600">
              Create a password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl text-sm pr-16 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  !fieldValidation.password.isValid ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {!fieldValidation.password.isValid && (
              <p className="text-red-500 text-sm mt-1">{fieldValidation.password.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Use 8+ characters with uppercase, lowercase, numbers
            </p>
          </div>

          <p className="text-xs text-gray-600">
            By creating an account, you agree to the{" "}
            <a href="/terms" className="text-blue-600 underline">
              Terms of use
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 underline">
              Privacy Policy
            </a>
            .
          </p>

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full py-3 font-medium text-sm rounded-full ${
              isFormValid && !isLoading
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Creating account..." : "Create an account"}
          </button>

          <div className="text-center text-sm text-gray-500">OR Continue with</div>

          <GoogleLoginButton />
        </form>
      </div>
    </div>
  );
};

export default Signup