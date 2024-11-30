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
    console.log('Auth Context - Signup Data:', userData);
    
    if (userData.role === 'publisher') {
      const publisherData = {
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        publisherName: userData.name,
        publicationAddress: userData.publicationAddress,
        officeContact: userData.officeContact,
        zipcode: userData.zipcode,
        companyName: userData.companyName,
        website: userData.website,
        description: userData.description,
        registrationNumber: userData.registrationNumber
      };
      
      const response = await api.post('/api/publisher/signup', publisherData);
      handleAuthResponse(response);
      return response.data;
    } else {
      const userSignupData = {
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
        zipcode: userData.zipcode
      };
      
      const response = await api.post('/api/user/signup', userSignupData);
      handleAuthResponse(response);
      return response.data;
    }
  };

  const handleAuthResponse = (response) => {
    if (response.data.status === 'success') {
      const { token } = response.data.user || response.data.publisher;
      localStorage.setItem('token', token);
      setToken(token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(response.data.user || response.data.publisher);
    }
  };

  const login = async (email, password) => {
    try {
        console.log('Attempting login with:', { email });
        const response = await api.post('/api/auth/login', { 
            email, 
            password 
        });
        
        console.log('Login response:', response.data);
        
        if (response.data.status === 'success') {
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setToken(token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    signup
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