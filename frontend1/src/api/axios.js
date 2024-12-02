import axios from 'axios';

const instance = axios.create({
  baseURL: 1
    ? 'https://book-rent-try-backend.onrender.com'
    : 'http://localhost:5001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;