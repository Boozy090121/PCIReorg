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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        State Comparison: {currentFactory}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Structure Changes
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Position Changes"
                    secondary={`${metrics.nodeChange > 0 ? '+' : ''}${metrics.nodeChange} positions`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Reporting Line Changes"
                    secondary={`${metrics.connectionChange > 0 ? '+' : ''}${metrics.connectionChange} connections`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Title Changes
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Removed Titles"
                    secondary={metrics.removedTitles.join(', ') || 'None'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Added Titles"
                    secondary={metrics.addedTitles.join(', ') || 'None'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StateComparisonTool; 