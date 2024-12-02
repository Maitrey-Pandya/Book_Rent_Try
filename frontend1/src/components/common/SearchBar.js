import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const GENRE_OPTIONS = [
  'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery',
  'Thriller', 'Romance', 'Horror', 'Biography', 'History',
  'Science', 'Technology', 'Self-Help', 'Children', 'Other'
];

const LISTING_TYPES = [
  { value: 'sale', label: 'For Sale' },
  { value: 'lease', label: 'For Rent' },
  { value: 'both', label: 'Both' }
];

export function SearchBar({ onSearch, variant = 'standard' }) {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useState({
    query: '',
    genre: '',
    listingType: '',
    sortBy: ''
  });

  const handleQueryChange = (e) => {
    setSearchParams(prev => ({
      ...prev,
      query: e.target.value
    }));
  };

  const handleFilterChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('SearchBar submit:', searchParams);
    onSearch(searchParams);
  };

  // Navbar variant styling
  if (variant === 'navbar') {
    return (
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          backgroundColor: alpha(theme.palette.common.white, 0.15),
          borderRadius: 1,
          px: 2,
          py: 0.5,
          width: '100%',
          '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
          },
        }}
      >
        <TextField
          size="small"
          placeholder="Search books..."
          value={searchParams.query}
          onChange={handleQueryChange}
          sx={{
            flexGrow: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'transparent',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'transparent',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
              '&::placeholder': {
                color: alpha(theme.palette.common.white, 0.7),
                opacity: 1,
              },
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={searchParams.genre}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            displayEmpty
            sx={{
              color: 'white',
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
              '.MuiSvgIcon-root': { color: 'white' },
            }}
          >
            <MenuItem value="">All Genres</MenuItem>
            {GENRE_OPTIONS.map((genre) => (
              <MenuItem key={genre} value={genre}>{genre}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={searchParams.listingType}
            onChange={(e) => handleFilterChange('listingType', e.target.value)}
            displayEmpty
            sx={{
              color: 'white',
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
              '.MuiSvgIcon-root': { color: 'white' },
            }}
          >
            <MenuItem value="">All Types</MenuItem>
            {LISTING_TYPES.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          sx={{
            bgcolor: alpha(theme.palette.common.white, 0.15),
            color: 'white',
            '&:hover': {
              bgcolor: alpha(theme.palette.common.white, 0.25),
            },
          }}
        >
          <SearchIcon />
        </Button>
      </Box>
    );
  }

  // Standard variant
  return (
    <Paper component="form" onSubmit={handleSubmit} elevation={3} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search by title, author, or ISBN..."
          value={searchParams.query}
          onChange={handleQueryChange}
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Genre</InputLabel>
          <Select
            value={searchParams.genre}
            label="Genre"
            onChange={(e) => handleFilterChange('genre', e.target.value)}
          >
            <MenuItem value="">All Genres</MenuItem>
            {GENRE_OPTIONS.map((genre) => (
              <MenuItem key={genre} value={genre}>{genre}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={searchParams.listingType}
            label="Type"
            onChange={(e) => handleFilterChange('listingType', e.target.value)}
          >
            <MenuItem value="">All Types</MenuItem>
            {LISTING_TYPES.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          type="submit"
        >
          Search
        </Button>
      </Box>
    </Paper>
  );
}

export default SearchBar;