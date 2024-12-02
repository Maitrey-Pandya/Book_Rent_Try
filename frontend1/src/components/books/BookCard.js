import { Card, CardContent, CardMedia, Typography, Box, Chip, Stack, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function BookCard({ book }) {
  const { isPublisher } = useAuth();

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/assets/book_cover_template.jpg';
    
    if (imageUrl.includes('cloudinary')) {
      return imageUrl.replace('/upload/', '/upload/w_400,h_600,c_fill,g_center,f_auto,q_auto/');
    }
    
    return imageUrl;
  };

  return (
    <Card 
      component={Link} 
      to={`/books/${book._id}`} 
      sx={{ 
        textDecoration: 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 3
        }
      }}
    >
      <Box sx={{ 
        position: 'relative',
        paddingTop: '150%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.03)'
      }}>
        <CardMedia
          component="img"
          image={getImageUrl(book.coverImage)}
          alt={book.title}
          onError={(e) => {
            console.log('Image load error:', book.title);
            e.target.onerror = null;
            e.target.src = '/assets/book_cover_template.jpg';
          }}
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          By {book.author}
        </Typography>
        
        <Stack direction="row" spacing={1} mb={1}>
          <Chip 
            label={book.genre} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
          <Chip 
            label={book.status} 
            size="small"
            color={book.status === 'available' ? 'success' : 'error'}
          />
        </Stack>

        {!isPublisher() && (
          <Box sx={{ mt: 1 }}>
            {book.listingType === 'sale' && (
              <Typography variant="body2">
                Price: ₹{book.price.sale}
              </Typography>
            )}
            {book.listingType === 'lease' && (
              <Typography variant="body2">
                Rent: ₹{book.price.lease.perDay}/day
              </Typography>
            )}
            {book.listingType === 'both' && (
              <>
                <Typography variant="body2">
                  Buy: ₹{book.price.sale}
                </Typography>
                <Typography variant="body2">
                  Rent: ₹{book.price.lease.perDay}/day
                </Typography>
              </>
            )}
          </Box>
        )}

<Stack spacing={1} sx={{ mt: 2 }}>
          {['sale', 'both'].includes(book.listingType) && (
            <Chip 
              label={`Sale: ₹${book.price?.sale}`}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
          
          {['lease', 'both'].includes(book.listingType) && (
            <>
              <Chip 
                label={`Rent: ₹${book.price?.lease?.perDay}/day`}
                color="primary"
                variant="outlined"
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                Rental Duration: {book.price?.lease?.minDuration || 1} - {book.price?.lease?.maxDuration || 'No limit'} days
              </Typography>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
