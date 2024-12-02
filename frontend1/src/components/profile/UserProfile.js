import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Avatar,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import api from '../../api/axios';

export function UserProfile() {
  console.log('UserProfile component rendering');
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    readersScore: '0',
    totalRatings: 0
  });

  useEffect(() => {
    console.log('User context reader score:', user?.readersScore);
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/api/user/profile', {
        withCredentials: true
      });

      // Debug API response structure
      console.log('Profile API Response:', response.data);
      
      // Access nested user object correctly
      const userData = response.data.data.user;
      console.log('User data from API:', {
        readersScore: userData.readersScore,
        totalRatings: userData.totalRatings
      });

      if (userData) {
        const score = userData.readersScore ?? 0;
        console.log('Setting reader score to:', score);
        
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          readersScore: String(score),
          totalRatings: userData.totalRatings || 0
        });
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const updateData = {
        phone: formData.phone,
        address: formData.address
      };

      console.log('Updating profile with:', updateData);

      const response = await api.patch('/api/user/profile', updateData, {
        withCredentials: true
      });
      
      if (response.data.status === 'success') {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(prev => ({
      ...prev,
      phone: user.phone || '',
      address: user.address || ''
    }));
    setError('');
  };

  if (loading) {
    console.log('Rendering loading spinner');
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (error) {
    console.log('Rendering error state');
    return (
      <Paper elevation={3} sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  console.log('Rendering full profile');
  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Grid container spacing={4}>
        {/* Left Column - Avatar and Score */}
        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
          <Avatar
            src="/assests/user_photo_template.webp"
            alt={formData.name}
            sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            Reader's Score: {parseInt(formData.readersScore) || 0}/100
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Based on {formData.totalRatings} {formData.totalRatings === 1 ? 'rating' : 'ratings'}
          </Typography>
        </Grid>

        {/* Right Column - User Details */}
        <Grid item xs={12} md={8}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Profile Details</Typography>
            <Box>
              {isEditing ? (
                <>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={<SaveIcon />}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCancel}
                    sx={{ ml: 1 }}
                    startIcon={<CancelIcon />}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setIsEditing(true)}
                  startIcon={<EditIcon />}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  disabled
                  helperText="Name cannot be changed"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.email}
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Paper>
  );
}