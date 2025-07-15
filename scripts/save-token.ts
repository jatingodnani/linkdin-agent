import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to save the token
const saveToken = (token: string, expiryHours: number = 24) => {
  try {
    // Calculate expiry time (default 24 hours from now)
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + expiryHours);
    
    // Create token data object
    const tokenData = {
      token,
      expiry: expiry.toISOString(),
      created: new Date().toISOString()
    };
    
    // Save to file
    const tokenPath = path.join(process.cwd(), 'linkedin-token.json');
    fs.writeFileSync(tokenPath, JSON.stringify(tokenData, null, 2));
    
    console.log(`Token saved successfully! Expires: ${expiry.toLocaleString()}`);
    console.log(`Token stored in: ${tokenPath}`);
    console.log('\nIMPORTANT: Keep this file secure and do not commit it to version control.');
    
    // Add to gitignore if not already there
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignore.includes('linkedin-token.json')) {
        fs.appendFileSync(gitignorePath, '\n# LinkedIn token (do not commit)\nlinkedin-token.json\n');
        console.log('Added linkedin-token.json to .gitignore');
      }
    }
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Ask for the token
rl.question('Enter your LinkedIn access token: ', (token) => {
  rl.question('Token expiry in hours (default: 24): ', (hours) => {
    const expiryHours = parseInt(hours) || 24;
    saveToken(token, expiryHours);
    rl.close();
  });
});
