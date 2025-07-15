import React, { useState, useEffect } from 'react';

interface LinkedInAuthProps {
  onAuthenticated?: (token: string) => void;
  className?: string;
}

interface UserInfo {
  sub?: string;
  name?: string;
  email?: string;
  picture?: string;
  locale?: string;
  given_name?: string;
  family_name?: string;
}

export default function LinkedInAuth({
  onAuthenticated,
  className = '',
}: LinkedInAuthProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Check if user is authenticated with LinkedIn
  useEffect(() => {
    // Try to get token from cookie or localStorage
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    // First try client-accessible cookie
    const tokenFromCookie = getCookie('linkedin_token_client');
    if (tokenFromCookie) {
      setAccessToken(tokenFromCookie);
      setIsAuthenticated(true);
      onAuthenticated?.(tokenFromCookie);
      
      // Try to get user info from cookie
      const userInfoFromCookie = getCookie('linkedin_user_info');
      if (userInfoFromCookie) {
        try {
          setUserInfo(JSON.parse(userInfoFromCookie));
        } catch (e) {
          console.error('Error parsing user info from cookie:', e);
        }
      }
      return;
    }

    // Then try localStorage (less secure but useful for demo)
    const tokenFromStorage = localStorage.getItem('linkedin_token');
    const expiryFromStorage = localStorage.getItem('linkedin_token_expiry');
    const userInfoFromStorage = localStorage.getItem('linkedin_user_info');
    
    if (tokenFromStorage && expiryFromStorage) {
      const expiry = new Date(expiryFromStorage);
      if (expiry > new Date()) {
        setAccessToken(tokenFromStorage);
        setIsAuthenticated(true);
        setTokenExpiry(expiry);
        onAuthenticated?.(tokenFromStorage);
        
        // Try to get user info from localStorage
        if (userInfoFromStorage) {
          try {
            setUserInfo(JSON.parse(userInfoFromStorage));
          } catch (e) {
            console.error('Error parsing user info from localStorage:', e);
          }
        }
      } else {
        // Token expired, clear it
        localStorage.removeItem('linkedin_token');
        localStorage.removeItem('linkedin_token_expiry');
        localStorage.removeItem('linkedin_user_info');
      }
    }
  }, [onAuthenticated]);

  // Handle the OAuth callback
  useEffect(() => {
    // Check if we're on the callback page
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const state = url.searchParams.get('state');
    
    if (code && !error) {
      // Exchange code for token
      const exchangeCodeForToken = async () => {
        try {
          // This would normally be handled server-side to protect your client secret
          // For demo purposes, we're showing the flow here
          const response = await fetch('/api/auth/linkedin/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });
          
          const data = await response.json();
          
          if (data.access_token) {
            setAccessToken(data.access_token);
            setIsAuthenticated(true);
            
            // Calculate expiry
            const expiry = new Date();
            expiry.setSeconds(expiry.getSeconds() + data.expires_in);
            setTokenExpiry(expiry);
            
            // Store token (in a real app, use more secure methods)
            localStorage.setItem('linkedin_token', data.access_token);
            localStorage.setItem('linkedin_token_expiry', expiry.toISOString());
            
            // Store user info if available
            if (data.user_info) {
              setUserInfo(data.user_info);
              localStorage.setItem('linkedin_user_info', JSON.stringify(data.user_info));
            }
            
            onAuthenticated?.(data.access_token);
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('Error exchanging code for token:', error);
        }
      };
      
      exchangeCodeForToken();
    }
  }, [onAuthenticated]);

  const handleLogin = () => {
    // Generate random state for CSRF protection
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('linkedin_auth_state', state);
    
    // Redirect to LinkedIn auth endpoint
    window.location.href = `/api/auth/linkedin?state=${state}`;
  };

  const handleLogout = () => {
    // Clear token and user info from all storage locations
    document.cookie = 'linkedin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'linkedin_token_client=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'linkedin_user_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('linkedin_token');
    localStorage.removeItem('linkedin_token_expiry');
    localStorage.removeItem('linkedin_user_info');
    
    setAccessToken(null);
    setIsAuthenticated(false);
    setTokenExpiry(null);
    setUserInfo(null);
  };

  return (
    <div className={`linkedin-auth ${className}`}>
      {!isAuthenticated ? (
        <button
          onClick={handleLogin}
          className="bg-[#0077b5] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#0069a0] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
          </svg>
          Sign in with LinkedIn
        </button>
      ) : (
        <div className="space-y-3">
          {userInfo && (
            <div className="flex items-center gap-3 bg-white p-3 rounded-md border border-gray-200">
              {userInfo.picture && (
                <img 
                  src={userInfo.picture} 
                  alt={userInfo.name || 'User'} 
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{userInfo.name}</p>
                <p className="text-sm text-gray-500">{userInfo.email}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
            <div>
              <p className="text-sm font-medium">Connected to LinkedIn</p>
              {tokenExpiry && (
                <p className="text-xs text-gray-500">
                  Token expires: {tokenExpiry.toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Disconnect
            </button>
          </div>
          
          {accessToken && (
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-sm font-medium mb-1">Your Access Token:</p>
              <div className="relative">
                <textarea
                  readOnly
                  className="w-full h-20 p-2 text-xs font-mono bg-white border border-gray-300 rounded-md"
                  value={accessToken}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(accessToken);
                    alert('Token copied to clipboard!');
                  }}
                  className="absolute top-2 right-2 bg-gray-200 p-1 rounded-md hover:bg-gray-300"
                  title="Copy to clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use this token with the LinkedIn API functions
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
