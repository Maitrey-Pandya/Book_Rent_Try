import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, CircularProgress } from '@mui/material';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/cartSummary';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const response = await api.get('/api/v1/cart');
      setCart(response.data.data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemoveItem = async (itemId) => {
    try {
      await api.delete(`/api/v1/cart/items/${itemId}`);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!cart?.items?.length) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          Your cart is empty
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {cart.items.map((item) => (
            <CartItem
              key={item._id}
              item={item}
              onUpdate={fetchCart}
              onRemove={handleRemoveItem}
            />
          ))}
        </Grid>
        <Grid item xs={12} md={4}>
          <CartSummary cart={cart} onCheckout={handleCheckout} />
        </Grid>
      </Grid>
    </Container>
  );
}