import { Badge, Fab, Tooltip } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api/axios';

export function CartButton() {
  const navigate = useNavigate();
  const [itemCount, setItemCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      const response = await api.get('/api/v1/cart');
      if (response.data.status === 'success') {
        setItemCount(response.data.data.cart?.items?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  useEffect(() => {
    fetchCartCount();
    // Refresh cart count every minute
    const interval = setInterval(fetchCartCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tooltip title="View Cart">
      <Fab
        color="primary"
        onClick={() => navigate('/cart')}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          '&:hover': {
            transform: 'scale(1.1)',
            transition: 'transform 0.2s'
          }
        }}
      >
        <Badge 
          badgeContent={itemCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              right: 5,
              top: 5,
            }
          }}
        >
          <ShoppingCartIcon />
        </Badge>
      </Fab>
    </Tooltip>
  );
}