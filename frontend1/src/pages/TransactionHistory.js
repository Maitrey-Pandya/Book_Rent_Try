import { Container, Typography, Paper } from '@mui/material';
import { TransactionHistoryTable } from '../components/profile/TransactionHistory';

export function TransactionHistory() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Transaction History
      </Typography>
      <Paper sx={{ p: 2 }}>
        <TransactionHistoryTable />
      </Paper>
    </Container>
  );
}