import { NextResponse } from 'next/server';
import { analyzeWritingStyle } from '@/lib/gemini';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeWritingStyle(content);
    return NextResponse.json(analysis);
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze content' },
      { status: 500 }
    );
  }
}
