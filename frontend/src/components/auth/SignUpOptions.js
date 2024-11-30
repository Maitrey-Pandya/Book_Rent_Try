import { Box, Button, Typography, Paper, Container } from '@mui/material';
import { Person as PersonIcon, Store as StoreIcon } from '@mui/icons-material';

export function SignUpOptions({ onSelectRole }) {
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
            onClick={() => onSelectRole('user')}
            sx={{ py: 2 }}
          >
            Sign Up as Reader
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<StoreIcon />}
            onClick={() => onSelectRole('publisher')}
            sx={{ py: 2 }}
          >
            Sign Up as Publisher
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}