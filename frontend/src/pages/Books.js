import { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { BookList } from '../components/books/BookList';
import api from '../api/axios';

export function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const fetchBooks = async () => {
    try {
      const response = await api.get(`/api/v1/books?search=${searchQuery}`);
      setBooks(response.data.data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchQuery]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {searchQuery ? `Search Results for "${searchQuery}"` : 'Available Books'}
      </Typography>
      <BookList 
        books={books} 
        loading={loading} 
        onBookmark={fetchBooks}
      />
    </Container>
  );
}