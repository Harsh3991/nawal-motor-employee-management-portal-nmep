const { getGoogleSheetsClient, SPREADSHEET_ID } = require('../config/googleSheets');

/**
 * One-time script to initialize Google Sheets with headers
 * Run this after setting up OAuth2 credentials or service account
 */

async function initializeSheets() {
  try {
    console.log('🔄 Initializing Google Sheets...');
    
    if (!SPREADSHEET_ID) {
      console.error('❌ Error: GOOGLE_SHEETS_ID not set in .env file!');
      console.error('Please add: GOOGLE_SHEETS_ID=your_spreadsheet_id');
      process.exit(1);
    }
    
    const sheets = getGoogleSheetsClient();
    
    if (!sheets) {
      console.error('❌ Error: Could not initialize Google Sheets client!');
      console.error('\n📝 Make sure you have either:');
      console.error('1. Service Account: google-service-account.json in backend/config/');
      console.error('2. OAuth2: Run "node scripts/authorizeGoogleSheets.js" first');
      process.exit(1);
    }

    // 1. Employees Sheet Headers
    console.log('📝 Setting up Employees sheet...');
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Employees!A1:L1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          'Employee ID', 'First Name', 'Middle Name', 'Last Name', 'Email',
          'Phone', 'Department', 'Designation', 'Date of Joining',
          'Basic Salary', 'Status', 'Last Updated'
        ]]
      }
    });

    // Format Employees sheet header
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [{
          repeatCell: {
            range: {
              sheetId: 0, // First sheet
              startRowIndex: 0,
              endRowIndex: 1
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.5, blue: 0.8 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)'
          }
        }]
      }
    });

    // 2. Salaries Sheet Headers
    console.log('💰 Setting up Salaries sheet...');
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Salaries!A1:P1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          'Employee ID', 'Name', 'Month/Year', 'Basic Salary', 'HRA',
          'Other Allowances', 'Incentives', 'Gross Salary', 'PF', 'ESI',
          'Advances', 'Deductions', 'Total Deductions', 'Net Salary',
          'Payment Status', 'Generated Date'
        ]]
      }
    });

    // Format Salaries sheet header
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [{
          repeatCell: {
            range: {
              sheetId: 1, // Second sheet
              startRowIndex: 0,
              endRowIndex: 1
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.7, blue: 0.3 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)'
          }
        }]
      }
    });

    // 3. Attendance Sheet Headers
    console.log('📅 Setting up Attendance sheet...');
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Attendance!A1:J1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          'Employee ID', 'Name', 'Date', 'Status', 'Check In',
          'Check Out', 'Working Hours', 'Night Duty', 'Remarks', 'Marked Date'
        ]]
      }
    });

    // Format Attendance sheet header
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [{
          repeatCell: {
            range: {
              sheetId: 2, // Third sheet
              startRowIndex: 0,
              endRowIndex: 1
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.9, green: 0.5, blue: 0.2 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)'
          }
        }]
      }
    });

    console.log('✅ Google Sheets initialized successfully!');
    console.log(`🔗 View your spreadsheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
    
  } catch (error) {
    console.error('❌ Error initializing sheets:', error.message);
    if (error.message.includes('ENOENT')) {
      console.error('\n⚠️  Service account key file not found!');
      console.error('Please ensure google-service-account.json exists in backend/config/');
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  initializeSheets()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { initializeSheets };
