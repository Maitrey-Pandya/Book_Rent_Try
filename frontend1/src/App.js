import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';
import getTheme from './theme';
import { Box } from '@mui/material';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AppRoutes } from './routes';

function ThemedApp() {
  const { mode } = useTheme();
  const theme = getTheme(mode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box sx={{ display: 'flex', flex: 1 }}>
              <Sidebar />
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  p: 3,
                  mt: 2,
                  ml: { xs: 0, sm: '240px' },
                  width: { sm: `calc(100% - 240px)` },
                  maxWidth: 1200,
                  mx: 'auto'
                }}
              >
                <AppRoutes />
              </Box>
            </Box>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;