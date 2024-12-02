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
      console.log('Raw order data:', response.data.data.orders);
      
      if (!response.data?.data?.orders) {
        console.error('Invalid response structure:', response.data);
        setTransactions([]);
        return;
      }
      
      const processedOrders = response.data.data.orders.map(order => {
        if (!order || !order.items) {
          console.error('Invalid order structure:', order);
          return null;
        }
        
        return {
          ...order,
          _id: order._id || 'unknown',
          items: order.items.map(item => {
            if (!item) return null;
            return {
              ...item,
              _id: item._id || 'unknown',
              book: item.book || {},
              seller: item.seller || item.book?.seller || {}
            };
          }).filter(Boolean)
        };
      }).filter(Boolean);
      
      console.log('Processed orders:', processedOrders);
      setTransactions(processedOrders || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      setTransactions([]);
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
    console.log('Transaction received:', transaction);
    
    if (!transaction || !transaction._id) {
      console.error('Invalid transaction:', transaction);
      return;
    }

    const firstItem = transaction.items?.[0];
    console.log('First item:', firstItem);
    
    if (!firstItem) {
      console.error('No items in transaction:', transaction);
      return;
    }

    const uploader = firstItem.book?.uploader;
    console.log('Uploader found:', uploader);
    
    if (!uploader || !uploader._id) {
      console.error('No uploader found:', { firstItem, uploader });
      return;
    }

    const ratingDialogData = {
      open: true,
      transaction: {
        _id: transaction._id,
        items: [{
          book: {
            uploader: {
              _id: uploader._id,
              name: uploader.name || 'Unknown Uploader',
              email: uploader.email || ''
            }
          }
        }],
        hasRated: transaction.hasRated || false
      }
    };

    console.log('Setting rating dialog with:', ratingDialogData);
    setRatingDialog(ratingDialogData);
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
            {transactions.map((order) => order && (
              <TableRow key={order._id || Math.random()}>
                <TableCell>{order.createdAt ? formatDate(order.createdAt) : 'N/A'}</TableCell>
                <TableCell>{order._id ? order._id.slice(-6) : 'N/A'}</TableCell>
                <TableCell>
                  {order.items?.map((item, index) => item && (
                    <Box key={item._id || `${index}-${Math.random()}`}>
                      <Typography variant="body2">
                        {item.quantity || 0}x {item.book?.title || 'Unknown Book'}
                      </Typography>
                    </Box>
                  ))}
                </TableCell>
                <TableCell>₹{order.totalAmount || 0}</TableCell>
                <TableCell>
                  <Chip 
                    label={(order.status || 'unknown').toUpperCase()} 
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
                    <Rating value={(order.rating || 0) / 20} readOnly size="small" />
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