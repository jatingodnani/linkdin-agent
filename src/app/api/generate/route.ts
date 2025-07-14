import { NextResponse } from 'next/server';
import { generatePost } from '@/lib/gemini';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { topic, style } = await request.json();
    
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const post = await generatePost(topic, style || {});
    return NextResponse.json({ post });
    
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate post' },
      { status: 500 }
    );
  }
}
