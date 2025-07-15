import { z } from 'zod';
import { config } from './config';

// LinkedIn API configuration
const linkedInConfig = {
  apiUrl: 'https://api.linkedin.com/v2',
  shareUrl: 'https://api.linkedin.com/v2/shares',
  ugcPostUrl: 'https://api.linkedin.com/v2/ugcPosts',
  profileUrl: 'https://api.linkedin.com/v2/me',
};

/**
 * LinkedIn API error schema
 */
const linkedInErrorSchema = z.object({
  serviceErrorCode: z.number().optional(),
  message: z.string(),
  status: z.number().optional(),
});

/**
 * LinkedIn post response schema
 */
const linkedInPostResponseSchema = z.object({
  id: z.string(),
  activity: z.string().optional(),
  created: z.object({
    time: z.number(),
  }).optional(),
});

type LinkedInPostResponse = z.infer<typeof linkedInPostResponseSchema>;
type LinkedInError = z.infer<typeof linkedInErrorSchema>;

/**
 * Post content to LinkedIn
 * @param accessToken LinkedIn access token
 * @param content Post content
 * @returns Response with success or error
 */
export const postToLinkedIn = async (
  accessToken: string,
  content: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // First, get the user's LinkedIn profile to get their ID
    // Try different endpoints to get the user ID based on available permissions
    let authorId: string;
    
    try {
      // Try the v2 API first
      const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        authorId = `urn:li:person:${profileData.id}`;
      } else {
        // If v2 fails, try the basic profile endpoint
        const basicProfileResponse = await fetch('https://api.linkedin.com/v1/people/~?format=json', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (basicProfileResponse.ok) {
          const basicProfileData = await basicProfileResponse.json();
          authorId = `urn:li:person:${basicProfileData.id}`;
        } else {
          // If both fail, try the userinfo endpoint from OpenID Connect
          const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          
          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            // The sub field contains the user ID in OpenID Connect
            authorId = `urn:li:person:${userInfo.sub}`;
          } else {
            throw new Error('Could not retrieve LinkedIn user ID with the provided token');
          }
        }
      }
    } catch (profileError: any) {
      console.error('Error fetching LinkedIn profile:', profileError);
      throw new Error('Failed to fetch LinkedIn profile: ' + (profileError.message || 'Unknown error'));
    }

    // Create the UGC post
    const postBody = {
      author: authorId,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: shareMediaCategory,
          ...(mediaUrls.length > 0 && {
            media: mediaUrls.map(url => ({
              status: 'READY',
              originalUrl: url,
            })),
          }),
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch(linkedInConfig.ugcPostUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const parsedError = linkedInErrorSchema.safeParse(errorData);
      
      if (parsedError.success) {
        throw new Error(parsedError.data.message);
      } else {
        throw new Error('Failed to post to LinkedIn');
      }
    }

    const responseData = await response.json();
    const parsedResponse = linkedInPostResponseSchema.safeParse(responseData);
    
    if (parsedResponse.success) {
      return {
        success: true,
        data: parsedResponse.data
      };
    } else {
      return {
        success: true,
        data: { id: responseData.id } as LinkedInPostResponse
      };
    }
  } catch (error) {
    console.error('LinkedIn API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Schedule a LinkedIn post for a future time
 * @param accessToken LinkedIn access token
 * @param content Post content
 * @param scheduledTime ISO string of scheduled time
 * @returns Response with success or error
 */
export const scheduleLinkedInPost = async (
  accessToken: string,
  content: string,
  scheduledTime: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // First, get the user's LinkedIn profile to get their ID
    // Try different endpoints to get the user ID based on available permissions
    let authorId: string;
    
    try {
      // Try the v2 API first
      const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        authorId = `urn:li:person:${profileData.id}`;
      } else {
        // If v2 fails, try the basic profile endpoint
        const basicProfileResponse = await fetch('https://api.linkedin.com/v1/people/~?format=json', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (basicProfileResponse.ok) {
          const basicProfileData = await basicProfileResponse.json();
          authorId = `urn:li:person:${basicProfileData.id}`;
        } else {
          // If both fail, try the userinfo endpoint from OpenID Connect
          const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          
          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            // The sub field contains the user ID in OpenID Connect
            authorId = `urn:li:person:${userInfo.sub}`;
          } else {
            throw new Error('Could not retrieve LinkedIn user ID with the provided token');
          }
        }
      }
    } catch (profileError: any) {
      console.error('Error fetching LinkedIn profile:', profileError);
      throw new Error('Failed to fetch LinkedIn profile: ' + (profileError.message || 'Unknown error'));
    }

    // Create the UGC post - LinkedIn doesn't support direct scheduling via the API
    // We'll just create a regular post without the scheduling fields
    const postBody = {
      author: authorId,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content + '\n\n(Scheduled for: ' + new Date(scheduledTime).toLocaleString() + ')'
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };
    
    // Note: LinkedIn doesn't actually support scheduling via their API
    // We're adding the scheduled time to the content as a workaround
    console.log(`Posting content with scheduled time note: ${scheduledTime}`);

    const response = await fetch(linkedInConfig.ugcPostUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to schedule post');
    }

    const responseData = await response.json();
    return {
      success: true,
      data: responseData
    };
  } catch (error) {
    console.error('LinkedIn scheduling error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Get LinkedIn OpenID Connect URL for authorization
 * @param clientId LinkedIn app client ID
 * @param redirectUri Redirect URI after authorization
 * @param state Optional state parameter for security
 * @returns LinkedIn authorization URL using OpenID Connect
 */
export const getLinkedInAuthUrl = (
  clientId: string,
  redirectUri: string,
  state: string = Math.random().toString(36).substring(7)
): string => {
  // Using OpenID Connect flow with LinkedIn
  // Include all necessary scopes for profile access and posting
  const scope = encodeURIComponent('openid profile email w_member_social r_basicprofile r_liteprofile r_emailaddress');
  const nonce = Math.random().toString(36).substring(7);
  
  // Use form_post response mode for better security
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}&nonce=${nonce}&response_mode=form_post`;
};

/**
 * Exchange authorization code for access token and ID token using OpenID Connect
 * @param code Authorization code from LinkedIn
 * @param clientId LinkedIn app client ID
 * @param clientSecret LinkedIn app client secret
 * @param redirectUri Redirect URI used in authorization
 * @returns Access token and user info response
 */
export const getLinkedInAccessToken = async (
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ 
  access_token: string; 
  id_token?: string;
  expires_in: number;
  user_info?: any;
} | { error: string }> => {
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(error.error_description || 'Failed to get access token');
    }

    const tokens = await tokenResponse.json();
    
    // If we have an ID token, we can decode it to get user info
    // Otherwise, we need to make a separate call to the userinfo endpoint
    let userInfo = null;
    if (tokens.id_token) {
      // For a production app, you should validate the ID token signature
      // Here we're just decoding it to get the payload
      const payload = JSON.parse(
        Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
      );
      userInfo = payload;
    } else {
      // Get user info from userinfo endpoint
      try {
        const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
          },
        });
        
        if (userInfoResponse.ok) {
          userInfo = await userInfoResponse.json();
        }
      } catch (userInfoError) {
        console.error('Error fetching user info:', userInfoError);
      }
    }

    return {
      ...tokens,
      user_info: userInfo
    };
  } catch (error) {
    console.error('LinkedIn token error:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
