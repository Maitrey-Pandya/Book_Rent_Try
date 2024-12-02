import { Container, Typography, Paper } from '@mui/material';
import { BookmarksList } from '../components/profile/BookmarksList';

export function Bookmarks() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bookmarks
      </Typography>
      <Paper sx={{ p: 2 }}>
        <BookmarksList />
      </Paper>
    </Container>
  );
}