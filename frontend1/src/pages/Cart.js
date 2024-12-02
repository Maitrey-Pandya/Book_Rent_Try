import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, CircularProgress, Paper } from '@mui/material';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/cartSummary';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/assets/book_cover_template.jpg';
    
    if (imageUrl.includes('cloudinary')) {
      return imageUrl.replace('/upload/', '/upload/w_800,h_1200,c_fill,g_center,f_auto,q_auto/');
    }
    
    return imageUrl;
  };

  const fetchCart = async () => {
    try {
      const response = await api.get('/api/v1/cart');
      console.log("Cart Items:", response.data.data.cart.items);
      
      // Get book details for each cart item
      const cartWithBookDetails = {
        ...response.data.data.cart,
        items: await Promise.all(response.data.data.cart.items.map(async (item) => {
          try {
            const bookResponse = await api.get(`/api/v1/books/${item.book._id}`);
            return {
              ...item,
              book: bookResponse.data.data.book
            };
          } catch (error) {
            console.error('Error fetching book details:', error);
            return item;
          }
        }))
      };
      
      setCart(cartWithBookDetails);
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

  const handleCheckout = async () => {
    try {
      if (!cart?.items?.length) return;
      
      const response = await api.get('/api/v1/cart');
      const currentCart = response.data.data.cart;
      
      if (!currentCart?.items?.length) return;

      navigate('/checkout');
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
        <CircularProgress />
      </Box>
    );
  }

  if (!cart?.items?.length) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Looks like you haven't added any books to your cart yet.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'medium' }}>
        Shopping Cart ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            {cart.items.map((item) => (
              <Box key={item._id}>
                <CartItem
                  item={{
                    ...item,
                    book: {
                      ...item.book,
                      coverImage: getImageUrl(item.book.coverImage)
                    }
                  }}
                  onUpdate={fetchCart}
                  onRemove={handleRemoveItem}
                />
              </Box>
            ))}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box sx={{ position: { md: 'sticky' }, top: 24 }}>
            <CartSummary cart={cart} onCheckout={handleCheckout} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}