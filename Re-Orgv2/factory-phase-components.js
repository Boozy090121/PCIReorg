// src/components/FocusFactory/FocusFactorySelector.js
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tabs, Tab, Paper, Box, Typography } from '@mui/material';
import { selectCurrentFactory, selectFactories, setCurrentFactory } from '../../features/focusFactorySlice';

const FocusFactorySelector = () => {
  const dispatch = useDispatch();
  const currentFactory = useSelector(selectCurrentFactory);
  const factories = useSelector(selectFactories);

  const handleFactoryChange = (event, newFactory) => {
    dispatch(setCurrentFactory(newFactory));
  };

  const getFactoryColor = (factory) => {
    switch (factory) {
      case 'ADD':
        return '#CC2030';
      case 'BBV':
        return '#00518A';
      case 'SYN':
        return '#232323';
      default:
        return '#666666';
    }
  };

  return (
    <Paper elevation={1} sx={{ padding: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Focus Factory:</Typography>
        <Tabs
          value={currentFactory}
          onChange={handleFactoryChange}
          textColor="primary"
          indicatorColor="primary"
        >
          {factories.map((factory) => (
            <Tab 
              key={factory} 
              value={factory} 
              label={factory}
              sx={{ 
                fontWeight: 'bold',
                color: getFactoryColor(factory),
                '&.Mui-selected': {
                  color: getFactoryColor(factory),
                }
              }}
            />
          ))}
        </Tabs>
      </Box>
    </Paper>
  );
};

export default FocusFactorySelector;

// src/components/FocusFactory/FocusFactoryTemplates.js
import React from 'react';

// Predefined organization structures for each factory type
export const factoryTemplates = {
  ADD: {
    current: {
      nodes: [
        { id: 'add-ceo', title: 'Chief Executive Officer', x: 400, y: 50, roles: [], personnel: [] },
        { id: 'add-cqo', title: 'Chief Quality Officer', x: 400, y: 150, roles: [], personnel: [] },
        { id: 'add-qad', title: 'Quality Assurance Director', x: 250, y: 250, roles: [], personnel: [] },
        { id: 'add-qcd', title: 'Quality Control Director', x: 550, y: 250, roles: [], personnel: [] },
        { id: 'add-qam', title: 'QA Manager', x: 150, y: 350, roles: [], personnel: [] },
        { id: 'add-qcm', title: 'QC Manager', x: 650, y: 350, roles: [], personnel: [] }
      ],
      connections: [
        { id: 'add-conn-1', sourceId: 'add-ceo', targetId: 'add-cqo' },
        { id: 'add-conn-2', sourceId: 'add-cqo', targetId: 'add-qad' },
        { id: 'add-conn-3', sourceId: 'add-cqo', targetId: 'add-qcd' },
        { id: 'add-conn-4', sourceId: 'add-qad', targetId: 'add-qam' },
        { id: 'add-conn-5', sourceId: 'add-qcd', targetId: 'add-qcm' }
      ]
    },
    future: {
      nodes: [],
      connections: []
    }
  },
  BBV: {
    current: {
      nodes: [
        { id: 'bbv-ceo', title: 'Chief Executive Officer', x: 400, y: 50, roles: [], personnel: [] },
        { id: 'bbv-cqo', title: 'Chief Quality Officer', x: 400, y: 150, roles: [], personnel: [] },
        { id: 'bbv-qad', title: 'Quality Assurance Director', x: 250, y: 250, roles: [], personnel: [] },
        { id: 'bbv-qcd', title: 'Quality Control Director', x: 550, y: 250, roles: [], personnel: [] },
        { id: 'bbv-qam', title: 'QA Manager', x: 150, y: 350, roles: [], personnel: [] },
        { id: 'bbv-qcm', title: 'QC Manager', x: 650, y: 350, roles: [], personnel: [] }
      ],
      connections: [
        { id: 'bbv-conn-1', sourceId: 'bbv-ceo', targetId: 'bbv-cqo' },
        { id: 'bbv-conn-2', sourceId: 'bbv-cqo', targetId: 'bbv-qad' },
        { id: 'bbv-conn-3', sourceId: 'bbv-cqo', targetId: 'bbv-qcd' },
        { id: 'bbv-conn-4', sourceId: 'bbv-qad', targetId: 'bbv-qam' },
        { id: 'bbv-conn-5', sourceId: 'bbv-qcd', targetId: 'bbv-qcm' }
      ]
    },
    future: {
      nodes: [],
      connections: []
    }
  },
  SYN: {
    current: {
      nodes: [
        { id: 'syn-ceo', title: 'Chief Executive Officer', x: 400, y: 50, roles: [], personnel: [] },
        { id: 'syn-cqo', title: 'Chief Quality Officer', x: 400, y: 150, roles: [], personnel: [] },
        { id: 'syn-qad', title: 'Quality Assurance Director', x: 250, y: 250, roles: [], personnel: [] },
        { id: 'syn-qcd', title: 'Quality Control Director', x: 550, y: 250, roles: [], personnel: [] },
        { id: 'syn-qam', title: 'QA Manager', x: 150, y: 350, roles: [], personnel: [] },
        { id: 'syn-qcm', title: 'QC Manager', x: 650, y: 350, roles: [], personnel: [] }
      ],
      connections: [
        { id: 'syn-conn-1', sourceId: 'syn-ceo', targetId: 'syn-cqo' },
        { id: 'syn-conn-2', sourceId: 'syn-cqo', targetId: 'syn-qad' },
        { id: 'syn-conn-3', sourceId: 'syn-cqo', targetId: 'syn-qcd' },
        { id: 'syn-conn-4', sourceId: 'syn-qad', targetId: 'syn-qam' },
        { id: 'syn-conn-5', sourceId: 'syn-qcd', targetId: 'syn-qcm' }
      ]
    },
    future: {
      nodes: [],
      connections: []
    }
  }
};

export default factoryTemplates;

// src/components/PhaseManager/PhaseManager.js
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, ToggleButtonGroup, ToggleButton, Button, Typography, Paper } from '@mui/material';
import CompareIcon from '@mui/icons-material/Compare';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { selectCurrentPhase, selectPhases, setCurrentPhase } from '../../features/phaseSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import { copyOrgChart } from '../../features/orgChartSlice';

const PhaseManager = () => {
  const dispatch = useDispatch();
  const currentPhase = useSelector(selectCurrentPhase);
  const phases = useSelector(selectPhases);
  const currentFactory = useSelector(selectCurrentFactory);

  const handlePhaseChange = (event, newPhase) => {
    if (newPhase !== null) {
      dispatch(setCurrentPhase(newPhase));
    }
  };

  const handleCopyPhase = () => {
    const sourcePhase = currentPhase;
    const targetPhase = currentPhase === 'current' ? 'future' : 'current';
    
    dispatch(copyOrgChart({
      sourcePhase,
      targetPhase,
      factory: currentFactory
    }));
  };

  return (
    <Paper elevation={1} sx={{ padding: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Phase:</Typography>
        <ToggleButtonGroup
          value={currentPhase}
          exclusive
          onChange={handlePhaseChange}
          aria-label="phase selector"
        >
          {phases.map((phase) => (
            <ToggleButton 
              key={phase} 
              value={phase} 
              aria-label={phase}
              sx={{ textTransform: 'capitalize' }}
            >
              {phase}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyPhase}
          sx={{ ml: 2 }}
        >
          Copy to {currentPhase === 'current' ? 'Future' : 'Current'}
        </Button>
        
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<CompareIcon />}
          sx={{ ml: 1 }}
        >
          Compare Phases
        </Button>
      </Box>
    </Paper>
  );
};

export default PhaseManager;

// src/components/PhaseManager/StateComparisonTool.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Divider, Grid, Card, CardContent, List, ListItem, ListItemText } from '@mui/material';
import { selectOrgChart } from '../../features/orgChartSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';

const StateComparisonTool = () => {
  const currentFactory = useSelector(selectCurrentFactory);
  const currentOrgChart = useSelector(state => selectOrgChart(state, 'current', currentFactory));
  const futureOrgChart = useSelector(state => selectOrgChart(state, 'future', currentFactory));

  const calculateMetrics = () => {
    const currentNodeCount = currentOrgChart.nodes.length;
    const futureNodeCount = futureOrgChart.nodes.length;
    const nodeChange = futureNodeCount - currentNodeCount;
    
    const currentConnectionCount = currentOrgChart.connections.length;
    const futureConnectionCount = futureOrgChart.connections.length;
    const connectionChange = futureConnectionCount - currentConnectionCount;
    
    // Calculate titles that exist in current but not in future
    const currentTitles = currentOrgChart.nodes.map(node => node.title);
    const futureTitles = futureOrgChart.nodes.map(node => node.title);
    
    const removedTitles = currentTitles.filter(title => !futureTitles.includes(title));
    const addedTitles = futureTitles.filter(title => !currentTitles.includes(title));
    
    return {
      nodeChange,
      connectionChange,
      removedTitles,
      addedTitles
    };
  };

  const metrics = calculateMetrics();

  return (
    <Paper sx={{ padding: 3, maxWidth: 800, margin: 'auto', marginTop: 4 }}>
      <Typography variant="h5" gutterBottom>
        State Comparison: {currentFactory} Factory
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Current State
              </Typography>
              <Typography variant="h4">
                {currentOrgChart.nodes.length} Positions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentOrgChart.connections.length} Reporting Lines
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Future State
              </Typography>
              <Typography variant="h4">
                {futureOrgChart.nodes.length} Positions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {futureOrgChart.connections.length} Reporting Lines
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Changes Summary
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary={`Position Count Change: ${metrics.nodeChange > 0 ? '+' : ''}${metrics.nodeChange}`}
              secondary={metrics.nodeChange > 0 ? 'Organization is expanding' : metrics.nodeChange < 0 ? 'Organization is contracting' : 'No change in size'}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary={`Reporting Line Change: ${metrics.connectionChange > 0 ? '+' : ''}${metrics.connectionChange}`}
              secondary={metrics.connectionChange > 0 ? 'Increased complexity' : metrics.connectionChange < 0 ? 'Simplified structure' : 'No change in reporting structure'}
            />
          </ListItem>
        </List>
      </Box>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={6}>
          <Typography variant="subtitle1" gutterBottom>
            Removed Positions ({metrics.removedTitles.length})
          </Typography>
          <List dense>
            {metrics.removedTitles.length > 0 ? (
              metrics.removedTitles.map((title, index) => (
                <ListItem key={index}>
                  <ListItemText primary={title} />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No positions removed" />
              </ListItem>
            )}
          </List>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="subtitle1" gutterBottom>
            Added Positions ({metrics.addedTitles.length})
          </Typography>
          <List dense>
            {metrics.addedTitles.length > 0 ? (
              metrics.addedTitles.map((title, index) => (
                <ListItem key={index}>
                  <ListItemText primary={title} />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No positions added" />
              </ListItem>
            )}
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StateComparisonTool;
