import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing your sign-in...');

  useEffect(() => {
    const processOAuthResponse = async () => {
      try {
        console.log("Processing OAuth callback. URL hash:", window.location.hash);
        
        // Extract token from URL hash fragment
        if (!window.location.hash) {
          throw new Error('No authentication data received');
        }

        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get('access_token');
        const error = params.get('error');

        if (error) {
          throw new Error(`Authentication error: ${error}`);
        }

        if (!accessToken) {
          throw new Error('No access token received');
        }

        setStatus('Verifying your account...');
        console.log("Access token received, fetching user info");

        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user information from Google');
        }

        const userInfo = await userInfoResponse.json();
        console.log("User info received:", userInfo.email);

        setStatus('Almost there...');

        const serverResponse = await fetch('https://equiply-jrej.onrender.com/oauth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleId: userInfo.sub,
            name: userInfo.name,
            email: userInfo.email
          })
        });

        const data = await serverResponse.json();
        
        if (!serverResponse.ok) {
          throw new Error(data.message || 'Failed to authenticate with server');
        }

        console.log("Successfully authenticated with backend");

        // Save auth data
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          if (data.user) {
            localStorage.setItem('userData', JSON.stringify(data.user));
          }
        }

        // Always redirect to dashboard after Google auth regardless of previous page
        window.location.href = '/';

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus(`Login failed: ${error.message}`);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    processOAuthResponse();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-semibold mb-2">Signing you in</h2>
        <p className="text-gray-600 mb-4">{status}</p>
        <p className="text-sm text-gray-500">Please wait while we complete the sign-in process...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
