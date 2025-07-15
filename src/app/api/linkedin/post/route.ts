import { NextResponse } from 'next/server';
import { postToLinkedIn } from '@/lib/linkedin';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { content, accessToken, mediaCategory, mediaUrls } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'LinkedIn access token is required' },
        { status: 400 }
      );
    }

    const result = await postToLinkedIn(
      accessToken, 
      content, 
      mediaCategory || 'NONE', 
      mediaUrls || []
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('LinkedIn posting error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to post to LinkedIn' },
      { status: 500 }
    );
  }
}
