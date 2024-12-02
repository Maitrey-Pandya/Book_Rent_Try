import { 
    Box, 
    Container, 
    Typography, 
    Grid, 
    Button,
    Card,
    CardContent
  } from '@mui/material';
  import { useNavigate } from 'react-router-dom';
  import { useAuth } from '../contexts/AuthContext';
  import { CartButton } from '../components/cart/CartButton';
  
  export function AuthenticatedHome() {
    const navigate = useNavigate();
    const { user } = useAuth();
  
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user.name}!
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => navigate('/books')}
                    >
                      Browse Books
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={() => navigate('/books/new')}
                    >
                      List a Book
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Stats
                </Typography>
                {/* Add user statistics here */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <CartButton />
      </Container>
    );
  }