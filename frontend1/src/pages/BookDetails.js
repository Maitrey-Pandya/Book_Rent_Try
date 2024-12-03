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
  ButtonGroup,
  Dialog
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import  api  from '../api/axios';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { RentBookDialog } from '../components/books/RentBookDialog';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rentDialogOpen, setRentDialogOpen] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const response = await api.get(`/api/v1/books/${id}`);
      if (response.data.status === 'success') {
        const bookData = response.data.data.book;
        console.log(bookData);
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

  const handleRentClick = () => {
    setRentDialogOpen(true);
  };

  const handleRentDialogClose = (success = false) => {
    setRentDialogOpen(false);
    if (success) {
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    }
  };

  const handleAddToCart = async (type) => {
    try {
      if (type === 'rent') {
        handleRentClick();
        return;
      }

      const cartData = {
        bookId: book._id,
        quantity: 1,
        type: 'purchase'
      };

      const response = await api.post('/api/v1/cart/add', cartData);
      
      if (response.data.status === 'success') {
        setCartSuccess(true);
        setTimeout(() => setCartSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
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

  const handleDone = () => {
    navigate('/'); // Redirects to home page
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

  console.log('Book cover image URL:', book.coverImage);

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
              {/* ... rest of the pricing section ... */}
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
        
              <Chip label={book.genre} color="primary" />
            </Box>



            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom><strong>Book Details</strong></Typography>
              <Grid container spacing={2}>
                {/* Description - Full Width */}
                <Grid item xs={12}>
                  <Typography><strong>Description:</strong></Typography>
                  <Typography sx={{ mb: 2, pl: 2 }}>{book.description || 'No description available'}</Typography>
                </Grid>

                {/* Left Column */}
                <Grid item xs={6}>
                  <Typography><strong>ISBN:</strong> {book.isbn || 'N/A'}</Typography>
                  <Typography><strong>Genre:</strong> {book.genre || 'N/A'}</Typography>
                  <Typography><strong>Status:</strong> {book.status}</Typography>
                  <Typography><strong>Listed On:</strong> {new Date(book.createdAt).toLocaleDateString()}</Typography>
                  <Typography><strong>Condition:</strong> {book.condition || 'N/A'}</Typography>
                  {book.conditionDescription && (
                    <Typography>
                      <strong>Condition Details:</strong> {book.conditionDescription}
                    </Typography>
                  )}
                </Grid>

                {/* Right Column */}
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
                  
                  {['lease', 'both'].includes(book.listingType) && (
                    <>
                      <Typography sx={{ mt: 1 }}><strong>Lease Duration:</strong> {book.price?.lease?.minDuration || 1} - {book.price?.lease?.maxDuration || 'No limit'} days</Typography>
                      {book.leaseTerms && (
                        <Typography>
                          <strong>Lease Terms:</strong> {book.leaseTerms}
                        </Typography>
                      )}
                      {book.price?.lease?.securityDeposit && (
                        <Typography>
                          <strong>Security Deposit:</strong> ₹{book.price?.lease?.securityDeposit}
                        </Typography>
                      )}
                    </>
                  )}
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', gap: 2, flexDirection: 'column' }}>
              {book.uploader?._id === user?.id ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDone}
                  sx={{ 
                    width: 'fit-content',
                    bgcolor: 'success.main',
                    '&:hover': {
                      bgcolor: 'success.dark',
                    }
                  }}
                >
                  Done
                </Button>
              ) : (
                book.status === 'available' && (
                  <>
                    {book.listingType === 'both' ? (
                      <>
                        <ButtonGroup variant="contained" sx={{ width: 'fit-content' }}>
                          <Button
                            onClick={() => handleAddToCart('purchase')}
                            startIcon={<ShoppingCartIcon />}
                            color="primary"
                          >
                            Add to Cart as Buy
                          </Button>
                          <Button
                            onClick={() => handleAddToCart('rent')}
                            startIcon={<ShoppingCartIcon />}
                            color="secondary"
                          >
                            Add to Cart as Rent
                          </Button>
                        </ButtonGroup>
                      </>
                    ) : (
                      <>
                        {book.listingType === 'sale' && (
                          <Button
                            onClick={() => handleAddToCart('purchase')}
                            startIcon={<ShoppingCartIcon />}
                            color="primary"
                            variant="contained"
                            sx={{ width: 'fit-content' }}
                          >
                            Add to Cart
                          </Button>
                        )}
                        {book.listingType === 'lease' && (
                          <Button
                            onClick={() => handleAddToCart('rent')}
                            startIcon={<ShoppingCartIcon />}
                            color="secondary"
                            variant="contained"
                            sx={{ width: 'fit-content' }}
                          >
                            Add to Rent Cart
                          </Button>
                        )}
                      </>
                    )}
                  </>
                )
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        {/* ... existing dialog content ... */}
      </Dialog>

      <RentBookDialog
        book={book}
        open={rentDialogOpen}
        onClose={handleRentDialogClose}
      />

      {cartSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Item added to cart successfully!
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
}