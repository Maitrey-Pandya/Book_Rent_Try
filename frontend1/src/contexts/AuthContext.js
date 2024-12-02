import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/api/auth/me');
      if (response.data.status === 'success') {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
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

      const response = await api.post(endpoint, signupData);
      
      if (response.data.status === 'success') {
        setUser(response.data.data.user);
        sessionStorage.setItem('userRole', isPublisher ? 'publisher' : 'user');
      }
      
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { 
        email, 
        password 
      });
      
      if (response.data.status === 'success') {
        setUser(response.data.data.user);
        sessionStorage.setItem('userRole', response.data.data.user.role);
        return response.data;
      }
      
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
      setUser(null);
      sessionStorage.removeItem('userRole');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isPublisher = () => {
    return user?.role === 'publisher' || sessionStorage.getItem('userRole') === 'publisher';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
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