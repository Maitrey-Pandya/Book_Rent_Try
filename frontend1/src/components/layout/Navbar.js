import { useState } from 'react';
import { 
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SearchBar } from '../common/SearchBar';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleSearch = (searchParams) => {
    console.log('Navbar search:', searchParams); // Debug log
    if (searchParams.query || searchParams.genre || searchParams.listingType) {
      navigate('/books', { 
        state: { searchParams },
        replace: true 
      });
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ cursor: 'pointer', mr: 2 }}
          onClick={() => navigate('/')}
        >
          Book Swap and Lease
        </Typography>

        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          justifyContent: 'center',
          maxWidth: '800px', // Limit width of search bar
          mx: 'auto' // Center in available space
        }}>
          <SearchBar 
            onSearch={handleSearch} 
            variant="navbar"
            key={location.pathname} // Force re-render on route change
          />
        </Box>

        {user ? (
          <>
            <IconButton onClick={handleMenu} color="inherit">
              <Avatar src="/assets/user_photo_template.webp" alt={user.name} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                Profile
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/bookmarks'); }}>
                Bookmarks
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/rent-book'); }}>
                Rent Your Book
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button color="inherit" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;