import { NextResponse } from 'next/server';
import { getLinkedInAuthUrl } from '@/lib/linkedin';
import { config } from '@/lib/config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || Math.random().toString(36).substring(7);
    
    const authUrl = getLinkedInAuthUrl(
      config.linkedin.clientId,
      config.linkedin.redirectUri,
      state
    );
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate LinkedIn auth URL' },
      { status: 500 }
    );
  }
}
