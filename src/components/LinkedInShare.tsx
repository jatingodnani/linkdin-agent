import React, { useState, useEffect } from 'react';

interface LinkedInShareProps {
  content: string;
  onSuccess?: (response: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function LinkedInShare({
  content,
  onSuccess,
  onError,
  className = '',
}: LinkedInShareProps) {
  const [isPosting, setIsPosting] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated with LinkedIn
  useEffect(() => {
    // Try to get token from cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    const token = getCookie('linkedin_token');
    if (token) {
      setAccessToken(token);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    // Redirect to LinkedIn auth endpoint
    window.location.href = '/api/auth/linkedin';
  };

  const handlePost = async () => {
    if (!accessToken) {
      onError?.('Not authenticated with LinkedIn');
      return;
    }

    setIsPosting(true);
    try {
      const response = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          accessToken,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to post to LinkedIn');
      }

      onSuccess?.(data);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsPosting(false);
    }
  };

  const handleSchedule = async (scheduledTime: string) => {
    if (!accessToken) {
      onError?.('Not authenticated with LinkedIn');
      return;
    }

    setIsPosting(true);
    try {
      const response = await fetch('/api/linkedin/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          accessToken,
          scheduledTime,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to schedule LinkedIn post');
      }

      onSuccess?.(data);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className={`linkedin-share ${className}`}>
      {!isAuthenticated ? (
        <button
          onClick={handleLogin}
          className="bg-[#0077b5] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#0069a0] transition-colors"
          disabled={isPosting}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
          </svg>
          Connect LinkedIn
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePost}
            className="bg-[#0077b5] text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-[#0069a0] transition-colors"
            disabled={isPosting}
          >
            {isPosting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
              </svg>
            )}
            Post to LinkedIn
          </button>
          
          <button
            onClick={() => {
              // Schedule for 1 hour from now as an example
              const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();
              handleSchedule(oneHourFromNow);
            }}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"
            disabled={isPosting}
          >
            {isPosting ? (
              <span className="inline-block w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
              </svg>
            )}
            Schedule for Later
          </button>
        </div>
      )}
    </div>
  );
}
