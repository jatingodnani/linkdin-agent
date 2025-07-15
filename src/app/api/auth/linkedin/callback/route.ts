import { NextResponse } from 'next/server';
import { getLinkedInAccessToken } from '@/lib/linkedin';
import { config } from '@/lib/config';

// Handle both GET and POST requests since OpenID Connect can use form_post response mode
export async function POST(request: Request) {
  return handleCallback(request);
}

export async function GET(request: Request) {
  return handleCallback(request);
}

async function handleCallback(request: Request) {
  try {
    // Get parameters from either query string (GET) or form data (POST)
    let code, error, state;
    
    if (request.method === 'POST') {
      // Handle form_post response mode
      const formData = await request.formData();
      code = formData.get('code')?.toString();
      error = formData.get('error')?.toString();
      state = formData.get('state')?.toString();
    } else {
      // Handle query parameters (GET)
      const { searchParams } = new URL(request.url);
      code = searchParams.get('code');
      error = searchParams.get('error');
      state = searchParams.get('state');
    }
    
    // Handle LinkedIn auth errors
    if (error) {
      return NextResponse.redirect(`${new URL(request.url).origin}/error?message=${encodeURIComponent(error)}`);
    }
    
    if (!code) {
      return NextResponse.redirect(`${new URL(request.url).origin}/error?message=No authorization code received`);
    }
    
    const tokenResponse = await getLinkedInAccessToken(
      code,
      config.linkedin.clientId,
      config.linkedin.clientSecret,
      config.linkedin.redirectUri
    );
    
    if ('error' in tokenResponse) {
      return NextResponse.redirect(`${new URL(request.url).origin}/error?message=${encodeURIComponent(tokenResponse.error)}`);
    }
    
    // Store the token in a secure cookie or session
    const response = NextResponse.redirect(`${new URL(request.url).origin}/linkedin-demo`);
    
    // Set a secure, httpOnly cookie with the access token (for server-side use)
    response.cookies.set({
      name: 'linkedin_token',
      value: tokenResponse.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenResponse.expires_in,
      path: '/',
    });
    
    // Also set a non-httpOnly cookie for client-side access
    // NOTE: In production, you should use a more secure method like session storage
    response.cookies.set({
      name: 'linkedin_token_client',
      value: tokenResponse.access_token,
      httpOnly: false, // Allow JavaScript access
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenResponse.expires_in,
      path: '/',
    });
    
    // If we have user info, store it in a separate cookie
    if (tokenResponse.user_info) {
      response.cookies.set({
        name: 'linkedin_user_info',
        value: JSON.stringify(tokenResponse.user_info),
        httpOnly: false, // Allow JavaScript access for UI display
        secure: process.env.NODE_ENV === 'production',
        maxAge: tokenResponse.expires_in,
        path: '/',
      });
    }
    
    return response;
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    return NextResponse.redirect(`${new URL(request.url).origin}/error?message=${encodeURIComponent('Authentication failed')}`);
  }
}
