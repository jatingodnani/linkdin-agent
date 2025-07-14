import { NextResponse } from 'next/server';
import { generatePostVariations } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { topic, style, variations = 3 } = await request.json();
    
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const posts = await generatePostVariations(topic, style || {}, variations);
    return NextResponse.json({ posts });
    
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate post variations' },
      { status: 500 }
    );
  }
}
