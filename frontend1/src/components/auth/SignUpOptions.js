import { useState } from 'react';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import { Person as PersonIcon, Store as StoreIcon } from '@mui/icons-material';
import { SignupForm } from './SignUpForm';
import { PublisherSignupForm } from './PublisherSignupForm';

export function SignUpOptions() {
  const [selectedRole, setSelectedRole] = useState(null);

  if (selectedRole === 'publisher') {
    return <PublisherSignupForm />;
  }

  if (selectedRole === 'user') {
    return <SignupForm />;
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Join BookVerse
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          Choose how you want to join our platform
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<PersonIcon />}
            onClick={() => setSelectedRole('user')}
            sx={{ py: 2 }}
          >
            Sign Up as Reader
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<StoreIcon />}
            onClick={() => setSelectedRole('publisher')}
            sx={{ py: 2 }}
          >
            Sign Up as Publisher
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}