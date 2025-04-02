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
import TestComponent from './components/TestComponent';

function App() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box className="app-container">
      <AppHeader />
      <TestComponent />
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