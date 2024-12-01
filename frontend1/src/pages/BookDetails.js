import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Chip,
  Alert,
  CircularProgress,
  ButtonGroup
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import  api  from '../api/axios';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

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
      if (response.data.status === 'success') {
        const bookData = response.data.data.book;
        setBook(Array.isArray(bookData) ? bookData[0] : bookData);
      } else {
        setError('Failed to load book details');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (type) => {
    try {
      const currentDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const cartData = {
        bookId: book._id,
        quantity: 1,
        type: type,
        rentalDuration: type === 'rent' ? {
          startDate: currentDate,
          endDate: endDate
        } : undefined
      };

      console.log('Adding to cart:', cartData);
      const response = await api.post('/api/v1/cart/add', cartData);
      console.log('Add to cart response:', response.data);
      
      if (response.data.status === 'success') {
        alert('Added to cart successfully!');
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error.response || error);
      setError(error.response?.data?.message || 'Failed to add item to cart');
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/assets/book_cover_template.jpg';
    
    if (imageUrl.includes('cloudinary')) {
      return imageUrl.replace('/upload/', '/upload/w_800,h_1200,c_fill,g_center,f_auto,q_auto/');
    }
    
    return imageUrl;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMMM dd, yyyy');
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
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: '500px',
                margin: '0 auto',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: 3,
                '&::before': {
                  content: '""',
                  display: 'block',
                  paddingTop: '150%'
                }
              }}
            >
              <img
                src={getImageUrl(book.coverImage)}
                alt={book.title}
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: 'rgba(0,0,0,0.03)'
                }}
                onError={(e) => {
                  console.log('Image load error in details page');
                  e.target.onerror = null;
                  e.target.src = '/assets/book_cover_template.jpg';
                }}
              />
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Pricing</Typography>
              {['sale', 'both'].includes(book.listingType) && (
                <Chip 
                  label={`Sale Price: ₹${book.price?.sale}`} 
                  color="primary" 
                  variant="outlined"
                  sx={{ mb: 1, width: '100%' }}
                />
              )}
              {['lease', 'both'].includes(book.listingType) && (
                <>
                  <Chip 
                    label={`Rent: ₹${book.price?.lease?.perMonth}/month`} 
                    color="primary" 
                    variant="outlined"
                    sx={{ mb: 1, width: '100%' }}
                  />
                  <Typography variant="body2">
                    Rental Duration: {book.price?.lease?.minDuration || 1} - {book.price?.lease?.maxDuration || 'No limit'} months
                  </Typography>
                </>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>{book.title}</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              By {book.author}
            </Typography>
            
            <Box display="flex" gap={1} mb={2}>
              <Chip 
                label={book.status} 
                color={book.status === 'available' ? 'success' : 'error'} 
              />
              <Chip 
                label={`${book.rating}/5 (${book.totalRatings} reviews)`} 
                variant="outlined" 
              />
              <Chip label={book.genre} color="primary" />
            </Box>

            <Typography variant="body1" paragraph>{book.description}</Typography>

            {['lease', 'both'].includes(book.listingType) && book.leaseTerms && (
              <Box sx={{ mt: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Lease Terms</Typography>
                <Typography variant="body2">{book.leaseTerms}</Typography>
              </Box>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Book Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography><strong>ISBN:</strong> {book.isbn || 'N/A'}</Typography>
                  <Typography><strong>Genre:</strong> {book.genre || 'N/A'}</Typography>
                  <Typography><strong>Status:</strong> {book.status}</Typography>
                  <Typography><strong>Listed On:</strong> {formatDate(book.createdAt)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>
                    <strong>Publisher:</strong> {
                      book.uploaderType === 'Publisher' 
                        ? book.uploader?.publisherName || book.uploader?.name
                        : book.publisher?.publisherName || book.publisher?.name || 'N/A'
                    }
                  </Typography>
                  <Typography>
                    <strong>Uploaded by:</strong> {
                      book.uploaderType === 'Publisher'
                        ? book.uploader?.publisherName || book.uploader?.name
                        : book.uploader?.name || 'N/A'
                    }
                  </Typography>
                  <Typography><strong>Listing Type:</strong> {book.listingType}</Typography>
                  <Typography><strong>Condition:</strong> {book.condition || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {book.uploader?._id === user?.id ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/books/${id}/edit`)}
                >
                  Edit Listing
                </Button>
              ) : (
                book.status === 'available' && (
                  <>
                    <ButtonGroup variant="contained">
                      {['sale', 'both'].includes(book.listingType) && (
                        <Button
                          onClick={() => handleAddToCart('purchase')}
                          startIcon={<ShoppingCartIcon />}
                        >
                          Buy Now
                        </Button>
                      )}
                      {['lease', 'both'].includes(book.listingType) && (
                        <Button
                          onClick={() => handleAddToCart('rent')}
                          startIcon={<ShoppingCartIcon />}
                        >
                          Rent Now
                        </Button>
                      )}
                    </ButtonGroup>
                    
                    <ButtonGroup variant="outlined">
                      {['sale', 'both'].includes(book.listingType) && (
                        <Button
                          onClick={() => handleAddToCart('purchase')}
                          startIcon={<ShoppingCartIcon />}
                        >
                          Add to Cart
                        </Button>
                      )}
                      {['lease', 'both'].includes(book.listingType) && (
                        <Button
                          onClick={() => handleAddToCart('rent')}
                          startIcon={<ShoppingCartIcon />}
                        >
                          Add to Rent Cart
                        </Button>
                      )}
                    </ButtonGroup>
                  </>
                )
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}