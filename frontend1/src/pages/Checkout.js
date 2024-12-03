import { useState, useEffect } from 'react';
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
    
    // Log form data
    console.log('Form Data:', {
      street: formData.street || 'undefined',
      city: formData.city || 'undefined',
      state: formData.state || 'undefined',
      zipcode: formData.zipcode || 'undefined',
      country: formData.country || 'undefined',
      paymentMethod: formData.paymentMethod || 'undefined'
    });

    try {
      // First validate the form data
      if (!formData.street || !formData.city || !formData.state || !formData.zipcode) {
        throw new Error('Please fill in all required fields');
      }

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

      // Log order data before sending
      console.log('Order Data to be sent:', orderData);
      
      const response = await api.post('/api/v1/orders', orderData);
      
      // Detailed response logging
      console.log('Full API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      // Specific order data logging
      console.log('Order Data:', {
        orderId: response.data?.data?.order?._id,
        items: response.data?.data?.order?.items?.map(item => ({
          bookId: item.book?._id,
          bookTitle: item.book?.title,
          quantity: item.quantity,
          price: item.price,
          seller: {
            id: item.seller?._id,
            name: item.seller?.name,
            email: item.seller?.email,
            // Backup seller info from book
            bookSellerId: item.book?.seller?._id,
            bookSellerName: item.book?.seller?.name,
            bookSellerEmail: item.book?.seller?.email
          }
        })) || 'No items found'
      });

      // Log raw items for debugging
      console.log('Raw order items:', response.data?.data?.order?.items);

      if (!response.data || response.data.status !== 'success' || !response.data.data?.order?._id) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response from server');
      }

      const orderId = response.data.data.order._id;
      setOrderId(orderId);
      setShowSuccess(true);
      
      // Delay navigation to ensure success message is shown
      setTimeout(() => {
        setShowSuccess(false);
        navigate(`/orders/${orderId}`);
      }, 3000);

    } catch (error) {
      console.error('Order creation error:', error);
      let errorMessage = 'Failed to create order';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add a check for database connection in the component
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await api.get('/api/v1/health-check');
      } catch (error) {
        console.error('Database connection error:', error);
        setError('Unable to connect to the server. Please try again later.');
      }
    };

    checkConnection();
  }, []);

  // Update the success dialog to handle null orderId
  const SuccessDialog = () => (
    <Dialog 
      open={showSuccess} 
      onClose={() => setShowSuccess(false)}
    >
      <DialogTitle>Order Placed Successfully!</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Your order has been placed successfully.
          {orderId && ` Order ID: ${orderId}`}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          You will be redirected to your order details shortly...<br/>
          You can view your order details in Transaction History.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => orderId ? navigate(`/orders/${orderId}`) : setShowSuccess(false)}
        >
          {orderId ? 'Done' : 'Close'}
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