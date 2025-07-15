import { generatePost } from '../src/lib/gemini';
import { postToLinkedIn, scheduleLinkedInPost } from '../src/lib/linkedin';
import fs from 'fs';
import path from 'path';

// Configuration for posting schedule
interface PostSchedule {
  topic: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  hour: number;
  minute: number;
}

// Example posting schedule - customize this for your needs
const POST_SCHEDULE: PostSchedule[] = [
  { topic: 'AI and machine learning trends', dayOfWeek: 1, hour: 9, minute: 0 }, // Monday at 9:00 AM
  { topic: 'Remote work best practices', dayOfWeek: 3, hour: 10, minute: 30 }, // Wednesday at 10:30 AM
  { topic: 'Professional development tips', dayOfWeek: 5, hour: 14, minute: 0 }, // Friday at 2:00 PM
];

// Load token from a secure file
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

// Calculate the next occurrence of a scheduled post
const getNextOccurrence = (schedule: PostSchedule): Date => {
  const now = new Date();
  const result = new Date();
  
  // Set to the next occurrence of the day of week
  result.setDate(now.getDate() + (schedule.dayOfWeek + 7 - now.getDay()) % 7);
  result.setHours(schedule.hour, schedule.minute, 0, 0);
  
  // If the time is already past for today, move to next week
  if (result <= now) {
    result.setDate(result.getDate() + 7);
  }
  
  return result;
};

// Schedule all posts
const schedulePosts = async () => {
  try {
    // Load the access token
    const accessToken = loadAccessToken();
    if (!accessToken) {
      console.error('No valid LinkedIn access token found. Please authenticate first.');
      process.exit(1);
    }

    console.log('Scheduling LinkedIn posts...');
    
    // Process each scheduled post
    for (const schedule of POST_SCHEDULE) {
      // Calculate next posting time
      const nextPostTime = getNextOccurrence(schedule);
      
      // Generate content for the post
      console.log(`Generating post about "${schedule.topic}" for ${nextPostTime.toLocaleString()}`);
      const content = await generatePost(schedule.topic);
      
      // Schedule the post
      const result = await scheduleLinkedInPost(accessToken, content, nextPostTime.toISOString());
      
      if (result.success) {
        console.log(`Successfully scheduled post for ${nextPostTime.toLocaleString()}`);
      } else {
        console.error(`Failed to schedule post: ${result.error}`);
      }
      
      // Add a small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('All posts scheduled successfully!');
  } catch (error) {
    console.error('Error scheduling posts:', error);
  }
};

// Run the scheduler
schedulePosts();
