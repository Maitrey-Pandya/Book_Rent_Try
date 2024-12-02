import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Typography,
  Box
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

export function RentBookDialog({ book, open, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [duration, setDuration] = useState(book?.price?.lease?.minDuration || 1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const minDuration = book?.price?.lease?.minDuration || 1;
  const maxDuration = book?.price?.lease?.maxDuration || 30;
  const perDayPrice = book?.price?.lease?.perDay || 0;
  const deposit = book?.price?.lease?.deposit || 0;

  const totalPrice = duration * perDayPrice;

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      setError('');

      // Calculate start and end dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + Number(duration));

      console.log('Attempting to add book to cart:', {
        bookId: book?._id,
        duration,
        startDate,
        endDate
      });

      if (!book || !book._id) {
        setError('Invalid book data');
        return;
      }

      const cartData = {
        bookId: book._id,
        quantity: 1,
        type: 'rent',
        rentalDuration: {
          startDate,
          endDate
        }
      };

      console.log('Sending cart data:', cartData);

      // First, check if book is already in cart
      try {
        const cartResponse = await api.get('/api/v1/cart');
        const existingItem = cartResponse.data.data.cart?.items.find(
          item => item.book._id === book._id && item.type === 'rent'
        );

        if (existingItem) {
          console.log('Book already exists in cart:', existingItem);
          setError('This book is already in your cart. Please check your cart.');
          return;
        }
      } catch (err) {
        console.error('Error checking cart:', err);
      }

      const response = await api.post('/api/v1/cart/add', cartData, {
        withCredentials: true
      });

      console.log('Add to cart response:', response.data);

      if (response.data.status === 'success') {
        onClose(true);
        navigate('/cart');
      } else {
        setError('Failed to add book to cart');
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add book to cart';
      console.log('Error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Rent Book: {book?.title}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Price per day: ₹{perDayPrice}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Security deposit: ₹{deposit}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Duration allowed: {minDuration} - {maxDuration} days
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Rental Duration (days)"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          inputProps={{
            min: minDuration,
            max: maxDuration
          }}
          helperText={`Total rental cost: ₹${totalPrice}`}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button 
          onClick={handleAddToCart} 
          variant="contained" 
          disabled={loading || duration < minDuration || duration > maxDuration}
        >
          Add to Cart
        </Button>
      </DialogActions>
    </Dialog>
  );
}