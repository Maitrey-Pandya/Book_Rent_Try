import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Container,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export function PublisherSignupForm() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    publisherName: '',
    officeContact: '',
    publicationAddress: '',
    zipcode: ''
  });

  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (!formData.confirmPassword) {
      setError('Please confirm your password');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!formData.publisherName || formData.publisherName.length < 2) {
      setError('Publisher name must be at least 2 characters long');
      return false;
    }
    if (!formData.officeContact) {
      setError('Office contact is required');
      return false;
    }
    if (!formData.publicationAddress) {
      setError('Publication address is required');
      return false;
    }
    if (!formData.zipcode || !/^\d{5,6}$/.test(formData.zipcode)) {
      setError('Please enter a valid zipcode (5-6 digits)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const publisherData = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        publisherName: formData.publisherName,
        publicationAddress: formData.publicationAddress,
        officeContact: formData.officeContact,
        zipcode: formData.zipcode
      };

      console.log('Submitting publisher data:', publisherData);
      const response = await signup(publisherData);
      
      if (response.status === 'success' || response.token) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Failed to create publisher account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Publisher Registration
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={!formData.email}
            helperText={!formData.email && "Email is required"}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={!formData.password || formData.password.length < 8}
            helperText={
              !formData.password 
                ? "Password is required" 
                : "Password must be at least 8 characters long"
            }
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            margin="normal"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={!formData.confirmPassword || formData.password !== formData.confirmPassword}
            helperText={
              !formData.confirmPassword 
                ? "Please confirm your password"
                : formData.password !== formData.confirmPassword 
                  ? "Passwords do not match"
                  : ""
            }
          />

          <TextField
            fullWidth
            label="Publisher Name"
            margin="normal"
            required
            value={formData.publisherName}
            onChange={(e) => setFormData({ ...formData, publisherName: e.target.value })}
            error={!formData.publisherName || formData.publisherName.length < 2}
            helperText={
              !formData.publisherName 
                ? "Publisher name is required" 
                : "Minimum 2 characters required"
            }
          />

          <TextField
            fullWidth
            label="Office Contact"
            margin="normal"
            required
            value={formData.officeContact}
            onChange={(e) => setFormData({ ...formData, officeContact: e.target.value })}
            error={!formData.officeContact}
            helperText={!formData.officeContact && "Office contact is required"}
          />

          <TextField
            fullWidth
            label="Publication Address"
            margin="normal"
            required
            multiline
            rows={3}
            value={formData.publicationAddress}
            onChange={(e) => setFormData({ ...formData, publicationAddress: e.target.value })}
            error={!formData.publicationAddress}
            helperText={!formData.publicationAddress && "Publication address is required"}
          />

          <TextField
            fullWidth
            label="Zipcode"
            margin="normal"
            required
            value={formData.zipcode}
            onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
            error={!formData.zipcode || !/^\d{5,6}$/.test(formData.zipcode)}
            helperText={
              !formData.zipcode 
                ? "Zipcode is required" 
                : "Enter 5-6 digit zipcode"
            }
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Creating Publisher Account...' : 'Create Publisher Account'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default PublisherSignupForm;