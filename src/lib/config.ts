// Configuration for the LinkedIn Ghostwriter application
export const config = {
  gemini: {
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
    model: 'gemini-1.5-flash'
  },
  app: {
    name: 'LinkedIn Ghostwriter',
    description: 'Create authentic LinkedIn posts that sound just like you',
    maxContentLength: 10000,
    maxPostLength: 3000,
    defaultVariations: 3
  },
  generation: {
    temperature: 0.7,
    topP: 0.95,
    maxTokens: 1000,
  }
} as const;

// Validate API key
if (!config.gemini.apiKey) {
  console.warn('GEMINI_API_KEY is not set. Please set it in your environment variables.');
}
