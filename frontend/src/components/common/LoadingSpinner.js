import { Box, CircularProgress, Typography } from '@mui/material';

export function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      minHeight="200px"
      gap={2}
    >
      <CircularProgress />
      <Typography color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}