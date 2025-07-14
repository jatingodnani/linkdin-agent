import { NextResponse } from 'next/server';
import { getPostOptimizationSuggestions } from '@/lib/gemini';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { post, targetAudience } = await request.json();
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      );
    }

    const optimization = await getPostOptimizationSuggestions(post, targetAudience);
    return NextResponse.json(optimization);
    
  } catch (error) {
    console.error('Optimization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get optimization suggestions' },
      { status: 500 }
    );
  }
}
