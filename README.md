# LinkedIn Ghostwriter with Gemini AI

A Next.js application that analyzes your writing style using Google's Gemini AI and generates LinkedIn posts that sound like you.

## Features

- **Style Analysis**: Analyzes your existing LinkedIn posts to understand your unique writing style
- **AI-Powered Generation**: Uses Google's Gemini AI to generate new posts that match your tone, vocabulary, and style
- **Customizable**: Fine-tune the generated content by providing specific topics and guidelines
- **Responsive Design**: Works on both desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key (get it from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to `.env.local` and add your Google Gemini API key:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and add your API key:
   ```
   GEMINI_API_KEY=your_google_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Paste some of your existing LinkedIn posts in the text area
2. Click "Analyze My Style" to analyze your writing style
3. Enter a topic for your new post and click "Generate Post"
4. Copy the generated post or regenerate if needed

## How It Works

1. **Style Analysis**: The application sends your content to Google's Gemini AI to analyze:
   - Tone (professional, casual, inspirational, etc.)
   - Writing style (narrative, direct, persuasive, etc.)
   - Common themes and topics
   - Sentence structure
   - Characteristic vocabulary

2. **Post Generation**: Using the analyzed style, the AI generates new content on your specified topic that matches your unique writing style.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type checking
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Google Gemini API](https://ai.google.dev/) - AI text generation
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI utilities

## Deployment

You can deploy this application to Vercel with zero configuration:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Flinkedin-ghostwriter&env=GEMINI_API_KEY&envDescription=Google%20Gemini%20API%20key%20from%20https%3A%2F%2Faistudio.google.com%2Fapp%2Fapikey&project-name=linkedin-ghostwriter&repository-name=linkedin-ghostwriter)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
