const User = require('../models/User');
const Employee = require('../models/Employee');
const { generateToken, sendTokenResponse } = require('../utils/jwt');
const { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');
const { generateOTP, generateRandomPassword, generateEmployeeId } = require('../utils/helpers');
const crypto = require('crypto');

// @desc    Register new user (Admin/HR only)
// @route   POST /api/auth/register
// @access  Private (Admin/HR)
exports.register = async (req, res, next) => {
  try {
    const { email, role, employeeId } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Generate temporary password
    const tempPassword = generateRandomPassword();

    // Create user
    user = await User.create({
      employeeId,
      email,
      password: tempPassword,
      role: role || 'employee',
      employee: employee._id
    });

    // Send welcome email with credentials
    await sendWelcomeEmail(email, employee.fullName, employeeId, tempPassword);

    res.status(201).json({
      success: true,
      message: 'User created successfully. Welcome email sent.',
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password').populate('employee');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Send OTP for login
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).populate('employee');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP to user (expires in 10 minutes)
    user.otpCode = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, user.employee?.fullName);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and login
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).populate('employee');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP is valid
    if (user.otpCode !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP is expired
    if (user.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Clear OTP
    user.otpCode = undefined;
    user.otpExpire = undefined;
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('employee');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).populate('employee');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendPasswordResetEmail(email, user.employee?.fullName, resetUrl);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

// @desc    Update HR permissions
// @route   PUT /api/auth/hr-permissions/:userId
// @access  Private (Admin only)
exports.updateHRPermissions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { hrPermissions } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'hr') {
      return res.status(400).json({
        success: false,
        message: 'User is not an HR'
      });
    }

    user.hrPermissions = {
      ...user.hrPermissions,
      ...hrPermissions
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
