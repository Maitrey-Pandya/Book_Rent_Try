import { 
    Card, 
    CardContent, 
    CardMedia, 
    Typography, 
    Button, 
    Box,
    IconButton,
    Chip
  } from '@mui/material';
  import { 
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon,
    ShoppingCart as ShoppingCartIcon 
  } from '@mui/icons-material';
  import { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import api from '../../api/axios';
  
  export function BookCard({ book, onBookmark }) {
    const navigate = useNavigate();
    const [isBookmarked, setIsBookmarked] = useState(book.isBookmarked);
  
    const handleAddToCart = async () => {
      try {
        await api.post('/api/v1/cart', {
          bookId: book._id,
          quantity: 1,
          type: book.listingType === 'lease' ? 'rent' : 'purchase',
          rentalDuration: book.listingType === 'lease' ? 7 : undefined // default 1 week
        });
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    };
  
    const handleBookmark = async () => {
      try {
        if (isBookmarked) {
          await api.delete(`/api/v1/bookmarks/${book._id}`);
        } else {
          await api.post('/api/v1/bookmarks', { bookId: book._id });
        }
        setIsBookmarked(!isBookmarked);
        if (onBookmark) onBookmark();
      } catch (error) {
        console.error('Error toggling bookmark:', error);
      }
    };
  
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          height="200"
          image={book.coverImage || '/book-placeholder.png'}
          alt={book.title}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Typography gutterBottom variant="h6" component="h2">
              {book.title}
            </Typography>
            <IconButton onClick={handleBookmark} size="small">
              {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
            </IconButton>
          </Box>
          
          <Typography color="text.secondary" gutterBottom>
            By {book.author}
          </Typography>
  
          <Box display="flex" gap={1} mb={2}>
            {book.listingType === 'lease' && (
              <Chip label={`₹${book.price.lease.perDay}/day`} color="primary" variant="outlined" />
            )}
            {book.listingType === 'sale' && (
              <Chip label={`₹${book.price.sale}`} color="primary" variant="outlined" />
            )}
            <Chip label={book.status} color={book.status === 'available' ? 'success' : 'error'} />
          </Box>
  
          <Box display="flex" gap={1}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => navigate(`/books/${book._id}`)}
            >
              View Details
            </Button>
            {book.status === 'available' && (
              <IconButton 
                color="primary" 
                onClick={handleAddToCart}
                title="Add to Cart"
              >
                <ShoppingCartIcon />
              </IconButton>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }