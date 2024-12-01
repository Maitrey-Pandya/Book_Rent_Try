import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../../contexts/ThemeContext';

// In your AppBar component:
const { mode, updateTheme } = useTheme();

// Add this to your toolbar:
<IconButton 
  color="inherit" 
  onClick={() => updateTheme(mode === 'light' ? 'dark' : 'light')}
>
  {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
</IconButton>
