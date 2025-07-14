import { NextResponse } from 'next/server';
import { getRewriteSuggestions } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { post } = await request.json();
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      );
    }

    const suggestions = await getRewriteSuggestions(post);
    return NextResponse.json(suggestions);
    
  } catch (error) {
    console.error('Suggestions error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get rewrite suggestions' },
      { status: 500 }
    );
  }
}
