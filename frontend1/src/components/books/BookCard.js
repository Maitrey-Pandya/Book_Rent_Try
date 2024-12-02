import { Card, CardContent, CardMedia, Typography, Box, Chip, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

export function BookCard({ book }) {
  return (
    <Card 
      component={Link} 
      to={`/books/${book._id}`}
      sx={{ 
        textDecoration: 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: '0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 3
        }
      }}
    >
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
          by {book.author}
        </Typography>
        
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