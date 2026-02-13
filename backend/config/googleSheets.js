const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Google Sheets Configuration
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

/**
 * Get Google Sheets client - supports both Service Account and OAuth2
 */
const getGoogleSheetsClient = () => {
  try {
    // Method 1: Try Service Account first (if key file exists)
    const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE;
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      const auth = new google.auth.GoogleAuth({
        keyFile: serviceAccountPath,
        scopes: SCOPES,
      });
      return google.sheets({ version: 'v4', auth });
    }

    // Method 2: Try OAuth2 credentials (if token exists)
    const oauthTokenPath = path.join(__dirname, 'sheets-token.json');
    const oauthCredPath = path.join(__dirname, 'oauth-credentials.json');
    
    if (fs.existsSync(oauthTokenPath) && fs.existsSync(oauthCredPath)) {
      const credentials = JSON.parse(fs.readFileSync(oauthCredPath));
      const token = JSON.parse(fs.readFileSync(oauthTokenPath));
      
      const { client_secret, client_id } = credentials.installed || credentials.web;
      
      // Use proper OOB redirect for desktop apps
      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        'urn:ietf:wg:oauth:2.0:oob'
      );
      
      oAuth2Client.setCredentials(token);
      return google.sheets({ version: 'v4', auth: oAuth2Client });
    }

    // No credentials found
    console.warn('⚠️  Google Sheets credentials not configured. Sync will be skipped.');
    return null;
    
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error.message);
    return null;
  }
};

module.exports = {
  getGoogleSheetsClient,
  SPREADSHEET_ID: process.env.GOOGLE_SHEETS_ID
};
