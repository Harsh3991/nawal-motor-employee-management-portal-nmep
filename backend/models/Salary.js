const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  
  // Earnings
  basicSalary: {
    type: Number,
    required: true
  },
  hra: {
    type: Number,
    default: 0
  },
  otherAllowances: {
    type: Number,
    default: 0
  },
  overtime: {
    hours: Number,
    amount: Number
  },
  nightDutyAllowance: {
    type: Number,
    default: 0
  },
  incentives: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incentive'
  }],
  totalIncentives: {
    type: Number,
    default: 0
  },
  
  // Deductions
  providentFund: {
    type: Number,
    default: 0
  },
  esi: {
    type: Number,
    default: 0
  },
  professionalTax: {
    type: Number,
    default: 0
  },
  tds: {
    type: Number,
    default: 0
  },
  advances: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advance'
  }],
  totalAdvances: {
    type: Number,
    default: 0
  },
  deductions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deduction'
  }],
  totalDeductions: {
    type: Number,
    default: 0
  },
  
  // Attendance Summary
  attendanceSummary: {
    totalWorkingDays: Number,
    presentDays: Number,
    absentDays: Number,
    halfDays: Number,
    leaves: Number,
    holidays: Number
  },
  
  // Calculations
  grossSalary: {
    type: Number,
    required: true
  },
  totalDeductionsAmount: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    required: true
  },
  
  // Payment Details
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Paid', 'Hold'],
    default: 'Pending'
  },
  paymentDate: Date,
  paymentMode: {
    type: String,
    enum: ['Bank Transfer', 'Cash', 'Cheque']
  },
  transactionId: String,
  
  // Google Sheets Sync
  syncedToSheets: {
    type: Boolean,
    default: false
  },
  sheetsSyncDate: Date,
  
  remarks: String,
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index for employee, month, and year
salarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

// Method to calculate salary
salarySchema.methods.calculateSalary = function() {
  // Calculate gross salary
  this.grossSalary = this.basicSalary + 
                     this.hra + 
                     this.otherAllowances + 
                     (this.overtime?.amount || 0) +
                     this.nightDutyAllowance +
                     this.totalIncentives;
  
  // Calculate total deductions
  this.totalDeductionsAmount = this.providentFund +
                               this.esi +
                               this.professionalTax +
                               this.tds +
                               this.totalAdvances +
                               this.totalDeductions;
  
  // Calculate net salary
  this.netSalary = this.grossSalary - this.totalDeductionsAmount;
};

// Pre-save hook to calculate salary
salarySchema.pre('save', function(next) {
  this.calculateSalary();
  next();
});

module.exports = mongoose.model('Salary', salarySchema);
