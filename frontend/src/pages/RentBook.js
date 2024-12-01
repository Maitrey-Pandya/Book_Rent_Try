import { Container, Typography, Paper, Box, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RentBookForm } from '../components/books/RentBookForm';
import { BulkUploadForm } from '../components/books/BulkUploadForm';

export function RentBook() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add Books
      </Typography>
      
      {user?.role === 'publisher' && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Single Book" />
            <Tab label="Bulk Upload" />
          </Tabs>
        </Box>
      )}

      <Paper sx={{ p: 4 }}>
        {activeTab === 0 || user?.role !== 'publisher' ? (
          <RentBookForm />
        ) : (
          <BulkUploadForm />
        )}
      </Paper>
    </Container>
  );
}