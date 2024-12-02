import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Input,
  FormHelperText,
  InputAdornment,
  Typography,
  Autocomplete,
  Chip
} from '@mui/material';
import api from '../../api/axios';

const GENRE_OPTIONS = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Horror',
  'Biography',
  'History',
  'Science',
  'Technology',
  'Self-Help',
  'Children',
  'Other'
];

export function RentBookForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    genre: [],
    condition: '',
    listingType: 'lease',
    leaseTerms: '',
    price: {
      sale: 0,
      lease: {
        perDay: 0,
        minDuration: 1,
        maxDuration: 30,
        deposit: 0
      }
    }
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, coverImage: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePriceChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      price: {
        ...prev.price,
        [type]: field ? { ...prev.price[type], [field]: value } : value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        description: formData.description,
        genre: formData.genre.length > 0 ? formData.genre[0] : '',
        condition: formData.condition,
        listingType: formData.listingType,
        leaseTerms: formData.leaseTerms,
        price: {
          sale: formData.listingType === 'sale' || formData.listingType === 'both' 
            ? Number(formData.price.sale) 
            : undefined,
          lease: formData.listingType === 'lease' || formData.listingType === 'both' 
            ? {
                perDay: Number(formData.price.lease.perDay),
                minDuration: Number(formData.price.lease.minDuration),
                maxDuration: Number(formData.price.lease.maxDuration),
                deposit: Number(formData.price.lease.deposit)
              }
            : undefined
        }
      };

      if (!bookData.price.sale) delete bookData.price.sale;
      if (!bookData.price.lease) delete bookData.price.lease;
      if (!bookData.leaseTerms) delete bookData.leaseTerms;

      console.log('Book data before sending:', bookData);

      const formDataToSend = new FormData();
      formDataToSend.append('bookData', JSON.stringify(bookData));
      
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage);
      }

      const response = await api.post('/api/v1/books', formDataToSend, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      if (response.data.status === 'success') {
        navigate(`/books/${response.data.data.book._id}`);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || 'Error adding book');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Book Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Author"
            required
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="ISBN"
            required
            value={formData.isbn}
            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
          />
        </Grid>

        {/* Additional Details */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            options={GENRE_OPTIONS}
            value={formData.genre}
            onChange={(event, newValue) => {
              setFormData(prev => ({
                ...prev,
                genre: newValue
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Genres"
                required
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                  color="primary"
                  variant="outlined"
                />
              ))
            }
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Condition"
            required
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
          />
        </Grid>

        {/* Listing Type and Pricing */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Listing Type</InputLabel>
            <Select
              value={formData.listingType}
              label="Listing Type"
              onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
            >
              <MenuItem value="lease">Rent Only</MenuItem>
              <MenuItem value="sale">Sale Only</MenuItem>
              <MenuItem value="both">Both Rent and Sale</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {(formData.listingType === 'lease' || formData.listingType === 'both') && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rent per Day"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                value={formData.price.lease.perDay}
                onChange={(e) => handlePriceChange('lease', 'perDay', Number(e.target.value))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Security Deposit"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                value={formData.price.lease.deposit}
                onChange={(e) => handlePriceChange('lease', 'deposit', Number(e.target.value))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Rental Duration (days)"
                type="number"
                value={formData.price.lease.minDuration}
                onChange={(e) => handlePriceChange('lease', 'minDuration', Number(e.target.value))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Rental Duration (days)"
                type="number"
                value={formData.price.lease.maxDuration}
                onChange={(e) => handlePriceChange('lease', 'maxDuration', Number(e.target.value))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Book Condition"
                required
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lease Terms"
                multiline
                rows={4}
                value={formData.leaseTerms}
                onChange={(e) => setFormData({ ...formData, leaseTerms: e.target.value })}
                required
                helperText="Please specify rental conditions, deposit details, return policy, etc."
              />
            </Grid>
          </>
        )}

        {(formData.listingType === 'sale' || formData.listingType === 'both') && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Sale Price"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              value={formData.price.sale}
              onChange={(e) => handlePriceChange('sale', null, e.target.value)}
              required
            />
          </Grid>
        )}

        {/* Image Upload */}
        <Grid item xs={12}>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            sx={{ display: 'none' }}
            id="cover-image-input"
          />
          <label htmlFor="cover-image-input">
            <Button variant="contained" component="span">
              Upload Cover Image
            </Button>
          </label>
          <FormHelperText>
            Please upload a clear photo of the book cover
          </FormHelperText>
        </Grid>

        {preview && (
          <Grid item xs={12}>
            <Box sx={{ mt: 2, mb: 2 }}>
              <img 
                src={preview} 
                alt="Cover preview" 
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
            List Book
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}