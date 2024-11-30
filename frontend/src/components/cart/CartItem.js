import {
    ListItem,
    ListItemText,
    IconButton,
    Typography,
    Box,
    TextField
  } from '@mui/material';
  import { Delete as DeleteIcon } from '@mui/icons-material';
  import { useState } from 'react';
  import api from '../../api/axios';
  
  export function CartItem({ item, onUpdate, onRemove }) {
    const [quantity, setQuantity] = useState(item.quantity);
    const [loading, setLoading] = useState(false);
  
    const handleQuantityChange = async (newQuantity) => {
      if (newQuantity < 1) return;
      setLoading(true);
      try {
        await api.patch(`/api/v1/cart/items/${item._id}`, {
          quantity: newQuantity
        });
        setQuantity(newQuantity);
        onUpdate();
      } catch (error) {
        console.error('Error updating quantity:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const calculateItemTotal = () => {
      if (item.type === 'rent') {
        const days = Math.ceil(
          (new Date(item.rentalDuration.endDate) - new Date(item.rentalDuration.startDate)) 
          / (1000 * 60 * 60 * 24)
        );
        return item.price * days * quantity;
      }
      return item.price * quantity;
    };
  
    return (
      <ListItem
        divider
        secondaryAction={
          <IconButton edge="end" onClick={() => onRemove(item._id)}>
            <DeleteIcon />
          </IconButton>
        }
      >
        <ListItemText
          primary={item.book.title}
          secondary={
            <Box>
              <Typography variant="body2" color="text.secondary">
                {item.type === 'rent' ? 'Rental' : 'Purchase'}
                {item.type === 'rent' && ` (${item.rentalDuration} days)`}
              </Typography>
              <Typography variant="body2">
                Price: ₹{item.price}
                {item.type === 'rent' && '/day'}
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mt={1}>
                <TextField
                  type="number"
                  size="small"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                  disabled={loading}
                  inputProps={{ min: 1 }}
                  sx={{ width: '80px' }}
                />
                <Typography variant="body1" fontWeight="bold">
                  Total: ₹{calculateItemTotal()}
                </Typography>
              </Box>
            </Box>
          }
        />
      </ListItem>
    );
  }