import { NextResponse } from 'next/server';
import { analyzeGeneratedPost } from '@/lib/gemini';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { post, originalStyle } = await request.json();
    
    if (!post || !originalStyle) {
      return NextResponse.json(
        { error: 'Post and original style are required' },
        { status: 400 }
      );
    }

    const feedback = await analyzeGeneratedPost(post, originalStyle);
    return NextResponse.json(feedback);
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze post' },
      { status: 500 }
    );
  }
}
