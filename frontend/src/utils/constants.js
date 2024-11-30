export const USER_ROLES = {
    USER: 'user',
    PUBLISHER: 'publisher',
    ADMIN: 'admin'
  };
  
  export const AUTH_STORAGE_KEY = 'auth_token';
  
  export const API_ENDPOINTS = {
    LOGIN: '/api/v1/auth/login',
    SIGNUP: '/api/v1/auth/signup',
    PROFILE: '/api/v1/users/profile',
    BOOKS: '/api/v1/books',
    BOOKMARKS: '/api/v1/bookmarks',
    CART: '/api/v1/cart'
  };
  
  export const BOOK_STATUS = {
    AVAILABLE: 'available',
    BORROWED: 'borrowed',
    RESERVED: 'reserved'
  };
  
  export const LISTING_TYPES = {
    SWAP: 'swap',
    LEASE: 'lease',
    BOTH: 'both'
  };
  
  export const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    PASSWORDS_NOT_MATCH: 'Passwords do not match',
    GENERIC_ERROR: 'Something went wrong. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.'
  };