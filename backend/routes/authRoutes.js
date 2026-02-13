const express = require('express');
const router = express.Router();
const {
  register,
  login,
  sendOTP,
  verifyOTP,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  logout,
  updateHRPermissions
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { loginValidation, otpValidation, userValidation, validate } = require('../middleware/validation');

// Public routes
router.post('/register', protect, authorize('admin', 'hr'), userValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', otpValidation, validate, verifyOTP);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);
router.get('/logout', protect, logout);

// Admin only routes
router.put('/hr-permissions/:userId', protect, authorize('admin'), updateHRPermissions);

// Google OAuth routes
router.get('/google', (req, res) => {
  // Handled by passport in server.js
  res.redirect('/api/auth/google');
});

router.get('/google/callback', (req, res) => {
  // Handled by passport
  res.redirect(process.env.FRONTEND_URL);
});

module.exports = router;
