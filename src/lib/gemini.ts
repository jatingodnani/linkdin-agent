import { z } from 'zod';

import { generateObject, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { config } from './config';

// Initialize the Google Generative AI client
const apiKey = config.gemini.apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is required');
}

const google = createGoogleGenerativeAI({
    apiKey: apiKey
});

const model = google(config.gemini.model);
const styleAnalysisSchema = z.object({
  tone: z.string().describe("The tone of the writing (e.g., professional, casual, inspirational, authoritative)"),
  writing_style: z.string().describe("The writing style (e.g., narrative, direct, persuasive, informative)"),
  common_themes: z.array(z.string()).describe("List of common themes or topics in the writing"),
  sentence_structure: z.string().describe("The complexity of sentence structure (e.g., complex, simple, mixed)"),
  vocabulary: z.array(z.string()).describe("Characteristic words or phrases used in the writing"),
  emoji_usage: z.string().describe("How emojis are used (e.g., frequently, sparingly, never, specific contexts)"),
  post_length: z.string().describe("Typical post length preference (e.g., short and punchy, medium-length, long-form)"),
  engagement_style: z.string().describe("How the author engages with audience (e.g., questions, calls-to-action, storytelling)"),
  hashtag_usage: z.string().describe("How hashtags are used (e.g., many, few, industry-specific, trending)"),
  personal_touch: z.string().describe("Level of personal sharing (e.g., highly personal, professional experiences, industry insights)")
});

type styleAnalysisSchema = z.infer<typeof styleAnalysisSchema>;
/**
 * Analyzes the writing style of the provided content
 * @param content The content to analyze
 * @returns A promise that resolves to a StyleAnalysis object
 */
export const analyzeWritingStyle = async (content: string) => {
  const { object } = await generateObject({
    model: model,
    system: `You are an expert LinkedIn content analyst. Analyze the writing style from the provided LinkedIn posts or content. Focus on:
    1. Professional tone and voice
    2. LinkedIn-specific writing patterns
    3. Engagement techniques used
    4. How the author builds their personal brand
    5. Content structure and formatting preferences
    
    Be specific and actionable in your analysis.`,
    prompt: `
    Analyze the following LinkedIn content for writing style:
    
    <content>
    ${content}
    </content>
    
    Provide a comprehensive analysis that captures:
    - The unique voice and tone
    - Common themes and topics they discuss
    - How they structure their posts
    - Their engagement approach
    - Use of emojis, hashtags, and formatting
    - Personal vs professional balance
    `,
    schema: styleAnalysisSchema,
  });

  return object;
};

/**
 * Generates a LinkedIn post based on the given topic and style
 * @param topic The topic for the post
 * @param style Optional style parameters to guide generation
 * @returns A promise that resolves to the generated post content
 */
export const generatePost = async (topic: string, style: Partial<styleAnalysisSchema> = {}): Promise<string> => {
  const { text } = await generateText({
    model: model,
    system: `You are a professional LinkedIn ghostwriter. Generate authentic LinkedIn posts that match the user's unique writing style and voice. The post should:
    
    1. Sound natural and authentic to the user's voice
    2. Follow LinkedIn best practices for engagement
    3. Be appropriate for professional networking
    4. Include relevant hashtags if that matches their style
    5. Have a clear call-to-action or engagement hook
    6. Be the appropriate length for the platform
    
    Write in the first person as if you are the user.`,
    prompt: `
    Generate a LinkedIn post about: "${topic}"
    
    Match this writing style:
    - Tone: ${style.tone || 'professional but approachable'}
    - Writing Style: ${style.writing_style || 'informative and engaging'}
    - Common Themes: ${style.common_themes?.join(', ') || 'industry insights, personal growth'}
    - Sentence Structure: ${style.sentence_structure || 'mixed complexity'}
    - Vocabulary: ${style.vocabulary?.join(', ') || 'professional terminology'}
    - Emoji Usage: ${style.emoji_usage || 'minimal and professional'}
    - Post Length: ${style.post_length || 'medium-length'}
    - Engagement Style: ${style.engagement_style || 'questions and insights'}
    - Hashtag Usage: ${style.hashtag_usage || 'relevant industry hashtags'}
    - Personal Touch: ${style.personal_touch || 'professional experiences with personal insights'}
    
    Create a post that feels authentic to this style while being engaging and valuable to a LinkedIn audience.
    `,
  });

  return text;
};

/**
 * Preprocesses content by splitting multiple posts and cleaning text
 * @param content Raw content input
 * @returns Cleaned and processed content
 */
export const preprocessContent = (content: string): string => {
  // Split by common post separators and clean
  const posts = content
    .split(/\n\n---\n\n|\n\n\*\*\*\n\n|\n\n===\n\n/)
    .map(post => post.trim())
    .filter(post => post.length > 50); // Filter out very short snippets
  
  return posts.join('\n\n[POST_SEPARATOR]\n\n');
};

/**
 * Generates multiple variations of a post
 * @param topic The topic for the post
 * @param style Style parameters
 * @param variations Number of variations to generate
 * @returns Array of generated post variations
 */
export const generatePostVariations = async (
  topic: string, 
  style: Partial<styleAnalysisSchema> = {}, 
  variations: number = 3
): Promise<string[]> => {
  const promises = Array.from({ length: variations }, (_, i) => {
    const variationPrompt = i === 0 ? '' : ` (Variation ${i + 1} - try a different angle or approach)`;
    
    return generateText({
      model: model,
      system: `You are a professional LinkedIn ghostwriter. Generate authentic LinkedIn posts that match the user's unique writing style and voice. Each variation should have a different angle or approach while maintaining the same voice.`,
      prompt: `
      Generate a LinkedIn post about: "${topic}"${variationPrompt}
      
      Match this writing style:
      - Tone: ${style.tone || 'professional but approachable'}
      - Writing Style: ${style.writing_style || 'informative and engaging'}
      - Common Themes: ${style.common_themes?.join(', ') || 'industry insights, personal growth'}
      - Sentence Structure: ${style.sentence_structure || 'mixed complexity'}
      - Vocabulary: ${style.vocabulary?.join(', ') || 'professional terminology'}
      - Emoji Usage: ${style.emoji_usage || 'minimal and professional'}
      - Post Length: ${style.post_length || 'medium-length'}
      - Engagement Style: ${style.engagement_style || 'questions and insights'}
      - Hashtag Usage: ${style.hashtag_usage || 'relevant industry hashtags'}
      - Personal Touch: ${style.personal_touch || 'professional experiences with personal insights'}
      
      Create a unique and engaging post that feels authentic to this style.
      `,
    });
  });

  const results = await Promise.all(promises);
  return results.map(result => result.text);
};

/**
 * Provides feedback on a generated post
 * @param post The generated post
 * @param originalStyle The analyzed style
 * @returns Feedback and suggestions
 */
export const analyzeGeneratedPost = async (
  post: string, 
  originalStyle: styleAnalysisSchema
): Promise<{ score: number; feedback: string; suggestions: string[] }> => {
  const { object } = await generateObject({
    model: model,
    system: "You are a LinkedIn content expert. Analyze how well a generated post matches the target writing style.",
    prompt: `
    Analyze this generated LinkedIn post and compare it to the target style:
    
    <generated_post>
    ${post}
    </generated_post>
    
    <target_style>
    ${JSON.stringify(originalStyle, null, 2)}
    </target_style>
    
    Provide a score (1-10) and specific feedback on how well it matches the style.
    `,
    schema: z.object({
      score: z.number().min(1).max(10).describe("How well the post matches the target style (1-10)"),
      feedback: z.string().describe("Detailed feedback on style matching"),
      suggestions: z.array(z.string()).describe("Specific suggestions for improvement")
    })
  });

  return object;
};

/**
 * Analyzes the virality potential of a LinkedIn post
 * @param post The post content to analyze
 * @returns Virality score and analysis
 */
export const analyzeViralityScore = async (post: string): Promise<{
  score: number;
  factors: {
    emotional_appeal: number;
    engagement_hooks: number;
    shareability: number;
    trending_relevance: number;
    call_to_action: number;
  };
  recommendations: string[];
  predicted_engagement: string;
}> => {
  const { object } = await generateObject({
    model: model,
    system: `You are a LinkedIn viral content expert. Analyze posts for their potential to go viral on LinkedIn. Consider:
    1. Emotional resonance and storytelling
    2. Engagement hooks (questions, controversies, insights)
    3. Shareability and discussion potential
    4. Trending topics and relevance
    5. Clear call-to-action
    6. LinkedIn algorithm preferences
    
    Score each factor 1-10 and provide actionable recommendations.`,
    prompt: `
    Analyze this LinkedIn post for virality potential:
    
    <post>
    ${post}
    </post>
    
    Provide detailed analysis with specific improvement recommendations.
    `,
    schema: z.object({
      score: z.number().min(1).max(10).describe("Overall virality score (1-10)"),
      factors: z.object({
        emotional_appeal: z.number().min(1).max(10).describe("Emotional impact and storytelling (1-10)"),
        engagement_hooks: z.number().min(1).max(10).describe("Questions, hooks, and engagement triggers (1-10)"),
        shareability: z.number().min(1).max(10).describe("How likely people are to share this (1-10)"),
        trending_relevance: z.number().min(1).max(10).describe("Relevance to current trends (1-10)"),
        call_to_action: z.number().min(1).max(10).describe("Strength of call-to-action (1-10)")
      }),
      recommendations: z.array(z.string()).describe("Specific recommendations to increase virality"),
      predicted_engagement: z.string().describe("Predicted engagement level (low/medium/high/viral)")
    })
  });

  return object;
};

/**
 * Rewrites a post to make it more emotional and engaging
 * @param post The original post
 * @param emotionalStyle The type of emotion to emphasize
 * @param originalStyle The user's writing style to maintain
 * @returns Rewritten emotional post
 */
export const rewritePostEmotional = async (
  post: string, 
  emotionalStyle: 'inspirational' | 'vulnerable' | 'passionate' | 'relatable' | 'motivational' | 'controversial',
  originalStyle: Partial<styleAnalysisSchema> = {}
): Promise<string> => {
  const { text } = await generateText({
    model: model,
    system: `You are a LinkedIn content strategist specializing in emotional storytelling. Rewrite posts to be more emotionally engaging while maintaining the user's authentic voice.
    
    Focus on:
    1. Adding emotional depth and personal connection
    2. Using storytelling techniques
    3. Creating vulnerability and relatability
    4. Maintaining professional authenticity
    5. Keeping the core message intact`,
    prompt: `
    Rewrite this LinkedIn post to be more ${emotionalStyle} and emotionally engaging:
    
    <original_post>
    ${post}
    </original_post>
    
    Maintain this writing style:
    - Tone: ${originalStyle.tone || 'professional but approachable'}
    - Personal Touch: ${originalStyle.personal_touch || 'professional experiences with personal insights'}
    - Engagement Style: ${originalStyle.engagement_style || 'questions and insights'}
    
    Make it more ${emotionalStyle} by:
    ${emotionalStyle === 'inspirational' ? '- Adding uplifting messages and hope\n- Using motivational language\n- Including success stories' : ''}
    ${emotionalStyle === 'vulnerable' ? '- Sharing personal struggles or challenges\n- Being more open about failures\n- Creating authentic human connection' : ''}
    ${emotionalStyle === 'passionate' ? '- Using stronger, more energetic language\n- Expressing deep conviction\n- Adding urgency and importance' : ''}
    ${emotionalStyle === 'relatable' ? '- Adding common experiences everyone faces\n- Using everyday language\n- Creating "me too" moments' : ''}
    ${emotionalStyle === 'motivational' ? '- Adding calls to action\n- Using empowering language\n- Creating momentum and energy' : ''}
    ${emotionalStyle === 'controversial' ? '- Presenting a contrarian viewpoint\n- Challenging common assumptions\n- Sparking debate (professionally)' : ''}
    
    Keep the post authentic and professional while making it more emotionally compelling.
    `,
    maxTokens: 300, // Reduced for shorter posts
  });

  return text;
};

/**
 * Generates a short, punchy LinkedIn post (optimized for lower token usage)
 * @param topic The topic for the post
 * @param style Style parameters
 * @param maxLength Maximum character count
 * @returns Short, engaging post
 */
export const generateShortPost = async (
  topic: string, 
  style: Partial<styleAnalysisSchema> = {},
  maxLength: number = 280
): Promise<string> => {
  const { text } = await generateText({
    model: model,
    system: `You are a LinkedIn content creator specializing in short, punchy posts. Create concise, engaging content that:
    
    1. Gets to the point quickly
    2. Has high impact with few words
    3. Includes one strong hook or insight
    4. Maintains professional authenticity
    5. Encourages engagement
    
    Keep posts under ${maxLength} characters. Focus on quality over quantity.`,
    prompt: `
    Create a short, punchy LinkedIn post about: "${topic}"
    
    Style preferences:
    - Tone: ${style.tone || 'professional but approachable'}
    - Engagement: ${style.engagement_style || 'questions and insights'}
    - Emoji Usage: ${style.emoji_usage || 'minimal and professional'}
    
    Requirements:
    - Maximum ${maxLength} characters
    - One key insight or hook
    - Professional yet engaging
    - Clear call-to-action or question
    
    Make every word count!
    `,
    maxTokens: 100, // Very low token count for short posts
  });

  return text;
};

/**
 * Provides comprehensive post optimization suggestions
 * @param post The post to optimize
 * @param targetAudience The target audience
 * @returns Optimization suggestions
 */
export const getPostOptimizationSuggestions = async (
  post: string,
  targetAudience: string = 'LinkedIn professionals'
): Promise<{
  length_optimization: string;
  engagement_optimization: string;
  virality_tips: string[];
  hashtag_suggestions: string[];
  timing_recommendation: string;
}> => {
  const { object } = await generateObject({
    model: model,
    system: `You are a LinkedIn optimization expert. Provide specific, actionable suggestions to improve post performance.`,
    prompt: `
    Optimize this LinkedIn post for ${targetAudience}:
    
    <post>
    ${post}
    </post>
    
    Provide specific optimization suggestions for maximum engagement and reach.
    `,
    schema: z.object({
      length_optimization: z.string().describe("Suggestions for optimal post length"),
      engagement_optimization: z.string().describe("Ways to increase likes, comments, and shares"),
      virality_tips: z.array(z.string()).describe("Specific tips to increase viral potential"),
      hashtag_suggestions: z.array(z.string()).describe("Recommended hashtags for this post"),
      timing_recommendation: z.string().describe("Best time to post for maximum engagement")
    })
  });

  return object;
};

/**
 * Rewrites a post based on user's custom instructions
 * @param post The original post
 * @param rewriteInstructions Custom instructions from user (e.g., "make it more emotional", "add humor", "be more controversial")
 * @param originalStyle The user's writing style to maintain
 * @returns Rewritten post based on custom instructions
 */
export const rewritePostDynamic = async (
  post: string, 
  rewriteInstructions: string,
  originalStyle: Partial<styleAnalysisSchema> = {}
): Promise<string> => {
  const { text } = await generateText({
    model: model,
    system: `You are a LinkedIn content strategist who helps users rewrite their posts based on specific instructions. You excel at:
    
    1. Understanding user's rewriting intentions
    2. Maintaining their authentic voice and style
    3. Keeping the core message intact
    4. Making appropriate changes based on instructions
    5. Ensuring professional appropriateness for LinkedIn
    
    Always preserve the user's original style while implementing their requested changes.`,
    prompt: `
    Rewrite this LinkedIn post based on the user's specific instructions:
    
    <original_post>
    ${post}
    </original_post>
    
    <rewrite_instructions>
    ${rewriteInstructions}
    </rewrite_instructions>
    
    Maintain this writing style:
    - Tone: ${originalStyle.tone || 'professional but approachable'}
    - Writing Style: ${originalStyle.writing_style || 'informative and engaging'}
    - Personal Touch: ${originalStyle.personal_touch || 'professional experiences with personal insights'}
    - Engagement Style: ${originalStyle.engagement_style || 'questions and insights'}
    - Emoji Usage: ${originalStyle.emoji_usage || 'minimal and professional'}
    - Hashtag Usage: ${originalStyle.hashtag_usage || 'relevant industry hashtags'}
    
    Instructions for rewriting: "${rewriteInstructions}"
    
    Keep the post authentic, professional, and true to the user's voice while implementing their requested changes.
    `
  });

  return text;
};

/**
 * Provides dynamic rewrite suggestions based on the post content
 * @param post The original post to analyze
 * @returns Array of suggested rewrite options
 */
export const getRewriteSuggestions = async (post: string): Promise<{
  quick_options: string[];
  custom_suggestions: string[];
  tone_adjustments: string[];
  engagement_boosters: string[];
}> => {
  const { object } = await generateObject({
    model: model,
    system: `You are a LinkedIn content optimization expert. Analyze posts and suggest specific, actionable rewrite options that users can choose from.
    
    Provide diverse suggestions that cover:
    1. Emotional adjustments (more inspiring, vulnerable, etc.)
    2. Tone changes (more casual, authoritative, etc.)
    3. Engagement improvements (add questions, stories, etc.)
    4. Content structure changes (shorter, punchier, more detailed)`,
    prompt: `
    Analyze this LinkedIn post and suggest specific rewrite options:
    
    <post>
    ${post}
    </post>
    
    Provide specific, actionable rewrite suggestions that users can select from.
    `,
    schema: z.object({
      quick_options: z.array(z.string()).describe("Quick one-click rewrite options (e.g., 'Make it more emotional', 'Add humor', 'Make it shorter')"),
      custom_suggestions: z.array(z.string()).describe("Specific custom suggestions based on the post content"),
      tone_adjustments: z.array(z.string()).describe("Tone adjustment options (e.g., 'More casual', 'More authoritative')"),
      engagement_boosters: z.array(z.string()).describe("Ways to increase engagement (e.g., 'Add a question', 'Include a story')")
    })
  });

  return object;
};



