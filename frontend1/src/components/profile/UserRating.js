import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  Typography,
  Box,
} from '@mui/material';
import api from '../../api/axios';

export function UserRating({ open, onClose, transaction, onRatingSubmit }) {
  const [rating, setRating] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await api.post(`/api/user/${transaction?.seller}/rate`, {
        rating: rating * 20, // Convert 5-star rating to 100-point scale
        orderId: transaction?._id
      });

      if (response.data.status === 'success') {
        onRatingSubmit();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Rate Seller</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography>Rate your experience with the seller</Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            size="large"
            precision={0.5}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!rating}>
          Submit Rating
        </Button>
      </DialogActions>
    </Dialog>
  );
}