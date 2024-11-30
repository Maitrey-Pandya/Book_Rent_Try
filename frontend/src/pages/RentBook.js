import { Container, Typography, Paper } from '@mui/material';
import { RentBookForm } from '../components/books/RentBookForm';

export function RentBook() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Rent Out Your Books
      </Typography>
      <Paper sx={{ p: 4 }}>
        <RentBookForm />
      </Paper>
    </Container>
  );
}