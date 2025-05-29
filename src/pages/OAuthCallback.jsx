import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallback = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Parse the URL fragments/query parameters
    const processOAuthResponse = async () => {
      try {
        let accessToken = null;
        
        // Check for token in URL fragment (for implicit flow)
        if (window.location.hash) {
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          accessToken = params.get('access_token');
        }
        
        // Check for auth code in query params (for code flow)
        if (!accessToken && window.location.search) {
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          if (code) {
            // You would exchange this code for a token via your backend
            // For now, we'll just redirect to the login page
            navigate('/login');
            return;
          }
        }
        
        if (!accessToken) {
          throw new Error('No access token found');
        }
        
        // Get user info from Google with the token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info from Google');
        }
        
        const userInfo = await userInfoResponse.json();
        
        // Send to backend
        const serverResponse = await fetch('https://equiply-jrej.onrender.com/oauth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            googleId: userInfo.sub,
            name: userInfo.name,
            email: userInfo.email
          }),
        });
        
        const data = await serverResponse.json();
        
        if (!serverResponse.ok) {
          throw new Error(data.message || 'Failed to authenticate');
        }
        
        // Save auth data
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          if (data.user) {
            localStorage.setItem('userData', JSON.stringify(data.user));
          }
        }
        
        // Notify opener if we're in a popup
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ type: 'GOOGLE_LOGIN_SUCCESS' }, window.location.origin);
          window.close();
        } else {
          navigate('/');
        }
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ 
            type: 'GOOGLE_LOGIN_ERROR',
            error: error.message
          }, window.location.origin);
          window.close();
        } else {
          navigate('/login');
        }
      }
    };
    
    processOAuthResponse();
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Completing your login...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
