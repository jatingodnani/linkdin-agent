import { NextResponse } from 'next/server';
import { rewritePostDynamic } from '@/lib/gemini';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { post, instructions, originalStyle } = await request.json();
    
    if (!post || !instructions) {
      return NextResponse.json(
        { error: 'Post and rewrite instructions are required' },
        { status: 400 }
      );
    }

    const rewrittenPost = await rewritePostDynamic(post, instructions, originalStyle || {});
    return NextResponse.json({ rewrittenPost });
    
  } catch (error) {
    console.error('Rewrite error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to rewrite post' },
      { status: 500 }
    );
  }
}
