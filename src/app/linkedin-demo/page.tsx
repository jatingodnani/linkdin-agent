'use client';

import React, { useState, useEffect } from 'react';
import LinkedInAuth from '@/components/LinkedInAuth';
import LinkedInShare from '@/components/LinkedInShare';
import LinkedInScheduler from '@/components/LinkedInScheduler';
import { generatePost } from '@/lib/gemini';

export default function LinkedInDemoPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [postStatus, setPostStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const handleGenerate = async () => {
    if (!topic) return;
    
    setIsGenerating(true);
    try {
      const post = await generatePost(topic);
      setGeneratedPost(post);
    } catch (error) {
      console.error('Error generating post:', error);
      setPostStatus({
        success: false,
        message: 'Failed to generate post. Please try again.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePostSuccess = (response: any) => {
    setPostStatus({
      success: true,
      message: 'Successfully posted to LinkedIn!'
    });
    
    // Clear after a few seconds
    setTimeout(() => {
      setPostStatus({});
    }, 5000);
  };

  const handlePostError = (error: string) => {
    setPostStatus({
      success: false,
      message: `Error: ${error}`
    });
    
    // Clear after a few seconds
    setTimeout(() => {
      setPostStatus({});
    }, 5000);
  };
  // Debug effect to check cookies and token status
  useEffect(() => {
    // Function to get cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };
    
    // Check for tokens in various storage locations
    const clientCookie = getCookie('linkedin_token_client');
    const serverCookie = getCookie('linkedin_token');
    const localStorageToken = localStorage.getItem('linkedin_token');
    
    console.log('Debug token info:', {
      accessTokenState: accessToken,
      clientCookie,
      serverCookie,
      localStorageToken,
      allCookies: document.cookie
    });
    
    // If we have a token in a cookie but not in state, set it
    if (!accessToken && clientCookie) {
      console.log('Setting token from client cookie');
      setAccessToken(clientCookie);
    }
  }, [accessToken]);
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">LinkedIn Automation Demo</h1>
      
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Step 1: Connect to LinkedIn</h2>
        <LinkedInAuth 
          onAuthenticated={(token) => setAccessToken(token)} 
          className="mb-4"
        />
        {accessToken && (
          <p className="text-sm text-green-600">✓ Connected to LinkedIn</p>
        )}
      </div>
      
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Step 2: Generate LinkedIn Post</h2>
        <div className="mb-4">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Topic for your LinkedIn post
          </label>
          <input
            type="text"
            id="topic"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., AI in healthcare, remote work trends, leadership skills"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        
        <button
          onClick={handleGenerate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          disabled={isGenerating || !topic}
        >
          {isGenerating ? 'Generating...' : 'Generate Post'}
        </button>
        
        {generatedPost && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Generated Post
            </label>
            <textarea
              className="w-full h-40 p-3 border border-gray-300 rounded-md"
              value={generatedPost}
              onChange={(e) => setGeneratedPost(e.target.value)}
            />
          </div>
        )}
      </div>
      
      {generatedPost && accessToken && (
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Step 3: Post to LinkedIn</h2>
          
          <div className="flex gap-4 mb-4">
            <LinkedInShare
              content={generatedPost}
              onSuccess={handlePostSuccess}
              onError={handlePostError}
              className="flex-1"
            />
            
            <button
              onClick={() => setShowScheduler(!showScheduler)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              {showScheduler ? 'Hide Scheduler' : 'Show Scheduler'}
            </button>
          </div>
          
          {showScheduler && (
            <LinkedInScheduler
              content={generatedPost}
              accessToken={accessToken}
              onSuccess={handlePostSuccess}
              onError={handlePostError}
            />
          )}
          
          {postStatus.message && (
            <div className={`mt-4 p-3 rounded-md ${postStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {postStatus.message}
            </div>
          )}
        </div>
      )}
      
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h2 className="text-lg font-medium mb-2">How to Automate LinkedIn Posting</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Create a LinkedIn Developer App at <a href="https://www.linkedin.com/developers/apps" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">LinkedIn Developer Portal</a></li>
          <li>Add your Client ID and Secret to your <code className="bg-gray-200 px-1 rounded">.env</code> file</li>
          <li>Connect your LinkedIn account using the authentication flow</li>
          <li>Generate content or use your own</li>
          <li>Post immediately or schedule for optimal times</li>
          <li>For full automation, consider setting up a cron job or scheduled task</li>
        </ol>
      </div>
    </div>
  );
}
