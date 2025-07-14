import { NextResponse } from 'next/server';
import { analyzeViralityScore } from '@/lib/gemini';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { post } = await request.json();
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      );
    }

    const viralityAnalysis = await analyzeViralityScore(post);
    return NextResponse.json(viralityAnalysis);
    
  } catch (error) {
    console.error('Virality analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze virality' },
      { status: 500 }
    );
  }
}
