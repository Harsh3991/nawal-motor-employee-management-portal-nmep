const mongoose = require('mongoose');

const advanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  requestDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    required: true
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  remarks: String,
  
  // Repayment Details
  repaymentStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  repaymentMode: {
    type: String,
    enum: ['Salary Deduction', 'Cash', 'Other'],
    default: 'Salary Deduction'
  },
  installments: {
    type: Number,
    default: 1
  },
  installmentAmount: Number,
  paidAmount: {
    type: Number,
    default: 0
  },
  remainingAmount: Number,
  
  // Repayment Schedule
  repayments: [{
    month: Number,
    year: Number,
    amount: Number,
    salary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salary'
    },
    paidDate: Date
  }],
  
  // Payment Details (when advance is given)
  paymentDate: Date,
  paymentMode: {
    type: String,
    enum: ['Bank Transfer', 'Cash', 'Cheque']
  },
  transactionId: String
}, {
  timestamps: true
});

// Index for employee and status
advanceSchema.index({ employee: 1, approvalStatus: 1 });
advanceSchema.index({ employee: 1, repaymentStatus: 1 });

// Method to calculate remaining amount
advanceSchema.methods.calculateRemaining = function() {
  this.remainingAmount = this.amount - this.paidAmount;
  
  if (this.remainingAmount <= 0) {
    this.repaymentStatus = 'Completed';
  } else if (this.paidAmount > 0) {
    this.repaymentStatus = 'In Progress';
  }
};

// Pre-save hook
advanceSchema.pre('save', function(next) {
  if (this.installments > 0) {
    this.installmentAmount = Math.ceil(this.amount / this.installments);
  }
  
  this.calculateRemaining();
  next();
});

module.exports = mongoose.model('Advance', advanceSchema);
