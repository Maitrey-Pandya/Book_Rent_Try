import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://book-rent-try-backend.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;