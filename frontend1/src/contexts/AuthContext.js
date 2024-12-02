import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        const response = await api.get('/api/v1/users/me');
        setUser(response.data.data.user);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      console.log('Sending signup data:', userData);
      
      const isPublisher = userData.publisherName ? true : false;
      const endpoint = isPublisher ? '/api/publisher/signup' : '/api/user/signup';
      
      const signupData = isPublisher ? {
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        publisherName: userData.publisherName,
        publicationAddress: userData.publicationAddress,
        officeContact: userData.officeContact,
        zipcode: userData.zipcode,
        role: 'publisher'
      } : {
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
        zipcode: userData.zipcode,
        role: 'user'
      };

      console.log('Endpoint:', endpoint);
      console.log('Signup Data:', signupData);
      
      const response = await api.post(endpoint, signupData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', isPublisher ? 'publisher' : 'user');
        setUser({
          ...response.data.user,
          role: isPublisher ? 'publisher' : 'user'
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response?.data || error);
      throw error;
    }
  };

  const handleAuthResponse = (response) => {
    if (response.data.status === 'success') {
      setUser(response.data.user || response.data.publisher);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      const response = await api.post('/api/auth/login', { 
        email, 
        password 
      }, {
        withCredentials: true
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.status === 'success') {
        const { user } = response.data;
        setUser(user);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const testAuth = async () => {
    try {
      const response = await api.get('/api/auth/test-auth', {
        withCredentials: true
      });
      console.log('Auth test response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Auth test error:', error.response?.data || error.message);
      throw error;
    }
  };

  const isPublisher = () => {
    return user?.role === 'publisher' || localStorage.getItem('userRole') === 'publisher';
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    signup,
    testAuth,
    isPublisher
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};