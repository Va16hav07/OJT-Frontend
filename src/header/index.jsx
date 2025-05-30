import {
  FaBell,
  FaHeart,
  FaUserCircle,
  FaMapMarkerAlt,
  FaSearch,
  FaChevronDown,
  FaSignOutAlt,
  FaUser,
  FaClipboardList,
  FaUpload,
  FaMoon,
  FaSun
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useContext, useCallback } from "react";
import indianCities from "../data/cities";
import axios from "axios";
import { WishlistContext } from '../product';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const { wishlistItems = [] } = useContext(WishlistContext) || {};
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [searchTerm, setSearchTerm] = useState(params.get("search") || "");
  const [selectedCity, setSelectedCity] = useState(localStorage.getItem('selectedCity') || "Bengaluru");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const bellRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  const userId = JSON.parse(localStorage.getItem("userData"))?._id;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    // Initial notifications fetch if user is logged in
    if (token && userId) {
      fetchNotifications();
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userId]);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const { data } = await axios.get(`https://equiply-jrej.onrender.com/api/notifications/${userId}`);
      setNotifications(data);
      // Count unread notifications
      setUnreadCount(data.filter(notif => !notif.read).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`https://equiply-jrej.onrender.com/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setIsUserMenuOpen(false);
    navigate("/");
    window.location.reload();
  };

  const handleSearch = useCallback((value) => {
    const trimmedSearch = value.trim();
    if (trimmedSearch) {
      navigate(`/product?search=${encodeURIComponent(trimmedSearch)}`, { replace: true });
    } else {
      navigate("/product", { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout to debounce the search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300); // 300ms delay
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };

  const focusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <header className={`${isDarkMode ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700' : 'bg-gradient-to-r from-[#0D2C85] to-[#1A3A9F]'} text-white px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-50 transition-colors duration-300`}>
      <div className="flex items-center space-x-3">
        <h1 
          className={`text-3xl font-bold font-['Inknut_Antiqua'] cursor-pointer ${isDarkMode ? 'hover:text-blue-300 text-white' : 'hover:text-blue-200'} transition-colors`}
          onClick={() => navigate('/')}
        >
          Equiply
        </h1>
        <div className="relative" ref={dropdownRef}>
          <div
            className={`flex items-center space-x-1 text-sm cursor-pointer ${isDarkMode ? 'hover:text-blue-300 bg-gray-800 border border-gray-600' : 'hover:text-blue-200 bg-blue-900'} bg-opacity-30 px-3 py-2 rounded-md transition-colors`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <FaMapMarkerAlt className={`${isDarkMode ? 'text-blue-400' : 'text-blue-300'}`} />
            <span className="font-medium">{selectedCity}</span>
            <FaChevronDown className="text-xs" />
          </div>
          {isDropdownOpen && (
            <div className={`absolute top-full left-0 mt-1 ${isDarkMode ? 'bg-gray-900 text-white border border-gray-700' : 'bg-white text-black'} shadow-xl rounded-md py-2 z-10 max-h-60 overflow-y-auto w-48 transition-all duration-200 ease-in-out`}>
              <div
                className={`px-4 py-2 ${isDarkMode ? 'hover:bg-gray-800 text-blue-400 border-gray-700' : 'hover:bg-blue-50 text-blue-600 border-gray-100'} cursor-pointer text-sm transition-colors font-medium border-b`}
                onClick={() => {
                  setSelectedCity("All Cities");
                  localStorage.setItem('selectedCity', "All Cities");
                  setIsDropdownOpen(false);
                  window.location.reload();
                }}
              >
                All Cities
              </div>
              {indianCities.map((city, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50'} cursor-pointer text-sm transition-colors`}
                  onClick={() => {
                    setSelectedCity(city);
                    localStorage.setItem('selectedCity', city);
                    setIsDropdownOpen(false);
                    window.location.reload();
                  }}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 mx-6 max-w-xl">
        <div className="relative group">
          <FaSearch 
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-blue-400'} transition-colors`} 
            onClick={focusSearch}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for equipment to rent..."
            className={`w-full pl-10 pr-4 py-2 rounded-full text-black text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-blue-500 hover:ring-1 hover:ring-blue-400' : 'focus:ring-blue-400 hover:ring-1 hover:ring-blue-300'} transition-all`}
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <div className="flex items-center space-x-5 text-white text-lg">
        {isLoggedIn && (
          <>
            <div ref={bellRef} className="relative group">
              <FaBell
                className={`cursor-pointer ${isDarkMode ? 'hover:text-blue-300' : 'hover:text-blue-200'} transition-colors`}
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  fetchNotifications();
                }}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
              <span className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-black'} bg-opacity-90 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none`}>
                Notifications
              </span>
              {isNotifOpen && (
                <div className={`absolute right-0 mt-2 w-80 ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'} text-black rounded-md shadow-xl z-30 max-h-80 overflow-y-auto`}>
                  <div className={`px-4 py-2 ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100'} font-semibold border-b flex justify-between items-center`}>
                    <span>Notifications</span>
                    {unreadCount > 0 && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                  </div>
                  {notifications.length === 0 ? (
                    <div className={`px-4 py-8 text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No notifications</div>
                  ) : (
                    notifications.map((notif, index) => (
                      <div
                        key={index}
                        className={`px-4 py-3 text-sm border-b cursor-pointer transition-colors ${
                          isDarkMode 
                            ? `${!notif.read ? "bg-gray-800 text-white font-semibold" : "text-gray-300"} hover:bg-gray-700 border-gray-700`
                            : `${!notif.read ? "bg-blue-50 font-semibold" : ""} hover:bg-gray-100`
                        }`}
                        onClick={() => markAsRead(notif._id)}
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold">{notif.title || "Notification"}</span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(notif.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {notif.message.length > 70 
                            ? notif.message.substring(0, 67) + "..."
                            : notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="relative group">
              <div className="relative">
                <FaHeart 
                  className={`cursor-pointer ${isDarkMode ? 'hover:text-red-400' : 'hover:text-red-400'} transition-colors`} 
                  onClick={() => navigate('/wishlist')}
                />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <span className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-black'} bg-opacity-90 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none`}>
                Wishlist
              </span>
            </div>
          </>
        )}
        {isLoggedIn ? (
          <div className="relative" ref={userMenuRef}>
            <FaUserCircle
              className={`text-2xl cursor-pointer ${isDarkMode ? 'hover:text-blue-300' : 'hover:text-blue-200'} transition-colors`}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            />
            {isUserMenuOpen && (
              <div className={`absolute top-full right-0 mt-2 ${isDarkMode ? 'bg-gray-900 text-white border border-gray-700' : 'bg-white text-black'} shadow-xl rounded-md py-2 z-20 w-56 transition-all duration-200 ease-in-out`}>
                <div className={`px-4 py-3 ${isDarkMode ? 'border-gray-700' : 'border-b'} border-b`}>
                  <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>{JSON.parse(localStorage.getItem("userData"))?.name || "User"}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>{JSON.parse(localStorage.getItem("userData"))?.email || ""}</div>
                </div>
                <div
                  className={`px-4 py-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50'} cursor-pointer flex items-center transition-colors`}
                  onClick={() => navigate("/profile")}
                >
                  <FaUser className={`mr-3 text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span>Profile</span>
                </div>
                <div
                  className={`px-4 py-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50'} cursor-pointer flex items-center transition-colors`}
                  onClick={() => navigate("/History")}
                >
                  <FaClipboardList className={`mr-3 text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span>Orders</span>
                </div>
                <div
                  className={`px-4 py-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50'} cursor-pointer flex items-center transition-colors`}
                  onClick={() => navigate("/PutRent")}
                >
                  <FaUpload className={`mr-3 text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span>Put for Rent</span>
                </div>
                <div
                  className={`px-4 py-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50'} cursor-pointer flex items-center transition-colors`}
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? (
                    <FaSun className={`mr-3 text-sm ${isDarkMode ? 'text-yellow-400' : 'text-blue-600'}`} />
                  ) : (
                    <FaMoon className={`mr-3 text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  )}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <hr className={`my-1 ${isDarkMode ? 'border-gray-700' : ''}`} />
                <div
                  className={`px-4 py-2 ${isDarkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'} cursor-pointer flex items-center transition-colors`}
                  onClick={handleSignOut}
                >
                  <FaSignOutAlt className="mr-3 text-sm" />
                  <span>Sign Out</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center">
            <Link to="/login" className={`${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-blue-900 hover:bg-blue-100'} px-4 py-1.5 rounded-l-full transition-colors font-medium no-underline`}>
              Login
            </Link>
            <Link to="/Signup" className={`${isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-900 hover:bg-blue-800'} px-4 py-1.5 rounded-r-full transition-colors font-medium no-underline`}>
              Signup
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
