import { createTheme } from '@mui/material';

const getTheme = (mode) => createTheme({
  palette: {
    mode: mode,
    ...(mode === 'light' 
      ? {
          // Light mode colors
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          background: {
            default: '#f5f5f5',
            paper: '#fff',
          },
        }
      : {
          // Dark mode colors
          primary: {
            main: '#90caf9',
          },
          secondary: {
            main: '#f48fb1',
          },
          background: {
            default: '#303030',
            paper: '#424242',
          },
        }),
  },
});

export default getTheme;