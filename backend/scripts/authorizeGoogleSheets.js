const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// OAuth2 Configuration
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = path.join(__dirname, '../config/sheets-token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../config/oauth-credentials.json');

/**
 * One-time authorization script for Google Sheets OAuth2
 * Run this to get access token
 */
async function authorize() {
  try {
    console.log('🔐 Google Sheets OAuth2 Authorization');
    console.log('=====================================\n');

    // Load client secrets
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.error('❌ Error: oauth-credentials.json not found!');
      console.error('\n📝 To create OAuth credentials:');
      console.error('1. Go to Google Cloud Console');
      console.error('2. Navigate to APIs & Services > Credentials');
      console.error('3. Click "Create Credentials" > "OAuth client ID"');
      console.error('4. Choose "Desktop app" as application type');
      console.error('5. Download the JSON file');
      console.error('6. Save it as: backend/config/oauth-credentials.json');
      console.error('\n');
      process.exit(1);
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    
    // Handle both Desktop app and Web app credentials
    let client_id, client_secret;
    
    if (credentials.installed) {
      // Desktop app credentials
      client_id = credentials.installed.client_id;
      client_secret = credentials.installed.client_secret;
    } else if (credentials.web) {
      // Web app credentials (fallback)
      client_id = credentials.web.client_id;
      client_secret = credentials.web.client_secret;
    } else {
      console.error('❌ Invalid credentials file format!');
      process.exit(1);
    }

    // Always use OOB for desktop apps
    const redirect_uri = 'urn:ietf:wg:oauth:2.0:oob';

    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uri
    );

    // Generate authorization URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      response_type: 'code',
      prompt: 'consent'
    });

    console.log('🔗 Authorize this app by visiting this URL:\n');
    console.log('========================================');
    console.log(authUrl);
    console.log('========================================\n');
    console.log('📝 Steps:');
    console.log('1. Copy the URL above');
    console.log('2. Open it in your browser');
    console.log('3. Sign in with dhobleharshwardhan@gmail.com');
    console.log('4. Click "Allow"');
    console.log('5. Copy the authorization code shown');
    console.log('6. Paste it below\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('📋 Enter the code from that page here: ', async (code) => {
      rl.close();
      
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        // Store the token
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log('\n✅ Token stored successfully!');
        console.log(`📁 Token saved to: ${TOKEN_PATH}`);
        console.log('\n🚀 You can now use Google Sheets sync!');
        
      } catch (error) {
        console.error('❌ Error retrieving access token:', error.message);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Authorization failed:', error.message);
    process.exit(1);
  }
}

// Run authorization
authorize();
