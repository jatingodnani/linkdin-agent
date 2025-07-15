import { generatePost } from '../src/lib/gemini';
import { postToLinkedIn } from '../src/lib/linkedin';
import fs from 'fs';
import path from 'path';

// Topics to generate posts about
const TOPICS = [
  'AI and machine learning trends',
  'Remote work best practices',
  'Professional development tips',
  'Industry insights for tech professionals',
  'Leadership in the digital age'
];

// Load token from a secure file (in production, use a more secure storage method)
const loadAccessToken = (): string | null => {
  try {
    const tokenPath = path.join(process.cwd(), 'linkedin-token.json');
    if (fs.existsSync(tokenPath)) {
      const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
      
      // Check if token is expired
      if (tokenData.expiry && new Date(tokenData.expiry) > new Date()) {
        return tokenData.token;
      }
    }
    return null;
  } catch (error) {
    console.error('Error loading token:', error);
    return null;
  }
};

// Main function to generate and post content
const autoPost = async () => {
  try {
    // Load the access token
    const accessToken = loadAccessToken();
    if (!accessToken) {
      console.error('No valid LinkedIn access token found. Please authenticate first.');
      process.exit(1);
    }

    // Select a random topic
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    console.log(`Generating post about: ${topic}`);

    // Generate the post content
    const content = await generatePost(topic);
    console.log('Generated content:', content);

    // Post to LinkedIn
    const result = await postToLinkedIn(accessToken, content);
    
    if (result.success) {
      console.log('Successfully posted to LinkedIn!', result.data);
    } else {
      console.error('Failed to post to LinkedIn:', result.error);
    }
  } catch (error) {
    console.error('Auto-post error:', error);
  }
};

// Run the auto-post function
autoPost();
