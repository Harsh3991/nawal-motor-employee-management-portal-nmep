const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Day', 'Leave', 'Holiday'],
    required: true
  },
  checkInTime: Date,
  checkOutTime: Date,
  workingHours: Number,
  isNightDuty: {
    type: Boolean,
    default: false
  },
  location: {
    checkIn: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    checkOut: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  faceRecognitionVerified: {
    type: Boolean,
    default: false
  },
  fingerprintVerified: {
    type: Boolean,
    default: false
  },
  remarks: String,
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index for employee and date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Index for date range queries
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
