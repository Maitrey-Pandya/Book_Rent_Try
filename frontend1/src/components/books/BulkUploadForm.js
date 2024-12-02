import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../../api/axios';

export function BulkUploadForm() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/json') {
        setError('Please upload a JSON file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const books = JSON.parse(e.target.result);
          setPreview(books);
          setSelectedFile(file);
          setError('');
        } catch (err) {
          setError('Invalid JSON format');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('books', selectedFile);

      const response = await api.post('/api/v1/books/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        navigate('/books');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading books');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Bulk Upload Books
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <input
          accept=".json"
          style={{ display: 'none' }}
          id="bulk-upload-file"
          type="file"
          onChange={handleFileSelect}
        />
        <label htmlFor="bulk-upload-file">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
          >
            Select JSON File
          </Button>
        </label>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {preview.length > 0 && (
        <Paper sx={{ mb: 3, maxHeight: 400, overflow: 'auto' }}>
          <List>
            {preview.map((book, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton edge="end" onClick={() => {
                    const newPreview = preview.filter((_, i) => i !== index);
                    setPreview(newPreview);
                  }}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={book.title}
                  secondary={`By ${book.author} | ISBN: ${book.isbn}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={!selectedFile}
        fullWidth
      >
        Upload Books
      </Button>
    </Box>
  );
}
