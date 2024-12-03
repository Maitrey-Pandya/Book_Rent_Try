import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  maxContentLength: 10000000, // 10MB in bytes
  maxBodyLength: 10000000
});



export default instance;