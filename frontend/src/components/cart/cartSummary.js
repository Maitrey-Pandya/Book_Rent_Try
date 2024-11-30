import { Paper, Typography, Box, Button, Divider } from '@mui/material';

export function CartSummary({ cart, onCheckout }) {
  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      if (item.type === 'rent') {
        const days = Math.ceil(
          (new Date(item.rentalDuration.endDate) - new Date(item.rentalDuration.startDate)) 
          / (1000 * 60 * 60 * 24)
        );
        return total + (item.price * days * item.quantity);
      }
      return total + (item.price * item.quantity);
    }, 0);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      <Box my={2}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>Subtotal</Typography>
          <Typography>₹{calculateTotal()}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography>Delivery</Typography>
          <Typography>Free</Typography>
        </Box>
      </Box>
      <Divider />
      <Box display="flex" justifyContent="space-between" my={2}>
        <Typography variant="h6">Total</Typography>
        <Typography variant="h6">₹{calculateTotal()}</Typography>
      </Box>
      <Button 
        variant="contained" 
        color="primary" 
        fullWidth
        onClick={onCheckout}
      >
        Proceed to Checkout
      </Button>
    </Paper>
  );
}