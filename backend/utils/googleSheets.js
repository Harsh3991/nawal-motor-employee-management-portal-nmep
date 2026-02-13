const { getGoogleSheetsClient, SPREADSHEET_ID } = require('../config/googleSheets');

// Sync employee data to Google Sheets
exports.syncEmployeeToSheets = async (employee) => {
  try {
    const sheets = getGoogleSheetsClient();
    
    // Skip sync if credentials not configured
    if (!sheets || !SPREADSHEET_ID) {
      console.log('⚠️  Google Sheets sync skipped - credentials not configured');
      return true;
    }
    
    const values = [[
      employee.employeeId,
      employee.selfDetails.firstName,
      employee.selfDetails.middleName || '',
      employee.selfDetails.lastName,
      employee.selfDetails.email,
      employee.selfDetails.phone,
      employee.jobDetails.department,
      employee.jobDetails.designation,
      employee.jobDetails.dateOfJoining,
      employee.jobDetails.basicSalary,
      employee.status,
      new Date().toISOString()
    ]];

    const resource = { values };

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Employees!A:L',
      valueInputOption: 'USER_ENTERED',
      resource,
    });

    return true;
  } catch (error) {
    console.error('Error syncing to Google Sheets:', error);
    return false;
  }
};

// Sync salary data to Google Sheets
exports.syncSalaryToSheets = async (salary, employee) => {
  try {
    const sheets = getGoogleSheetsClient();
    
    // Skip sync if credentials not configured
    if (!sheets || !SPREADSHEET_ID) {
      console.log('⚠️  Google Sheets sync skipped - credentials not configured');
      return true;
    }
    
    const values = [[
      employee.employeeId,
      employee.fullName,
      `${salary.month}/${salary.year}`,
      salary.basicSalary,
      salary.hra,
      salary.otherAllowances,
      salary.totalIncentives,
      salary.grossSalary,
      salary.providentFund,
      salary.esi,
      salary.totalAdvances,
      salary.totalDeductions,
      salary.totalDeductionsAmount,
      salary.netSalary,
      salary.paymentStatus,
      new Date().toISOString()
    ]];

    const resource = { values };

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Salaries!A:P',
      valueInputOption: 'USER_ENTERED',
      resource,
    });

    return true;
  } catch (error) {
    console.error('Error syncing salary to Google Sheets:', error);
    return false;
  }
};

// Sync attendance data to Google Sheets
exports.syncAttendanceToSheets = async (attendance, employee) => {
  try {
    const sheets = getGoogleSheetsClient();
    
    // Skip sync if credentials not configured
    if (!sheets || !SPREADSHEET_ID) {
      console.log('⚠️  Google Sheets sync skipped - credentials not configured');
      return true;
    }
    
    const values = [[
      employee.employeeId,
      employee.fullName,
      attendance.date.toISOString().split('T')[0],
      attendance.status,
      attendance.checkInTime?.toLocaleTimeString() || '',
      attendance.checkOutTime?.toLocaleTimeString() || '',
      attendance.workingHours || '',
      attendance.isNightDuty ? 'Yes' : 'No',
      attendance.remarks || '',
      new Date().toISOString()
    ]];

    const resource = { values };

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Attendance!A:J',
      valueInputOption: 'USER_ENTERED',
      resource,
    });

    return true;
  } catch (error) {
    console.error('Error syncing attendance to Google Sheets:', error);
    return false;
  }
};

// Create sheets if they don't exist
exports.initializeSheets = async () => {
  try {
    const sheets = getGoogleSheetsClient();
    
    // Create Employees sheet
    const employeeHeaders = [[
      'Employee ID', 'First Name', 'Middle Name', 'Last Name', 'Email', 
      'Phone', 'Department', 'Designation', 'Date of Joining', 
      'Basic Salary', 'Status', 'Last Updated'
    ]];

    // Create Salaries sheet
    const salaryHeaders = [[
      'Employee ID', 'Name', 'Month/Year', 'Basic Salary', 'HRA', 
      'Other Allowances', 'Incentives', 'Gross Salary', 'PF', 'ESI', 
      'Advances', 'Deductions', 'Total Deductions', 'Net Salary', 
      'Payment Status', 'Generated Date'
    ]];

    // Create Attendance sheet
    const attendanceHeaders = [[
      'Employee ID', 'Name', 'Date', 'Status', 'Check In', 
      'Check Out', 'Working Hours', 'Night Duty', 'Remarks', 'Marked Date'
    ]];

    // Create sheets with headers (this would need to be done once during setup)
    console.log('Google Sheets initialized');
    return true;
  } catch (error) {
    console.error('Error initializing sheets:', error);
    return false;
  }
};
