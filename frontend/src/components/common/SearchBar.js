import { styled } from '@mui/material/styles';
import { InputBase, IconButton, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';

const SearchWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(0, 0, 0, 0.05)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.25)'
      : 'rgba(0, 0, 0, 0.1)',
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
    minWidth: '300px',
  },
}));

export function SearchBar({ onSearch, placeholder = 'Search...', initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <SearchWrapper>
      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
        <InputBase
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ 
            ml: 2, 
            flex: 1,
            color: 'inherit',
            '& .MuiInputBase-input': {
              padding: '8px 0',
            }
          }}
        />
        <IconButton type="submit" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </form>
    </SearchWrapper>
  );
}