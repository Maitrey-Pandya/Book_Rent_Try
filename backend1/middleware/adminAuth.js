const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  const adminKey = req.headers['x-api-key'];
  
  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return next(new AppError('Invalid admin credentials', 401));
  }
  
  next();
};