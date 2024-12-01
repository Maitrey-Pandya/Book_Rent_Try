import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
  Chip,
  Button,
  Rating
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import api from '../../api/axios';
import { UserRating } from './UserRating';

export function TransactionHistoryTable() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingDialog, setRatingDialog] = useState({
    open: false,
    transaction: null
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/v1/orders');
      console.log('Fetched transactions:', response.data.data.orders);
      setTransactions(response.data.data.orders);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'error',
      returned: 'default'
    };
    return colors[status] || 'default';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRateClick = (transaction) => {
    setRatingDialog({
      open: true,
      transaction
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (transactions.length === 0) {
    return (
      <Box textAlign="center" py={3}>
        <Typography color="text.secondary">
          No transactions found.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Date</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>{order._id.slice(-6)}</TableCell>
                <TableCell>
                  {order.items.map((item, index) => (
                    <Box key={item._id}>
                      <Typography variant="body2">
                        {item.quantity}x {item.book?.title}
                      </Typography>
                    </Box>
                  ))}
                </TableCell>
                <TableCell>₹{order.totalAmount}</TableCell>
                <TableCell>
                  <Chip 
                    label={order.status.toUpperCase()} 
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {order.status === 'delivered' && !order.hasRated && (
                    <Button
                      startIcon={<StarIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => handleRateClick(order)}
                    >
                      Rate Seller
                    </Button>
                  )}
                  {order.hasRated && (
                    <Rating value={order.rating} readOnly size="small" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <UserRating
        open={ratingDialog.open}
        onClose={() => setRatingDialog({ open: false, transaction: null })}
        transaction={ratingDialog.transaction}
        onRatingSubmit={fetchTransactions}
      />
    </>
  );
}