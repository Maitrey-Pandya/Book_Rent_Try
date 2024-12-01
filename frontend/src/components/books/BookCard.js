import { Card, CardContent, CardMedia, Typography, Box, Chip, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

export function BookCard({ book }) {
  return (
    <Card component={Link} to={`/books/${book._id}`} sx={{ 
      textDecoration: 'none',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <CardMedia
        component="img"
        height="200"
        image={book.coverImage || '/assets/book_cover_template.jpg'}
        alt={book.title}
      />
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

        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Rating: {book.rating}/5 ({book.totalRatings} reviews)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}