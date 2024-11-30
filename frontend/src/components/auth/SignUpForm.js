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
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export function SignupForm({ initialRole }) {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    zipcode: '',
    ...(initialRole === 'publisher' && {
      publisherName: '',
      companyName: '',
      website: '',
      description: '',
      registrationNumber: '',
      publicationAddress: '',
      officeContact: '',
    })
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setError('');
    setLoading(true);

    try {
      const signupData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        zipcode: formData.zipcode,
        role: initialRole,
        ...(initialRole === 'publisher' && {
          publisherName: formData.publisherName,
          companyName: formData.companyName,
          website: formData.website,
          description: formData.description,
          registrationNumber: formData.registrationNumber,
          publicationAddress: formData.publicationAddress,
          officeContact: formData.officeContact
        })
      };

      const response = await signup(signupData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          {initialRole === 'publisher' ? 'Publisher Registration' : 'Reader Registration'}
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
          />

          <TextField
            fullWidth
            label={initialRole === 'publisher' ? 'Contact Name' : 'Full Name'}
            margin="normal"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            margin="normal"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            margin="normal"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
            helperText={formData.password !== formData.confirmPassword && formData.confirmPassword !== '' ? 'Passwords do not match' : ''}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Phone Number"
            margin="normal"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <TextField
            fullWidth
            label="Address"
            margin="normal"
            required
            multiline
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <TextField
            fullWidth
            label="Zipcode"
            margin="normal"
            required
            value={formData.zipcode}
            onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
          />

          {initialRole === 'publisher' && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Publisher Details
              </Typography>

              <TextField
                fullWidth
                label="Publisher Name"
                margin="normal"
                required
                value={formData.publisherName}
                onChange={(e) => setFormData({ ...formData, publisherName: e.target.value })}
              />

              <TextField
                fullWidth
                label="Company Name"
                margin="normal"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />

              <TextField
                fullWidth
                label="Publication Address"
                margin="normal"
                required
                multiline
                rows={2}
                value={formData.publicationAddress}
                onChange={(e) => setFormData({ ...formData, publicationAddress: e.target.value })}
              />

              <TextField
                fullWidth
                label="Office Contact"
                margin="normal"
                required
                value={formData.officeContact}
                onChange={(e) => setFormData({ ...formData, officeContact: e.target.value })}
              />

              <TextField
                fullWidth
                label="Registration Number"
                margin="normal"
                required
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              />

              <TextField
                fullWidth
                label="Website"
                margin="normal"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />

              <TextField
                fullWidth
                label="Company Description"
                multiline
                rows={4}
                margin="normal"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}