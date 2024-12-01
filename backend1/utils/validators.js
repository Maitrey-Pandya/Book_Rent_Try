// src/utils/validators.js
const { check, validationResult } = require('express-validator');
const AppError = require('./AppError');

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
  console.log('Validating email:', email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const result = {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'Invalid email format'
  };
  console.log('Email validation result:', result);
  return result;
};

const passwordValidator = (password) => {
  console.log('Validating password');
  const errors = [];

  if (!password) {
    console.log('Password validation failed: Password is empty');
    return {
      isValid: false,
      message: 'Password is required'
    };
  }

  if (password.length < passwordRules.minLength) {
    console.log(`Password validation failed: Length < ${passwordRules.minLength}`);
    errors.push(`Password must be at least ${passwordRules.minLength} characters long`);
  }

  if (password.length > passwordRules.maxLength) {
    console.log(`Password validation failed: Length > ${passwordRules.maxLength}`);
    errors.push(`Password must not exceed ${passwordRules.maxLength} characters`);
  }

  if (!passwordRules.patterns.uppercase.test(password)) {
    console.log('Password validation failed: Missing uppercase letter');
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!passwordRules.patterns.lowercase.test(password)) {
    console.log('Password validation failed: Missing lowercase letter');
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!passwordRules.patterns.number.test(password)) {
    console.log('Password validation failed: Missing number');
    errors.push('Password must contain at least one number');
  }

  if (!passwordRules.patterns.special.test(password)) {
    console.log('Password validation failed: Missing special character');
    errors.push('Password must contain at least one special character');
  }

  const result = {
    isValid: errors.length === 0,
    message: errors.join(', ')
  };
  console.log('Password validation result:', result);
  return result;
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
  console.log('Validating ISBN:', isbn);
  const isbnRegex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;
  
  const cleanIsbn = isbn.replace(/[- ]|^ISBN(?:-1[03])?:?/g, '');
  const result = {
    isValid: isbnRegex.test(isbn),
    message: isbnRegex.test(isbn) ? '' : 'Invalid ISBN format'
  };
  console.log('ISBN validation result:', result);
  return result;
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
    'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery',
    'Thriller', 'Romance', 'Horror', 'Biography', 'History',
    'Science', 'Technology', 'Self-Help', 'Children', 'Other'
  ];

  if (!validGenres.includes(genre)) {
    return {
      isValid: false,
      message: `Invalid genre. Must be one of: ${validGenres.join(', ')}`
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

const priceValidator = (price, listingType) => {
  const errors = [];

  if (['sale', 'both'].includes(listingType) && (!price.sale || price.sale <= 0)) {
    errors.push('Sale price must be greater than 0');
  }

  if (['lease', 'both'].includes(listingType)) {
    if (!price.lease || !price.lease.perMonth || price.lease.perMonth <= 0) {
      errors.push('Lease price per month must be greater than 0');
    }

    if (price.lease.maxDuration && price.lease.minDuration > price.lease.maxDuration) {
      errors.push('Minimum duration cannot be greater than maximum duration');
    }

    if (price.lease.minDuration && price.lease.minDuration < 1) {
      errors.push('Minimum duration must be at least 1 month');
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

const leaseTermsValidator = (leaseTerms, listingType) => {
  // Skip validation if not a lease listing
  if (!['lease', 'both'].includes(listingType)) {
    return { isValid: true, message: '' };
  }

  if (!leaseTerms || typeof leaseTerms !== 'string') {
    return {
      isValid: false,
      message: 'Lease terms are required for rental listings'
    };
  }

  const trimmedTerms = leaseTerms.trim();
  if (trimmedTerms.length < 20) {
    return {
      isValid: false,
      message: 'Lease terms must be at least 20 characters long'
    };
  }

  return {
    isValid: true,
    message: '',
    value: trimmedTerms
  };
};

const conditionValidator = (condition) => {
  const validConditions = ['new', 'like-new', 'good', 'fair', 'poor'];
  
  if (!condition || !validConditions.includes(condition)) {
    return {
      isValid: false,
      message: `Invalid condition. Must be one of: ${validConditions.join(', ')}`
    };
  }

  return {
    isValid: true,
    message: ''
  };
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
  leaseTerms,
  condition
}) => {
  const errors = [];
  const validatedData = {
    isbn,
    title,
    author,
    description,
    listingType,
    price,
    leaseTerms,
    condition
  };

  // Required fields check
  const requiredFields = {
    isbn,
    title,
    author,
    genre,
    description,
    listingType,
    condition
  };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Handle genre validation
  if (Array.isArray(genre)) {
    if (genre.length === 0) {
      errors.push('At least one genre must be selected');
      return { isValid: false, errors };
    }
    // Take the first genre from the array
    validatedData.genre = genre[0];
  } else {
    validatedData.genre = genre;
  }

  // Validate all fields
  const validations = [
    isbnValidator(isbn),
    authorValidator(author),
    genreValidator(validatedData.genre),
    descriptionValidator(description),
    conditionValidator(condition)
  ];

  // Add price validation if price exists
  if (price) {
    validations.push(priceValidator(price, listingType));
  }

  // Add lease terms validation if applicable
  if (['lease', 'both'].includes(listingType)) {
    validations.push(leaseTermsValidator(leaseTerms, listingType));
  }

  for (const validation of validations) {
    if (!validation.isValid) {
      errors.push(validation.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: validatedData
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
  try {
    // Check if bookData exists in the request
    if (!req.body.bookData) {
      throw new AppError('Book data is required', 400);
    }

    // Parse the bookData
    let bookData;
    try {
      bookData = JSON.parse(req.body.bookData);
    } catch (error) {
      throw new AppError('Invalid book data format', 400);
    }

    // Validate required fields
    const requiredFields = ['title', 'author', 'isbn', 'condition', 'listingType'];
    for (const field of requiredFields) {
      if (!bookData[field]) {
        throw new AppError(`${field} is required`, 400);
      }
    }

    // Validate listing type and corresponding price fields
    if (!['sale', 'lease', 'both'].includes(bookData.listingType)) {
      throw new AppError('Invalid listing type', 400);
    }

    // Validate price based on listing type
    if (['sale', 'both'].includes(bookData.listingType) && !bookData.price?.sale) {
      throw new AppError('Sale price is required for sale listings', 400);
    }

    if (['lease', 'both'].includes(bookData.listingType) && !bookData.price?.lease) {
      throw new AppError('Lease details are required for rental listings', 400);
    }

    // If validation passes, attach parsed bookData to request
    req.bookData = bookData;
    next();
  } catch (error) {
    next(error);
  }
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