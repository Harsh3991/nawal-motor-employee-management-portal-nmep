const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// OAuth2 Configuration
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = path.join(__dirname, 'sheets-token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'oauth-credentials.json');

/**
 * Get OAuth2 client using stored credentials
 */
async function getOAuth2Client() {
  try {
    // Load client secrets
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token
    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
      oAuth2Client.setCredentials(token);
    } else {
      throw new Error('No token found. Please run: node scripts/authorizeGoogleSheets.js');
    }

    return oAuth2Client;
  } catch (error) {
    console.error('Error loading OAuth credentials:', error.message);
    throw error;
  }
}

/**
 * Get Google Sheets client with OAuth2
 */
async function getGoogleSheetsClientOAuth() {
  const auth = await getOAuth2Client();
  return google.sheets({ version: 'v4', auth });
}

module.exports = {
  getOAuth2Client,
  getGoogleSheetsClientOAuth,
  SPREADSHEET_ID: process.env.GOOGLE_SHEETS_ID
};
