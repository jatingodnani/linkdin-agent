import { NextResponse } from 'next/server';
import { scheduleLinkedInPost } from '@/lib/linkedin';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { content, accessToken, scheduledTime } = await request.json();
    
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

    if (!scheduledTime) {
      return NextResponse.json(
        { error: 'Scheduled time is required' },
        { status: 400 }
      );
    }

    const result = await scheduleLinkedInPost(
      accessToken, 
      content, 
      scheduledTime
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('LinkedIn scheduling error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to schedule LinkedIn post' },
      { status: 500 }
    );
  }
}
