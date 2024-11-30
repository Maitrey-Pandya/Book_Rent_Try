// src/utils/validators.js
const { check, validationResult } = require('express-validator');

// Password validation rules
const passwordRules = {
  minLength: 8,
  maxLength: 30,
  patterns: {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*(),.?":{}|<>]/
  }
};

// Base validator functions
const emailValidator = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'Invalid email format'
  };
};

const passwordValidator = (password) => {
  const errors = [];

  if (!password) {
    return {
      isValid: false,
      message: 'Password is required'
    };
  }

  if (password.length < passwordRules.minLength) {
    errors.push(`Password must be at least ${passwordRules.minLength} characters long`);
  }

  if (password.length > passwordRules.maxLength) {
    errors.push(`Password must not exceed ${passwordRules.maxLength} characters`);
  }

  if (!passwordRules.patterns.uppercase.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!passwordRules.patterns.lowercase.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!passwordRules.patterns.number.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!passwordRules.patterns.special.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    message: errors.join(', ')
  };
};

const phoneValidator = (phone) => {
  // Accepts formats: +1234567890, 123-456-7890, (123) 456-7890
  const phoneRegex = /^(\+\d{1,3}[-.]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return {
    isValid: phoneRegex.test(phone),
    message: phoneRegex.test(phone) ? '' : 'Invalid phone number format'
  };
};

const zipcodeValidator = (zipcode) => {
  // Accepts 5 or 6 digit zipcodes
  const zipcodeRegex = /^\d{5,6}$/;
  return {
    isValid: zipcodeRegex.test(zipcode),
    message: zipcodeRegex.test(zipcode) ? '' : 'Invalid zipcode format'
  };
};

const nameValidator = (name, field = 'Name') => {
  if (!name || name.trim().length < 2) {
    return {
      isValid: false,
      message: `${field} must be at least 2 characters long`
    };
  }
  return { isValid: true, message: '' };
};

const addressValidator = (address) => {
  if (!address || address.trim().length < 5) {
    return {
      isValid: false,
      message: 'Address must be at least 5 characters long'
    };
  }
  return { isValid: true, message: '' };
};

// Book-related validators
const isbnValidator = (isbn) => {
  // Accepts ISBN-10 and ISBN-13 formats with or without hyphens
  const isbnRegex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;
  
  const cleanIsbn = isbn.replace(/[- ]|^ISBN(?:-1[03])?:?/g, '');
  return {
    isValid: isbnRegex.test(isbn),
    message: isbnRegex.test(isbn) ? '' : 'Invalid ISBN format'
  };
};

const authorValidator = (author) => {
  if (!author || author.trim().length < 2) {
    return {
      isValid: false,
      message: 'Author name must be at least 2 characters long'
    };
  }
  return { isValid: true, message: '' };
};

const genreValidator = (genre) => {
  const validGenres = [
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Thriller',
    'Romance',
    'Horror',
    'Biography',
    'History',
    'Science',
    'Technology',
    'Self-Help',
    'Children',
    'Other'
  ];

  return {
    isValid: validGenres.includes(genre),
    message: validGenres.includes(genre) ? '' : `Invalid genre. Must be one of: ${validGenres.join(', ')}`
  };
};

const priceValidator = (price, listingType) => {
  const errors = [];

  if (['sale', 'both'].includes(listingType) && (!price.sale || price.sale <= 0)) {
    errors.push('Sale price must be greater than 0');
  }

  if (['lease', 'both'].includes(listingType)) {
    if (!price.lease || !price.lease.perDay || price.lease.perDay <= 0) {
      errors.push('Lease price per day must be greater than 0');
    }

    if (price.lease.maxDuration && price.lease.minDuration > price.lease.maxDuration) {
      errors.push('Minimum duration cannot be greater than maximum duration');
    }

    if (price.lease.minDuration && price.lease.minDuration < 1) {
      errors.push('Minimum duration must be at least 1 day');
    }
  }

  return {
    isValid: errors.length === 0,
    message: errors.join(', ')
  };
};

const descriptionValidator = (description) => {
  if (!description || description.trim().length < 10) {
    return {
      isValid: false,
      message: 'Description must be at least 10 characters long'
    };
  }
  return { isValid: true, message: '' };
};

// Combined validators for user and publisher
exports.validateUserInput = ({ 
  email, 
  password, 
  confirmPassword, 
  name, 
  address, 
  zipcode, 
  phone 
}) => {
  console.log('Validator received:', {
    email: email ? '[PRESENT]' : '[MISSING]',
    password: password ? '[PRESENT]' : '[MISSING]',
    confirmPassword: confirmPassword ? '[PRESENT]' : '[MISSING]',
    name: name ? '[PRESENT]' : '[MISSING]',
    address: address ? '[PRESENT]' : '[MISSING]',
    zipcode: zipcode ? '[PRESENT]' : '[MISSING]',
    phone: phone ? '[PRESENT]' : '[MISSING]'
  });

  const errors = [];

  const requiredFields = { email, password, confirmPassword, name, address, zipcode, phone };
  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const validations = [
    emailValidator(email),
    passwordValidator(password),
    nameValidator(name),
    addressValidator(address),
    zipcodeValidator(zipcode),
    phoneValidator(phone)
  ];

  for (const validation of validations) {
    if (!validation.isValid) {
      errors.push(validation.message);
    }
  }

  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

exports.validatePublisherInput = ({ 
  email, 
  password, 
  confirmPassword, 
  publisherName, 
  publicationAddress, 
  officeContact, 
  zipcode 
}) => {
  const errors = [];

  const requiredFields = { 
    email, 
    password, 
    confirmPassword, 
    publisherName, 
    publicationAddress, 
    officeContact, 
    zipcode 
  };
  
  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const validations = [
    emailValidator(email),
    passwordValidator(password),
    nameValidator(publisherName, 'Publisher name'),
    addressValidator(publicationAddress),
    zipcodeValidator(zipcode),
    phoneValidator(officeContact)
  ];

  for (const validation of validations) {
    if (!validation.isValid) {
      errors.push(validation.message);
    }
  }

  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Updated Book validation
exports.validateBookInput = ({
  isbn,
  title,
  author,
  genre,
  description,
  listingType,
  price,
  leaseTerms
}) => {
  const errors = [];

  // Required field checks
  const requiredFields = { isbn, title, author, genre, description, listingType };
  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Validate fields
  const validations = [
    isbnValidator(isbn),
    nameValidator(title, 'Title'),
    authorValidator(author),
    genreValidator(genre),
    descriptionValidator(description)
  ];

  // Validate listing type
  if (!['sale', 'lease', 'both'].includes(listingType)) {
    errors.push('Invalid listing type. Must be sale, lease, or both');
  }

  // Validate price based on listing type
  const priceValidation = priceValidator(price, listingType);
  if (!priceValidation.isValid) {
    errors.push(priceValidation.message);
  }

  // Validate lease terms if applicable
  if (['lease', 'both'].includes(listingType) && (!leaseTerms || leaseTerms.trim().length < 10)) {
    errors.push('Lease terms must be at least 10 characters long');
  }

  for (const validation of validations) {
    if (!validation.isValid) {
      errors.push(validation.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Bulk books validation
exports.validateBulkBooksInput = (books) => {
  if (!Array.isArray(books) || books.length === 0) {
    return {
      isValid: false,
      errors: ['Books array is required and must not be empty']
    };
  }

  const errors = [];
  books.forEach((book, index) => {
    const validation = exports.validateBookInput(book);
    if (!validation.isValid) {
      errors.push(`Book at index ${index}: ${validation.errors.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Cart validation
exports.validateCartItem = [
  check('bookId')
    .notEmpty()
    .withMessage('Book ID is required')
    .isMongoId()
    .withMessage('Invalid book ID'),
  
  check('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  check('type')
    .isIn(['purchase', 'rent'])
    .withMessage('Type must be either purchase or rent'),
  
  check('rentalDuration')
    .if(check('type').equals('rent'))
    .custom((value) => {
      if (!value || !value.startDate || !value.endDate) {
        throw new Error('Rental duration is required for rental items');
      }
      const start = new Date(value.startDate);
      const end = new Date(value.endDate);
      if (end <= start) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

// Order validation
exports.validateOrder = [
  check('shippingAddress')
    .notEmpty()
    .withMessage('Shipping address is required')
    .isObject()
    .withMessage('Invalid shipping address format'),
  
  check('shippingAddress.street')
    .notEmpty()
    .withMessage('Street is required'),
  
  check('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required'),
  
  check('shippingAddress.state')
    .notEmpty()
    .withMessage('State is required'),
  
  check('shippingAddress.zipcode')
    .notEmpty()
    .withMessage('Zipcode is required')
    .matches(/^\d{5,6}$/)
    .withMessage('Invalid zipcode format'),
  
  check('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'upi', 'net_banking'])
    .withMessage('Invalid payment method')
];

// Review validation
exports.validateReview = [
  check('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  check('review')
    .notEmpty()
    .withMessage('Review text is required')
    .isLength({ max: 500 })
    .withMessage('Review cannot exceed 500 characters'),
  
  check('orderType')
    .isIn(['purchase', 'rent'])
    .withMessage('Invalid order type')
];

// Express middleware validators
exports.validateBook = (req, res, next) => {
  const validation = exports.validateBookInput(req.body);
  if (!validation.isValid) {
    return next(new AppError(validation.errors.join(', '), 400));
  }
  next();
};

exports.validateBulkBooks = (req, res, next) => {
  const validation = exports.validateBulkBooksInput(req.body.books);
  if (!validation.isValid) {
    return next(new AppError(validation.errors.join(', '), 400));
  }
  next();
};

// Export all validators
exports.emailValidator = emailValidator;
exports.passwordValidator = passwordValidator;
exports.phoneValidator = phoneValidator;
exports.zipcodeValidator = zipcodeValidator;
exports.nameValidator = nameValidator;
exports.addressValidator = addressValidator;
exports.isbnValidator = isbnValidator;
exports.authorValidator = authorValidator;
exports.genreValidator = genreValidator;
exports.priceValidator = priceValidator;
exports.descriptionValidator = descriptionValidator;