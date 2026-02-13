const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    select: false
  },
  googleId: {
    type: String,
    sparse: true
  },
  role: {
    type: String,
    enum: ['admin', 'hr', 'employee'],
    default: 'employee'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  hrPermissions: {
    canEdit: {
      type: Boolean,
      default: false
    },
    canViewDocuments: {
      type: Boolean,
      default: true
    },
    canManageSalary: {
      type: Boolean,
      default: false
    },
    canManageAttendance: {
      type: Boolean,
      default: true
    }
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  otpCode: String,
  otpExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
