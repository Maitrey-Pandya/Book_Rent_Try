// src/middleware/authMiddleware.js
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const Publisher = require('../models/Publisher');
const AppError = require('../utils/AppError');

exports.protect = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.auth_token;
    
    if (!token) {
      return next(new AppError('Please log in to access this resource', 401));
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // Check if user changed password after token was issued
    if (user.passwordChangedAfter && user.passwordChangedAfter(decoded.iat)) {
      return next(new AppError('Password recently changed. Please log in again', 401));
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError(error.message, 401));
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new AppError('Access restricted to admin users only', 403));
  }
};

