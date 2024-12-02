import { 
    Drawer, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText,
    ListItemButton 
  } from '@mui/material';
  import {
    Person as PersonIcon,
    History as HistoryIcon,
    Book as BookIcon
  } from '@mui/icons-material';
  import { useNavigate, useLocation } from 'react-router-dom';
  
  const drawerWidth = 240;
  
  const menuItems = [
    { text: 'Personal Info', icon: <PersonIcon />, path: '/profile' },
    { text: 'Transaction History', icon: <HistoryIcon />, path: '/transactions' },
    { text: 'Rent Your Book', icon: <BookIcon />, path: '/rent-book' }
  ];
  
  export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
  
    return (
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },  // Hide on mobile, show on desktop
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px', // Height of AppBar
            height: 'calc(100% - 64px)',  // Subtract AppBar height
            position: 'fixed',
            border: '1px solid rgba(0, 0, 0, 0.12)',  // Add subtle border
            backgroundColor: 'background.paper',
            zIndex: (theme) => theme.zIndex.drawer
          }
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected'
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    );
  }