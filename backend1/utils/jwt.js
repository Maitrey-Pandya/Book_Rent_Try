// src/utils/jwt.js
const jwt = require('jsonwebtoken');

// Never use a fallback secret in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

exports.generateToken = (payload) => {
  try {
    return jwt.sign(
      payload,
      JWT_SECRET,
      { 
        expiresIn: JWT_EXPIRES_IN,
        algorithm: 'HS256' // Explicitly specify the algorithm
      }
    );
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate token');
  }
};

exports.verifyToken = (token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }
    
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'] // Explicitly specify allowed algorithms
    });
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

// Helper function to set token in cookie
exports.setTokenCookie = (res, token) => {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  });
};

// Helper function to clear token cookie
exports.clearTokenCookie = (res) => {
  res.cookie('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 0,
    path: '/'
  });
};