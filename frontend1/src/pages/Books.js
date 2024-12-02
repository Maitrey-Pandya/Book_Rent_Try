import { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import { useLocation, useSearchParams } from 'react-router-dom';
import { BookList } from '../components/books/BookList';
import api from '../api/axios';

export function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams(searchParams);
      queryParams.append('_t', Date.now().toString());

      console.group('=== Books Fetch Request ===');
      console.log('API Base URL:', api.defaults.baseURL);
      console.log('Current search params:', Object.fromEntries(searchParams));
      console.log('Full request URL:', `${api.defaults.baseURL}/api/v1/books?${queryParams}`);
      console.groupEnd();

      const response = await api.get(`/api/v1/books?${queryParams}`, {
      
        timeout: 5000
      });
      
      console.group('=== Books Fetch Response ===');
      console.log('Status:', response.status);
      console.log('Total books received:', response.data.data.books.length);
      console.log('Sample book:', response.data.data.books[0]);
      console.groupEnd();

      setBooks(response.data.data.books);
    } catch (error) {
      console.group('=== Books Fetch Error ===');
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code,
        stack: error.stack
      });
      
      if (error.isAxiosError) {
        console.error('Axios Error:', {
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            baseURL: error.config?.baseURL
          },
          request: error.request ? 'Request was made but no response received' : 'Request setup failed'
        });
      }
      console.groupEnd();

      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch books. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('SearchParams changed, triggering fetch');
    fetchBooks();
  }, [searchParams]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {searchParams.get('search') ? `Search Results for "${searchParams.get('search')}"` : 'Available Books'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <BookList 
        books={books} 
        loading={loading} 
        onBookmark={fetchBooks}
      />
    </Container>
  );
}