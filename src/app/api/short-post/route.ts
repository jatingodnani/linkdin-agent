import { NextResponse } from 'next/server';
import { generateShortPost } from '@/lib/gemini';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { topic, style, maxLength = 280 } = await request.json();
    
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const shortPost = await generateShortPost(topic, style || {}, maxLength);
    return NextResponse.json({ post: shortPost });
    
  } catch (error) {
    console.error('Short post generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate short post' },
      { status: 500 }
    );
  }
}
