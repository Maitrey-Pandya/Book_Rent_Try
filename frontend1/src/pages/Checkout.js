import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import api from '../api/axios';

export function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'India',
    paymentMethod: 'upi'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('Submitting order with data:', formData);

    try {
      const orderData = {
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipcode: formData.zipcode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod
      };

      console.log('Sending order request:', orderData);
      const response = await api.post('/api/v1/orders', orderData);
      
      console.log('Order creation response:', response.data);

      if (response.data.status === 'success') {
        setOrderId(response.data.data.order._id);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate(`/orders/${response.data.data.order._id}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create order';
      console.error('Error details:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const SuccessDialog = () => (
    <Dialog open={showSuccess} onClose={() => setShowSuccess(false)}>
      <DialogTitle>Order Placed Successfully!</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Your order has been placed successfully. Order ID: {orderId}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          You will be redirected to your order details shortly...
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => navigate(`/orders/${orderId}`)}>
          View Order
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="street"
                value={formData.street}
                onChange={(e) => setFormData({...formData, street: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Zipcode"
                name="zipcode"
                value={formData.zipcode}
                onChange={(e) => setFormData({...formData, zipcode: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                >
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                  <MenuItem value="debit_card">Debit Card</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="net_banking">Net Banking</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 4 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Place Order'}
          </Button>
        </form>
      </Paper>
      <SuccessDialog />
    </Container>
  );
}