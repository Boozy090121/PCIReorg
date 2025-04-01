// src/components/ReportsAndAnalytics/ReportsAndAnalytics.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { selectOrgChart } from '../../features/orgChartSlice';
import { selectRolesByFactory } from '../../features/roleSlice';
import { selectPersonnelByFactory } from '../../features/personnelSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import OrganizationMetrics from './OrganizationMetrics';
import RoleDistributionChart from './RoleDistributionChart';
import PersonnelAssignmentStatus from './PersonnelAssignmentStatus';
import PhaseComparisonChart from './PhaseComparisonChart';

const ReportsAndAnalytics = () => {
  const currentFactory = useSelector(selectCurrentFactory);
  const [activeTab, setActiveTab] = useState(0);
  
  const currentOrgChart = useSelector(state => selectOrgChart(state, 'current', currentFactory));
  const futureOrgChart = useSelector(state => selectOrgChart(state, 'future', currentFactory));
  const roles = useSelector(state => selectRolesByFactory(state, currentFactory));
  const personnel = useSelector(state => selectPersonnelByFactory(state, currentFactory));
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const generateReport = () => {
    // In a real application, this would generate a PDF or export data
    alert('Report generation functionality would be implemented here.');
  };
  
  const getInsights = () => {
    // Calculate some basic insights about the organizational structure
    const currentNodeCount = currentOrgChart.nodes.length;
    const futureNodeCount = futureOrgChart.nodes.length;
    const nodeChange = futureNodeCount - currentNodeCount;
    
    const currentConnectionCount = currentOrgChart.connections.length;
    const futureConnectionCount = futureOrgChart.connections.length;
    const connectionChange = futureConnectionCount - currentConnectionCount;
    
    const assignedRolesCount = currentOrgChart.nodes.reduce((count, node) => 
      count + (node.roles ? node.roles.length : 0), 0);
    
    const assignedPersonnelCount = currentOrgChart.nodes.reduce((count, node) => 
      count + (node.personnel ? node.personnel.length : 0), 0);
    
    // Calculate span of control (average number of direct reports)
    const spanOfControl = currentConnectionCount > 0 && currentNodeCount > 0 
      ? (currentConnectionCount / (currentNodeCount - currentConnectionCount)).toFixed(2)
      : 0;
    
    return {
      nodeChange,
      connectionChange,
      spanOfControl,
      assignedRolesCount,
      assignedPersonnelCount,
      unassignedRolesCount: roles.length - assignedRolesCount,
      unassignedPersonnelCount: personnel.length - assignedPersonnelCount
    };
  };
  
  const insights = getInsights();
  
  return (
    <Paper sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Reports & Analytics: {currentFactory} Factory
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />}
          onClick={generateReport}
        >
          Export Report
        </Button>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="analytics tabs">
          <Tab label="Overview" />
          <Tab label="Role Analysis" />
          <Tab label="Personnel Analysis" />
          <Tab label="Phase Comparison" />
        </Tabs>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Overview Tab */}
      {activeTab === 0 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <OrganizationMetrics 
                currentOrgChart={currentOrgChart}
                futureOrgChart={futureOrgChart}
                currentFactory={currentFactory}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Key Insights" />
                <CardContent>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Position Change" 
                        secondary={`${insights.nodeChange > 0 ? '+' : ''}${insights.nodeChange} positions from current to future`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Reporting Line Change" 
                        secondary={`${insights.connectionChange > 0 ? '+' : ''}${insights.connectionChange} reporting lines from current to future`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Average Span of Control" 
                        secondary={`${insights.spanOfControl} direct reports per manager`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Role Assignments" 
                        secondary={`${insights.assignedRolesCount} assigned / ${insights.unassignedRolesCount} unassigned`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Personnel Assignments" 
                        secondary={`${insights.assignedPersonnelCount} assigned / ${insights.unassignedPersonnelCount} unassigned`} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Role Analysis Tab */}
      {activeTab === 1 && (
        <Box>
          <RoleDistributionChart 
            orgChart={currentOrgChart} 
            roles={roles}
            factory={currentFactory}
          />
        </Box>
      )}
      
      {/* Personnel Analysis Tab */}
      {activeTab === 2 && (
        <Box>
          <PersonnelAssignmentStatus 
            orgChart={currentOrgChart}
            personnel={personnel}
            factory={currentFactory}
          />
        </Box>
      )}
      
      {/* Phase Comparison Tab */}
      {activeTab === 3 && (
        <Box>
          <PhaseComparisonChart 
            currentOrgChart={currentOrgChart}
            futureOrgChart={futureOrgChart}
            factory={currentFactory}
          />
        </Box>
      )}
    </Paper>
  );
};

export default ReportsAndAnalytics;

// src/components/ReportsAndAnalytics/OrganizationMetrics.js
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Box,
  Divider
} from '@mui/material';

const OrganizationMetrics = ({ currentOrgChart, futureOrgChart, currentFactory }) => {
  // Calculate metrics for the current state
  const currentMetrics = {
    positions: currentOrgChart.nodes.length,
    reportingLines: currentOrgChart.connections.length,
    depth: calculateOrgDepth(currentOrgChart),
    width: calculateOrgWidth(currentOrgChart)
  };
  
  // Calculate metrics for the future state
  const futureMetrics = {
    positions: futureOrgChart.nodes.length,
    reportingLines: futureOrgChart.connections.length,
    depth: calculateOrgDepth(futureOrgChart),
    width: calculateOrgWidth(futureOrgChart)
  };
  
  // Helper function to calculate the depth of the organization chart
  function calculateOrgDepth(orgChart) {
    // In a real implementation, this would traverse the tree to find the max depth
    // For this simplified version, we'll just return a placeholder value
    return Math.floor(orgChart.connections.length / 2) + 1;
  }
  
  // Helper function to calculate the width of the organization chart
  function calculateOrgWidth(orgChart) {
    // In a real implementation, this would find the maximum number of nodes at any depth
    // For this simplified version, we'll just return a placeholder value
    return Math.ceil(orgChart.nodes.length / (calculateOrgDepth(orgChart) || 1));
  }
  
  // Calculate the percent change between current and future states
  const percentChange = {
    positions: calculatePercentChange(currentMetrics.positions, futureMetrics.positions),
    reportingLines: calculatePercentChange(currentMetrics.reportingLines, futureMetrics.reportingLines),
    depth: calculatePercentChange(currentMetrics.depth, futureMetrics.depth),
    width: calculatePercentChange(currentMetrics.width, futureMetrics.width)
  };
  
  function calculatePercentChange(current, future) {
    if (current === 0) return future > 0 ? 100 : 0;
    return ((future - current) / current * 100).toFixed(1);
  }
  
  // Determine color based on the change direction
  const getChangeColor = (change) => {
    if (change > 0) return 'success.main';
    if (change < 0) return 'error.main';
    return 'text.secondary';
  };
  
  return (
    <Card>
      <CardHeader title="Organization Metrics" />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Current State
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Positions: {currentMetrics.positions}</Typography>
              <Typography variant="subtitle1">Reporting Lines: {currentMetrics.reportingLines}</Typography>
              <Typography variant="subtitle1">Org Depth: {currentMetrics.depth} levels</Typography>
              <Typography variant="subtitle1">Org Width: {currentMetrics.width} avg positions per level</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Future State
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Positions: {futureMetrics.positions}</Typography>
              <Typography variant="subtitle1">Reporting Lines: {futureMetrics.reportingLines}</Typography>
              <Typography variant="subtitle1">Org Depth: {futureMetrics.depth} levels</Typography>
              <Typography variant="subtitle1">Org Width: {futureMetrics.width} avg positions per level</Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Change Analysis
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Positions</Typography>
            <Typography 
              variant="h5" 
              sx={{ color: getChangeColor(percentChange.positions) }}
            >
              {percentChange.positions > 0 ? '+' : ''}{percentChange.positions}%
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Reporting Lines</Typography>
            <Typography 
              variant="h5" 
              sx={{ color: getChangeColor(percentChange.reportingLines) }}
            >
              {percentChange.reportingLines > 0 ? '+' : ''}{percentChange.reportingLines}%
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Org Depth</Typography>
            <Typography 
              variant="h5" 
              sx={{ color: getChangeColor(percentChange.depth) }}
            >
              {percentChange.depth > 0 ? '+' : ''}{percentChange.depth}%
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Org Width</Typography>
            <Typography 
              variant="h5" 
              sx={{ color: getChangeColor(percentChange.width) }}
            >
              {percentChange.width > 0 ? '+' : ''}{percentChange.width}%
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default OrganizationMetrics;

// src/components/ReportsAndAnalytics/RoleDistributionChart.js
import React from 'react';
import { Box, Card, CardContent, CardHeader, Typography, Divider, Grid } from '@mui/material';

const RoleDistributionChart = ({ orgChart, roles, factory }) => {
  // In a real application, this would render a chart showing role distribution
  // For this implementation, we'll just show a simplified representation
  
  // Group roles by department
  const departmentCounts = {};
  
  roles.forEach(role => {
    if (!role.department) return;
    
    if (!departmentCounts[role.department]) {
      departmentCounts[role.department] = {
        total: 0,
        assigned: 0
      };
    }
    
    departmentCounts[role.department].total++;
    
    // Check if the role is assigned to any node
    const isAssigned = orgChart.nodes.some(node => 
      node.roles && node.roles.includes(role.id)
    );
    
    if (isAssigned) {
      departmentCounts[role.department].assigned++;
    }
  });
  
  // Convert to array for rendering
  const departmentData = Object.entries(departmentCounts).map(([dept, counts]) => ({
    department: dept,
    total: counts.total,
    assigned: counts.assigned,
    unassigned: counts.total - counts.assigned,
    percentAssigned: counts.total > 0 
      ? ((counts.assigned / counts.total) * 100).toFixed(0) 
      : 0
  }));
  
  return (
    <Card>
      <CardHeader title="Role Distribution by Department" />
      <CardContent>
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" paragraph>
            This analysis shows how roles are distributed across departments and their assignment status.
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          {departmentData.map((dept) => (
            <Grid item xs={12} sm={6} md={4} key={dept.department}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {dept.department}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Roles:
                    </Typography>
                    <Typography variant="body1">
                      {dept.total}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Assigned:
                    </Typography>
                    <Typography variant="body1" color="success.main">
                      {dept.assigned}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Unassigned:
                    </Typography>
                    <Typography variant="body1" color="warning.main">
                      {dept.unassigned}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Assignment Rate:
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={dept.percentAssigned > 70 ? 'success.main' : dept.percentAssigned > 30 ? 'warning.main' : 'error.main'}
                    >
                      {dept.percentAssigned}%
                    </Typography>
                  </Box>
                  
                  {/* In a real application, this would be a visual progress bar */}
                  <Box 
                    sx={{ 
                      mt: 1,
                      height: 10, 
                      width: '100%', 
                      bgcolor: 'grey.200',
                      borderRadius: 5,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${dept.percentAssigned}%`,
                        bgcolor: dept.percentAssigned > 70 ? 'success.main' : dept.percentAssigned > 30 ? 'warning.main' : 'error.main'
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RoleDistributionChart;

// src/components/ReportsAndAnalytics/PersonnelAssignmentStatus.js
import React from 'react';
import { Box, Card, CardContent, CardHeader, Typography, Divider, Grid, Chip } from '@mui/material';

const PersonnelAssignmentStatus = ({ orgChart, personnel, factory }) => {
  // Calculate personnel assignment status
  const assignedPersonnelIds = [];
  
  // Collect all assigned personnel IDs from the org chart
  orgChart.nodes.forEach(node => {
    if (node.personnel && node.personnel.length > 0) {
      assignedPersonnelIds.push(...node.personnel);
    }
  });
  
  // Categorize personnel
  const assignedPersonnel = personnel.filter(person => 
    assignedPersonnelIds.includes(person.id)
  );
  
  const unassignedPersonnel = personnel.filter(person => 
    !assignedPersonnelIds.includes(person.id)
  );
  
  // Group by availability status
  const groupByAvailability = (personnelList) => {
    const groups = {};
    
    personnelList.forEach(person => {
      const status = person.availability || 'Unknown';
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(person);
    });
    
    return groups;
  };
  
  const assignedByAvailability = groupByAvailability(assignedPersonnel);
  const unassignedByAvailability = groupByAvailability(unassignedPersonnel);
  
  // Calculate statistics
  const stats = {
    totalPersonnel: personnel.length,
    assignedCount: assignedPersonnel.length,
    unassignedCount: unassignedPersonnel.length,
    assignmentRate: personnel.length > 0 
      ? ((assignedPersonnel.length / personnel.length) * 100).toFixed(0)
      : 0
  };
  
  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Partially Available':
        return 'warning';
      case 'Not Available':
        return 'error';
      default:
        return 'default';
    }
  };
  
  return (
    <Card>
      <CardHeader title="Personnel Assignment Status" />
      <CardContent>
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" paragraph>
            This analysis shows the assignment status of personnel and their availability.
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <Typography variant="h3" align="center">
                {stats.totalPersonnel}
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary">
                Total Personnel
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="h3" align="center" color="success.main">
                {stats.assignedCount}
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary">
                Assigned
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="h3" align="center" color="warning.main">
                {stats.unassignedCount}
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary">
                Unassigned
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="h3" align="center">
                {stats.assignmentRate}%
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary">
                Assignment Rate
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Assigned Personnel
            </Typography>
            
            {Object.entries(assignedByAvailability).map(([status, people]) => (
              <Box key={status} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    label={status} 
                    color={getAvailabilityColor(status)} 
                    size="small" 
                    sx={{ mr: 1 }} 
                  />
                  <Typography variant="subtitle1">
                    {people.length} Personnel
                  </Typography>
                </Box>
                
                <Box sx={{ pl: 2 }}>
                  {people.map(person => (
                    <Box key={person.id} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {person.name} - {person.currentRole}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
            
            {assignedPersonnel.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No personnel assigned yet.
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Unassigned Personnel
            </Typography>
            
            {Object.entries(unassignedByAvailability).map(([status, people]) => (
              <Box key={status} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    label={status} 
                    color={getAvailabilityColor(status)} 
                    size="small" 
                    sx={{ mr: 1 }} 
                  />
                  <Typography variant="subtitle1">
                    {people.length} Personnel
                  </Typography>
                </Box>
                
                <Box sx={{ pl: 2 }}>
                  {people.map(person => (
                    <Box key={person.id} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {person.name} - {person.currentRole}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
            
            {unassignedPersonnel.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                All personnel are assigned.
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PersonnelAssignmentStatus;

// src/components/ReportsAndAnalytics/PhaseComparisonChart.js
import React from 'react';
import { Box, Card, CardContent, CardHeader, Typography, Divider, Grid, List, ListItem, ListItemText } from '@mui/material';

const PhaseComparisonChart = ({ currentOrgChart, futureOrgChart, factory }) => {
  // Calculate changes between current and future organization charts
  
  // Compare positions
  const currentTitles = currentOrgChart.nodes.map(node => node.title);
  const futureTitles = futureOrgChart.nodes.map(node => node.title);
  
  const addedPositions = futureTitles.filter(title => !currentTitles.includes(title));
  const removedPositions = currentTitles.filter(title => !futureTitles.includes(title));
  const unchangedPositions = currentTitles.filter(title => futureTitles.includes(title));
  
  // Calculate metrics
  const metrics = {
    currentPositionCount: currentOrgChart.nodes.length,
    futurePositionCount: futureOrgChart.nodes.length,
    addedPositionCount: addedPositions.length,
    removedPositionCount: removedPositions.length,
    unchangedPositionCount: unchangedPositions.length,
    
    currentConnectionCount: currentOrgChart.connections.length,
    futureConnectionCount: futureOrgChart.connections.length,
    connectionChange: futureOrgChart.connections.length - currentOrgChart.connections.length
  };
  
  return (
    <Card>
      <CardHeader title="Phase Comparison Analysis" />
      <CardContent>
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" paragraph>
            This analysis shows the differences between current and future organization states.
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Position Changes
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Current Position Count:</Typography>
                  <Typography variant="body1">{metrics.currentPositionCount}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Future Position Count:</Typography>
                  <Typography variant="body1">{metrics.futurePositionCount}</Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Added Positions:</Typography>
                  <Typography variant="body1" color="success.main">{metrics.addedPositionCount}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Removed Positions:</Typography>
                  <Typography variant="body1" color="error.main">{metrics.removedPositionCount}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Unchanged Positions:</Typography>
                  <Typography variant="body1">{metrics.unchangedPositionCount}</Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Net Position Change:</Typography>
                  <Typography 
                    variant="body1" 
                    color={metrics.futurePositionCount > metrics.currentPositionCount 
                      ? 'success.main' 
                      : metrics.futurePositionCount < metrics.currentPositionCount 
                        ? 'error.main' 
                        : 'text.primary'}
                  >
                    {metrics.futurePositionCount - metrics.currentPositionCount > 0 ? '+' : ''}
                    {metrics.futurePositionCount - metrics.currentPositionCount}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Reporting Structure Changes
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Current Reporting Lines:</Typography>
                  <Typography variant="body1">{metrics.currentConnectionCount}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Future Reporting Lines:</Typography>
                  <Typography variant="body1">{metrics.futureConnectionCount}</Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Net Reporting Line Change:</Typography>
                  <Typography 
                    variant="body1" 
                    color={metrics.connectionChange > 0 
                      ? 'success.main' 
                      : metrics.connectionChange < 0 
                        ? 'error.main' 
                        : 'text.primary'}
                  >
                    {metrics.connectionChange > 0 ? '+' : ''}
                    {metrics.connectionChange}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Added Positions
            </Typography>
            <List dense>
              {addedPositions.length > 0 ? (
                addedPositions.map((title, index) => (
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
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Removed Positions
            </Typography>
            <List dense>
              {removedPositions.length > 0 ? (
                removedPositions.map((title, index) => (
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
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PhaseComparisonChart;
