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
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      <Typography variant="body1">
        Total Items: {cart.items.length}
      </Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Total: ₹{calculateTotal()}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={onCheckout}
      >
        Proceed to Checkout
      </Button>
    </Paper>
  );
}