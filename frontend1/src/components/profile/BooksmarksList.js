import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export function BookmarksList() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await api.get('/api/v1/bookmarks');
      setBookmarks(response.data.data.bookmarks);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await api.delete(`/api/v1/bookmarks/${bookmarkId}`);
      setBookmarks(bookmarks.filter(bookmark => bookmark._id !== bookmarkId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <Box textAlign="center" py={3}>
        <Typography color="text.secondary">
          No bookmarks yet. Start exploring books to add some!
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {bookmarks.map((bookmark) => (
        <Grid item xs={12} sm={6} md={4} key={bookmark._id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h6" gutterBottom>
                  {bookmark.book.title}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleRemoveBookmark(bookmark._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Typography color="text.secondary" gutterBottom>
                By {bookmark.book.author}
              </Typography>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => navigate(`/books/${bookmark.book._id}`)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}