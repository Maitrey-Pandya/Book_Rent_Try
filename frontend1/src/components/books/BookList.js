import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import { BookCard } from './BookCard';
import api from '../../api/axios';

export function BookList() {
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const searchParams = location.state?.searchParams || {};
        console.log('BookList received searchParams:', searchParams); // Debug log

        // Convert search params to query string
        const queryParams = new URLSearchParams();
        if (searchParams.query) queryParams.append('search', searchParams.query);
        if (searchParams.genre) queryParams.append('genre', searchParams.genre);
        if (searchParams.listingType) queryParams.append('listingType', searchParams.listingType.toLowerCase());

        console.log('Fetching books with query:', queryParams.toString()); // Debug log

        const response = await api.get(`/api/v1/books${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
        console.log('API Response:', response.data); // Debug log

        if (response.data.status === 'success') {
          setBooks(response.data.data.books);
        } else {
          setError('Failed to fetch books');
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err.message || 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [location.state]); // Re-fetch when search params change

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error ? (
        <Typography color="error" align="center" sx={{ mt: 2 }}>
          {error}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {books.length > 0 ? (
            books.map((book) => (
              <Grid item key={book._id} xs={12} sm={6} md={4} lg={3}>
                <BookCard book={book} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography align="center" sx={{ mt: 2 }}>
                No books found matching your criteria
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}