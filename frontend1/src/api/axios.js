import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://book-rent-try-backend.onrender.com' ,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add this interceptor to handle cookie-related issues
api.interceptors.response.use(
  response => response,
  error => {
      if (error.response?.status === 401) {
          // Handle unauthorized access
          console.log('Unauthorized access, clearing cookies');
          document.cookie = 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
      return Promise.reject(error);
  }
);

export default instance;