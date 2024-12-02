import { 
    Box, 
    Typography, 
    Button, 
    Container, 
    Grid, 
    Card, 
    CardContent, 
    CardMedia, 
    useTheme 
  } from '@mui/material';
  import { useNavigate } from 'react-router-dom';
  import { useAuth } from '../contexts/AuthContext';
  import { CartButton } from '../components/cart/CartButton';
  
  const teamMembers = [
  ];
  
  export function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
  
    return (
      <Box position="relative">
        {/* Hero Section */}
        <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
          <Container maxWidth="md">
            <Typography variant="h2" gutterBottom>
              Welcome to BookVerse
            </Typography>
            <Typography variant="h5" paragraph>
              Your platform for buying and leasing books with other readers.
            </Typography>
            {!user ? (
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                onClick={() => navigate('/signup')}
              >
                Join Now
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                onClick={() => navigate('/books')}
              >
                Browse Books
              </Button>
            )}
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
        <Box sx={{ 
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'grey.100', 
          color: theme.palette.mode === 'dark' ? 'white' : 'inherit', 
          py: 8 
        }}>
          <Container>
            <Typography variant="h3" gutterBottom align="center">
              How It Works
            </Typography>
            <Typography variant="h6" align="center">
              Sign up, list your books, swap or lease, and enjoy!
            </Typography>
          </Container>
        </Box>
  
        {/* Team Section */}
        <Container sx={{ py: 8 }}>
          <Typography variant="h3" gutterBottom align="center">
            Our Team
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member) => (
              <Grid item key={member.name} xs={12} sm={6} md={3}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image="/user-profile.png"
                    alt={member.name}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {member.name}
                    </Typography>
                    <Typography color="text.secondary">
                      {member.role}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
  
        {/* CTA Section */}
        <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
          <Container>
            <Typography variant="h3" gutterBottom align="center">
              Join Our Community Today
            </Typography>
            <Box display="flex" justifyContent="center">
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                onClick={() => navigate('/signup')}
              >
                Sign Up Now
              </Button>
            </Box>
          </Container>
        </Box>
  
        {/* Add CartButton only for authenticated users */}
        {user && <CartButton />}
      </Box>
    );
  }