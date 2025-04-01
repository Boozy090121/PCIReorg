// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { store } from './app/store';
import theme from './styles/theme';
import './styles/globals.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

// src/App.js
import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import AppHeader from './components/UI/AppHeader';
import FlexibleLayout from './components/UI/FlexibleLayout';
import LeftPanel from './components/LeftPanel/LeftPanel';
import CenterPanel from './components/CenterPanel/CenterPanel';
import RightPanel from './components/RightPanel/RightPanel';
import PhaseManager from './components/PhaseManager/PhaseManager';
import FocusFactorySelector from './components/FocusFactory/FocusFactorySelector';
import ReportsAndAnalytics from './components/ReportsAndAnalytics/ReportsAndAnalytics';
import StateComparisonTool from './components/PhaseManager/StateComparisonTool';
import PersistenceManager from './components/Persistence/PersistenceManager';
import DashboardAnalytics from './components/Dashboard/DashboardAnalytics';

function App() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box className="app-container">
      <AppHeader />
      <Box sx={{ display: 'flex', padding: 2, gap: 2 }}>
        <FocusFactorySelector />
        <PhaseManager />
        <Box sx={{ ml: 'auto' }}>
          <PersistenceManager />
        </Box>
      </Box>
      
      <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange} centered>
          <Tab label="Organization Chart" />
          <Tab label="Phase Comparison" />
          <Tab label="Reports & Analytics" />
          <Tab label="Dashboard" />
        </Tabs>
      </Paper>

      {currentTab === 0 && (
        <FlexibleLayout
          leftPanel={<LeftPanel />}
          centerPanel={<CenterPanel />}
          rightPanel={<RightPanel />}
        />
      )}
      
      {currentTab === 1 && <StateComparisonTool />}
      
      {currentTab === 2 && <ReportsAndAnalytics />}
      
      {currentTab === 3 && <DashboardAnalytics />}
    </Box>
  );
}

export default App;

// src/components/UI/AppHeader.js
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

// src/components/UI/FlexibleLayout.js
import React from 'react';
import { Box, Paper } from '@mui/material';

const FlexibleLayout = ({ leftPanel, centerPanel, rightPanel }) => {
  return (
    <Box className="panel-container">
      <Paper className="left-panel" elevation={0}>
        {leftPanel}
      </Paper>
      <Paper className="center-panel" elevation={0}>
        {centerPanel}
      </Paper>
      <Paper className="right-panel" elevation={0}>
        {rightPanel}
      </Paper>
    </Box>
  );
};

export default FlexibleLayout;
