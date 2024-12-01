import { 
    Box, 
    Typography, 
    Button, 
    Container
  } from '@mui/material';
  import { useNavigate } from 'react-router-dom';
  
  export function PublicHome() {
    const navigate = useNavigate();
  
    return (
      <Box>
        {/* Hero Section */}
        <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
          <Container maxWidth="md">
            <Typography variant="h2" gutterBottom>
              Welcome to Book Swap and Lease
            </Typography>
            <Typography variant="h5" paragraph>
              Your platform for swapping and leasing books with other readers.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              onClick={() => navigate('/signup')}
            >
              Join Now
            </Button>
          </Container>
        </Box>
  
        {/* About Section */}
        <Container sx={{ py: 8 }}>
          <Typography variant="h3" gutterBottom align="center">
            About Us
          </Typography>
          <Typography variant="h6" paragraph align="center">
            This platform allows you to swap or lease books easily with other users.
          </Typography>
        </Container>
  
        {/* How It Works Section */}
        <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
          <Container>
            <Typography variant="h3" gutterBottom align="center">
              How It Works
            </Typography>
            <Typography variant="h6" align="center">
              Sign up, list your books, swap or lease, and enjoy!
            </Typography>
          </Container>
        </Box>
      </Box>
    );
  }