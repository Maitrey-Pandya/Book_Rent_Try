// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Publisher = require('../models/Publisher');
const AppError = require('../utils/AppError');

exports.protect = async (req, res, next) => {
  try {
    // Get token from cookie or header
    const token = req.cookies.auth_token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check user type based on role
    const Model = decoded.role === 'publisher' ? Publisher : User;
    const user = await Model.findById(decoded.userId);

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
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

