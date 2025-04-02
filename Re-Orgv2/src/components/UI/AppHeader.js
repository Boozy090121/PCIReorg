import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Button, 
  Box, 
  Menu, 
  MenuItem, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import InfoIcon from '@mui/icons-material/Info';

const AppHeader = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleHelpOpen = () => {
    setHelpDialogOpen(true);
    handleMenuClose();
  };

  const handleHelpClose = () => {
    setHelpDialogOpen(false);
  };

  const handleAboutOpen = () => {
    setAboutDialogOpen(true);
    handleMenuClose();
  };

  const handleAboutClose = () => {
    setAboutDialogOpen(false);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuOpen}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ mr: 1 }}>
            Quality Re-organization Tool
          </Typography>
          <Typography variant="caption" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', px: 1, py: 0.5, borderRadius: 1 }}>
            v1.0
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            color="inherit" 
            startIcon={<HelpOutlineIcon />}
            onClick={handleHelpOpen}
          >
            Help
          </Button>
          <IconButton 
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>
        </Box>
        
        {/* Main Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>Home</MenuItem>
          <MenuItem onClick={handleMenuClose}>Export Data</MenuItem>
          <MenuItem onClick={handleMenuClose}>Import Data</MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose}>
            <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
            Settings
          </MenuItem>
          <MenuItem onClick={handleAboutOpen}>
            <InfoIcon fontSize="small" sx={{ mr: 1 }} />
            About
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose}>
            <ExitToAppIcon fontSize="small" sx={{ mr: 1 }} />
            Exit
          </MenuItem>
        </Menu>
        
        {/* Help Dialog */}
        <Dialog open={helpDialogOpen} onClose={handleHelpClose} maxWidth="md" fullWidth>
          <DialogTitle>Help & Documentation</DialogTitle>
          <DialogContent dividers>
            <Typography variant="h6" gutterBottom>
              Getting Started
            </Typography>
            <Typography paragraph>
              The Quality Re-organization Tool helps pharmaceutical and medical device companies 
              reorganize their quality departments using a focus factory approach.
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              Main Features
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Organization Chart Builder" 
                  secondary="Build and modify the organizational structure using drag and drop" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Role Management" 
                  secondary="Create and assign roles to positions in the organization chart" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Personnel Management" 
                  secondary="Create and assign personnel to roles" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Phase Management" 
                  secondary="Toggle between current and future states" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Focus Factory Selection" 
                  secondary="Switch between different factory contexts (ADD, BBV, SYN)" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Reports & Analytics" 
                  secondary="View metrics and analytics about your organization" 
                />
              </ListItem>
            </List>
            
            <Typography variant="h6" gutterBottom>
              Need More Help?
            </Typography>
            <Typography paragraph>
              For additional help and support, please contact your system administrator.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleHelpClose}>Close</Button>
          </DialogActions>
        </Dialog>
        
        {/* About Dialog */}
        <Dialog open={aboutDialogOpen} onClose={handleAboutClose}>
          <DialogTitle>About Quality Re-organization Tool</DialogTitle>
          <DialogContent dividers>
            <Typography paragraph>
              <strong>Version:</strong> 1.0.0
            </Typography>
            <Typography paragraph>
              <strong>Build Date:</strong> April 1, 2025
            </Typography>
            <Typography paragraph>
              The Quality Re-organization Tool is designed to help pharmaceutical 
              and medical device companies reorganize their quality departments 
              using a focus factory approach.
            </Typography>
            <Typography paragraph>
              This application supports multiple focus factories (ADD, BBV, SYN) 
              and allows users to visualize, modify, and compare organizational structures.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAboutClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader; 