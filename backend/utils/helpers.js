const crypto = require('crypto');

// Generate random employee ID
exports.generateEmployeeId = () => {
  const prefix = 'NM';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Generate OTP
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate random password
exports.generateRandomPassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Format date to DD/MM/YYYY
exports.formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Format currency
exports.formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Calculate working days in a month
exports.getWorkingDaysInMonth = (month, year) => {
  const date = new Date(year, month - 1, 1);
  let workingDays = 0;
  
  while (date.getMonth() === month - 1) {
    const day = date.getDay();
    if (day !== 0) { // Exclude Sundays (0 = Sunday)
      workingDays++;
    }
    date.setDate(date.getDate() + 1);
  }
  
  return workingDays;
};

// Calculate salary for daily wage employees
exports.calculateDailySalary = (dailyRate, presentDays, halfDays = 0) => {
  return (dailyRate * presentDays) + (dailyRate * 0.5 * halfDays);
};

// Pagination helper
exports.getPaginationParams = (page = 1, limit = 10) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  
  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

// Create pagination response
exports.createPaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
