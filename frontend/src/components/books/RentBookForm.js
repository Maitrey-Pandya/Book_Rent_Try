import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Input,
  FormHelperText,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export function RentBookForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bookName: '',
    isbn: '',
    price: '',
    bookPhoto: null
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, bookPhoto: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.bookName);
      formDataToSend.append('isbn', formData.isbn);
      formDataToSend.append('rentPrice', formData.price);
      formDataToSend.append('image', formData.bookPhoto);

      await api.post('/api/v1/books/rent', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting form');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Book Name"
            required
            value={formData.bookName}
            onChange={(e) => setFormData({ ...formData, bookName: e.target.value })}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="ISBN"
            required
            value={formData.isbn}
            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            label="Price (per week)"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </Grid>

        <Grid item xs={12}>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            sx={{ display: 'none' }}
            id="book-photo-input"
          />
          <label htmlFor="book-photo-input">
            <Button variant="contained" component="span">
              Upload Book Photo
            </Button>
          </label>
          <FormHelperText>
            Please upload a clear photo showcasing the condition of the book
          </FormHelperText>
        </Grid>

        {preview && (
          <Grid item xs={12}>
            <Box sx={{ mt: 2, mb: 2 }}>
              <img 
                src={preview} 
                alt="Book preview" 
                style={{ maxWidth: '200px', display: 'block', margin: '0 auto' }}
              />
            </Box>
          </Grid>
        )}

        {error && (
          <Grid item xs={12}>
            <Typography color="error">{error}</Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button type="submit" variant="contained" fullWidth>
            Submit
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}