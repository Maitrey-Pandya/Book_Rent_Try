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
    Bookmark as BookmarkIcon,
    Book as BookIcon
  } from '@mui/icons-material';
  import { useNavigate, useLocation } from 'react-router-dom';
  
  const drawerWidth = 240;
  
  const menuItems = [
    { text: 'Personal Info', icon: <PersonIcon />, path: '/profile' },
    { text: 'Transaction History', icon: <HistoryIcon />, path: '/transactions' },
    { text: 'Bookmarks', icon: <BookmarkIcon />, path: '/bookmarks' },
    { text: 'Rent Your Book', icon: <BookIcon />, path: '/rent-book' }
  ];
  
  export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
  
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px' // Height of AppBar
          }
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
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