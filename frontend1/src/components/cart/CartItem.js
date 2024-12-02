import { Box, Card, CardContent, Typography, IconButton, TextField, Grid } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

export function CartItem({ item, onUpdate, onRemove }) {
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    onUpdate(item._id, newQuantity);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  // Just add this function
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/assets/book_cover_template.jpg';
    
    if (imageUrl.includes('cloudinary')) {
      return imageUrl.replace('/upload/', '/upload/w_800,h_1200,c_fill,g_center,f_auto,q_auto/');
    }
    
    return imageUrl;
  };

  return (
    <Card sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Box
              sx={{
                width: '100%',
                maxWidth: '120px',
                height: '180px',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              {/* Just update the src here */}
              <img 
                src={getImageUrl(item.book.coverImage)}
                alt={item.book.title}
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={9}>
            <Typography variant="h6" gutterBottom>
              {item.book.title}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {item.type === 'rent' ? 'Rental' : 'Purchase'}
            </Typography>
            {item.type === 'rent' && (
              <Typography variant="body2" color="text.secondary">
                Duration: {formatDate(item.rentalDuration.startDate)} - {formatDate(item.rentalDuration.endDate)}
              </Typography>
            )}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                type="number"
                size="small"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                inputProps={{ min: 1 }}
                sx={{ width: '80px' }}
              />
              <Typography variant="h6">
                ₹{item.price * item.quantity}
              </Typography>
              <IconButton 
                color="error" 
                onClick={() => onRemove(item._id)}
                sx={{ ml: 'auto' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}