const mongoose = require('mongoose');

const deductionSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['Late Coming', 'Absent', 'Damage', 'Loss', 'Loan', 'Fine', 'Other'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  remarks: String,
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Deducted'],
    default: 'Pending'
  },
  deductedInSalary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salary'
  }
}, {
  timestamps: true
});

// Index for employee, month, and year
deductionSchema.index({ employee: 1, month: 1, year: 1 });

module.exports = mongoose.model('Deduction', deductionSchema);
