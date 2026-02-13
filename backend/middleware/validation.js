const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Employee validation rules
exports.employeeValidation = [
  body('selfDetails.firstName').trim().notEmpty().withMessage('First name is required'),
  body('selfDetails.lastName').trim().notEmpty().withMessage('Last name is required'),
  body('selfDetails.email').isEmail().withMessage('Valid email is required'),
  body('selfDetails.phone')
    .customSanitizer(value => {
      // Remove all non-digits
      if (typeof value === 'string') {
        const digits = value.replace(/\D/g, '');
        // Remove country code if present
        if (digits.length === 12 && digits.startsWith('91')) {
          return digits.slice(2);
        }
        return digits.slice(-10); // Take last 10 digits
      }
      return value;
    })
    .matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit phone number is required'),
  body('jobDetails.department').isIn(['Mechanical', 'Bodyshop', 'Insurance', 'Sales']).withMessage('Invalid department'),
  body('jobDetails.designation').notEmpty().withMessage('Designation is required'),
  body('jobDetails.dateOfJoining').isISO8601().withMessage('Valid date of joining is required'),
  body('jobDetails.salaryType').isIn(['Monthly', 'Daily']).withMessage('Salary type must be Monthly or Daily'),
  body('jobDetails.basicSalary').isFloat({ min: 0 }).withMessage('Basic salary must be a positive number')
];

// User validation rules
exports.userValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').isIn(['admin', 'hr', 'employee']).withMessage('Invalid role'),
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required')
];

// Attendance validation rules
exports.attendanceValidation = [
  body('employee').notEmpty().withMessage('Employee ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('status').isIn(['Present', 'Absent', 'Half Day', 'Leave', 'Holiday']).withMessage('Invalid status')
];

// Salary validation rules
exports.salaryValidation = [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2020 }).withMessage('Invalid year')
];

// Increment validation rules
exports.incrementValidation = [
  body('employee').notEmpty().withMessage('Employee ID is required'),
  body('effectiveDate').isISO8601().withMessage('Valid effective date is required'),
  body('newSalary').isFloat({ min: 0 }).withMessage('New salary must be positive'),
  body('reason').isIn(['Performance', 'Promotion', 'Annual', 'Special', 'Market Adjustment']).withMessage('Invalid reason')
];

// Incentive validation rules
exports.incentiveValidation = [
  body('employee').notEmpty().withMessage('Employee ID is required'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2020 }).withMessage('Invalid year'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('type').notEmpty().withMessage('Type is required'),
  body('description').notEmpty().withMessage('Description is required')
];

// Deduction validation rules
exports.deductionValidation = [
  body('employee').notEmpty().withMessage('Employee ID is required'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2020 }).withMessage('Invalid year'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('type').notEmpty().withMessage('Type is required'),
  body('reason').notEmpty().withMessage('Reason is required')
];

// Advance validation rules
exports.advanceValidation = [
  body('employee').notEmpty().withMessage('Employee ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('reason').notEmpty().withMessage('Reason is required')
];

// Login validation rules
exports.loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// OTP validation rules
exports.otpValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];
