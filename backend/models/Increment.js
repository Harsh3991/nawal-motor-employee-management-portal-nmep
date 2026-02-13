const mongoose = require('mongoose');

const incrementSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  previousSalary: {
    type: Number,
    required: true
  },
  newSalary: {
    type: Number,
    required: true
  },
  incrementAmount: {
    type: Number,
    required: true
  },
  incrementPercentage: {
    type: Number
  },
  reason: {
    type: String,
    enum: ['Performance', 'Promotion', 'Annual', 'Special', 'Market Adjustment'],
    required: true
  },
  remarks: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

// Index for employee and date
incrementSchema.index({ employee: 1, effectiveDate: -1 });

// Pre-save hook to calculate percentage
incrementSchema.pre('save', function(next) {
  if (this.previousSalary && this.newSalary) {
    this.incrementPercentage = ((this.newSalary - this.previousSalary) / this.previousSalary) * 100;
    this.incrementAmount = this.newSalary - this.previousSalary;
  }
  next();
});

module.exports = mongoose.model('Increment', incrementSchema);
