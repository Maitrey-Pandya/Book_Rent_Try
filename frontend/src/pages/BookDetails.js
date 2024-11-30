import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

export function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const response = await api.get(`/api/v1/books/${id}`);
      setBook(response.data.data.book);
    } catch (err) {
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }

  if (!book) return null;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <img
              src={book.coverImage || '/book-placeholder.png'}
              alt={book.title}
              style={{ width: '100%', borderRadius: 8 }}
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {book.title}
            </Typography>
            
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              By {book.author}
            </Typography>
            
            <Box display="flex" gap={1} mb={2}>
              {book.listingType === 'lease' && (
                <Chip label={`₹${book.price.lease.perDay}/day`} color="primary" variant="outlined" />
              )}
              {book.listingType === 'sale' && (
                <Chip label={`₹${book.price.sale}`} color="primary" variant="outlined" />
              )}
              <Chip 
                label={book.status} 
                color={book.status === 'available' ? 'success' : 'error'} 
              />
            </Box>

            <Typography variant="body1" paragraph>
              {book.description}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Details
              </Typography>
              <Typography>ISBN: {book.isbn}</Typography>
              <Typography>Condition: {book.condition}</Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
              {book.owner === user?.id ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/books/${id}/edit`)}
                >
                  Edit Listing
                </Button>
              ) : (
                book.status === 'available' && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/books/${id}/request`)}
                  >
                    {book.listingType === 'lease' ? 'Rent Now' : 'Buy Now'}
                  </Button>
                )
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}