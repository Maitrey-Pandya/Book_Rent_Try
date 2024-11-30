import { Grid, Box, CircularProgress, Typography } from '@mui/material';
import { BookCard } from './BookCard';

export function BookList({ books, loading, onBookmark }) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!books || books.length === 0) {
    return (
      <Box textAlign="center" py={3}>
        <Typography color="text.secondary">
          No books found.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={4}>
      {books.map((book) => (
        <Grid item key={book._id} xs={12} sm={6} md={4} lg={3}>
          <BookCard book={book} onBookmark={onBookmark} />
        </Grid>
      ))}
    </Grid>
  );
}