import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";

const GoogleLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Note: We're not storing the return path anymore since we always want to go to dashboard
      
      // Create the OAuth URL with the correct redirect URI
      const clientId = '413786747217-shtsu3g52852filvh897jc6si15grtkg.apps.googleusercontent.com';
      // Use the same hostname for the redirect URI as the current page
      const currentHost = window.location.origin;
      const redirectUri = encodeURIComponent(`${currentHost}/oauth-callback`);
      const scope = encodeURIComponent('email profile');
      const responseType = 'token';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                    `client_id=${clientId}&` +
                    `redirect_uri=${redirectUri}&` +
                    `response_type=${responseType}&` +
                    `scope=${scope}&` +
                    `prompt=select_account`;
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
      
    } catch (err) {
      console.error("Google login error:", err);
      setError("Failed to initiate Google login");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className={`flex items-center justify-center w-1/4 mx-auto border border-gray-300 py-3 rounded-full ${
          isLoading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-gray-100 transition"
        }`}
        aria-label="Sign in with Google"
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></span>
        ) : (
          <FcGoogle className="text-xl mr-2" />
        )}
        {isLoading ? "Connecting..." : "Google"}
      </button>
      
      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
      )}
    </div>
  );
};

export default GoogleLoginButton;
