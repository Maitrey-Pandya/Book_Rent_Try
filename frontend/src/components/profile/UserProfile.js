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
  Divider
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import api from '../../api/axios';

export function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    readersScore: '0'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        readersScore: user.readersScore || '0'
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/api/v1/users/profile', {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Updating profile..." />;
  }

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Grid container spacing={4}>
        {/* Left Column - Avatar and Score */}
        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
          <Avatar
            src="/user-profile.png"
            alt={formData.name}
            sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            Reader's Score: {formData.readersScore}/100
          </Typography>
        </Grid>

        {/* Right Column - User Details */}
        <Grid item xs={12} md={8}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Profile Details</Typography>
            <IconButton onClick={() => setIsEditing(!isEditing)} color="primary">
              {isEditing ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
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
              <Grid item xs={12} sm={6}>
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
              {isEditing && (
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                </Grid>
              )}
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Paper>
  );
}