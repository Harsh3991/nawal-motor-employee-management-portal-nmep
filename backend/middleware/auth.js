const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check HR permissions
exports.checkHRPermission = (permission) => {
  return (req, res, next) => {
    if (req.user.role === 'admin') {
      // Admin has all permissions
      return next();
    }

    if (req.user.role === 'hr') {
      // Check if HR has the specific permission
      if (!req.user.hrPermissions || !req.user.hrPermissions[permission]) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action'
        });
      }
      return next();
    }

    // Other roles are not allowed
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  };
};

// Check if user can access employee data
exports.canAccessEmployee = async (req, res, next) => {
  const employeeId = req.params.id || req.params.employeeId;

  // Admin and HR can access all employees
  if (req.user.role === 'admin' || req.user.role === 'hr') {
    return next();
  }

  // Employee can only access their own data
  if (req.user.role === 'employee') {
    if (req.user.employee?.toString() !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own data'
      });
    }
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied'
  });
};
