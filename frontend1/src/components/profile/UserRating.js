import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (transaction) {
      console.log('UserRating Component - Transaction Details:', {
        transactionId: transaction._id,
        uploader: transaction.items[0]?.book?.uploader,
        hasRated: transaction.hasRated,
        items: transaction.items,
        fullTransaction: transaction
      });
    }
  }, [transaction]);

  const handleSubmit = async () => {
    try {
      const uploader = transaction.items[0]?.book?.uploader;
      console.log('HandleSubmit - Initial Data:', {
        rating,
        uploader,
        transaction: transaction._id,
        fullTransaction: transaction
      });

      if (!uploader?._id) {
        console.error('HandleSubmit - Missing Uploader:', {
          item: transaction.items[0],
          book: transaction.items[0]?.book,
          uploader: transaction.items[0]?.book?.uploader
        });
        setError('Uploader information not found');
        return;
      }

      console.log('HandleSubmit - Preparing API Call:', {
        uploaderId: uploader._id,
        orderId: transaction._id,
        rating: rating * 20,
        endpoint: `/api/v1/users/${uploader._id}/rate`
      });

      const response = await api.post(`/api/user/${uploader._id}/rate`, {
        rating: rating * 20,
        orderId: transaction._id
      });

      console.log('HandleSubmit - API Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      if (response.data.status === 'success') {
        console.log('HandleSubmit - Rating Success:', {
          newRating: rating * 20,
          uploaderId: uploader._id,
          transactionId: transaction._id
        });
        onRatingSubmit();
        handleClose();
      } else {
        console.error('HandleSubmit - Rating Failed:', {
          response: response.data,
          error: response.data.message
        });
        setError(response.data.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('HandleSubmit - Error Details:', {
        error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message,
        stack: error.stack
      });
      setError(error.response?.data?.message || 'Failed to submit rating');
    }
  };

  const handleClose = () => {
    console.log('HandleClose - Resetting Component State');
    setError('');
    setRating(0);
    onClose();
  };

  const handleRatingChange = (_, newValue) => {
    console.log('HandleRatingChange:', {
      oldValue: rating,
      newValue,
      scale: newValue * 20
    });
    setRating(newValue);
    setError('');
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Rate Book Uploader</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography>
            Rate your experience with {transaction?.items[0]?.book?.uploader?.name} for order #{transaction?._id}
          </Typography>
          <Rating
            value={rating}
            onChange={handleRatingChange}
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!rating || transaction?.hasRated}
        >
          Submit Rating
        </Button>
      </DialogActions>
    </Dialog>
  );
}