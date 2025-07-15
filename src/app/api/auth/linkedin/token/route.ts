import { NextResponse } from 'next/server';
import { getLinkedInAccessToken } from '@/lib/linkedin';
import { config } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }
    
    const tokenResponse = await getLinkedInAccessToken(
      code,
      config.linkedin.clientId,
      config.linkedin.clientSecret,
      config.linkedin.redirectUri
    );
    
    if ('error' in tokenResponse) {
      return NextResponse.json(
        { error: tokenResponse.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(tokenResponse);
  } catch (error) {
    console.error('LinkedIn token error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get access token' },
      { status: 500 }
    );
  }
}
