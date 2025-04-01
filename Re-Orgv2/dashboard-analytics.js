// src/components/Dashboard/DashboardAnalytics.js
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import PrintIcon from '@mui/icons-material/Print';
import InfoIcon from '@mui/icons-material/Info';
import { selectOrgChart } from '../../features/orgChartSlice';
import { selectRolesByFactory } from '../../features/roleSlice';
import { selectPersonnelByFactory } from '../../features/personnelSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import { selectFactories } from '../../features/focusFactorySlice';
import { selectCurrentPhase, selectPhases } from '../../features/phaseSlice';
import PdfExportService from '../../services/PdfExportService';

const DashboardAnalytics = () => {
  const currentFactory = useSelector(selectCurrentFactory);
  const factories = useSelector(selectFactories);
  const currentPhase = useSelector(selectCurrentPhase);
  const phases = useSelector(selectPhases);
  
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState(currentFactory);
  const [selectedPhase, setSelectedPhase] = useState(currentPhase);
  
  // Get data for the selected factory and phase
  const orgChart = useSelector(state => selectOrgChart(state, selectedPhase, selectedFactory));
  const roles = useSelector(state => selectRolesByFactory(state, selectedFactory));
  const personnel = useSelector(state => selectPersonnelByFactory(state, selectedFactory));
  
  // Get comparison data (for current vs future)
  const currentOrgChart = useSelector(state => selectOrgChart(state, 'current', selectedFactory));
  const futureOrgChart = useSelector(state => selectOrgChart(state, 'future', selectedFactory));
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleFactoryChange = (factory) => {
    setSelectedFactory(factory);
  };
  
  const handlePhaseChange = (phase) => {
    setSelectedPhase(phase);
  };
  
  const handleExportPdf = () => {
    setIsLoading(true);
    
    // Generate dashboard data
    const dashboardData = {
      factory: selectedFactory,
      phase: selectedPhase,
      organizationMetrics: calculateOrganizationMetrics(),
      roleDistribution: calculateRoleDistribution(),
      personnelMetrics: calculatePersonnelMetrics(),
      comparisonMetrics: calculateComparisonMetrics()
    };
    
    // Use the PDF Export Service
    PdfExportService.exportDashboard(dashboardData)
      .then(() => {
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error exporting dashboard:', error);
        setIsLoading(false);
      });
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const calculateOrganizationMetrics = () => {
    // Calculate basic organization metrics
    const positionCount = orgChart.nodes.length;
    const reportingLineCount = orgChart.connections.length;
    
    // Calculate span of control (average direct reports per manager)
    const managersCount = new Set(orgChart.connections.map(conn => conn.sourceId)).size;
    const spanOfControl = managersCount > 0 ? (reportingLineCount / managersCount).toFixed(2) : 0;
    
    // Calculate organization depth (longest path from root to leaf)
    const orgDepth = calculateOrgDepth(orgChart);
    
    // Calculate organization width (max nodes at any level)
    const orgWidth = calculateOrgWidth(orgChart);
    
    return {
      positionCount,
      reportingLineCount,
      spanOfControl,
      orgDepth,
      orgWidth
    };
  };
  
  const calculateOrgDepth = (chart) => {
    // In a real implementation, this would use a graph traversal algorithm
    // This is a simplified implementation
    if (chart.nodes.length === 0) return 0;
    
    // Create a map of node IDs to their connections
    const nodeConnections = {};
    chart.nodes.forEach(node => {
      nodeConnections[node.id] = {
        outgoing: [],
        incoming: []
      };
    });
    
    chart.connections.forEach(conn => {
      nodeConnections[conn.sourceId].outgoing.push(conn.targetId);
      nodeConnections[conn.targetId].incoming.push(conn.sourceId);
    });
    
    // Find root nodes (nodes with no incoming connections)
    const rootNodes = chart.nodes.filter(node => 
      nodeConnections[node.id].incoming.length === 0
    ).map(node => node.id);
    
    if (rootNodes.length === 0) return 1; // No roots, just return minimum depth
    
    // DFS to find max depth
    const visited = new Set();
    let maxDepth = 0;
    
    const dfs = (nodeId, depth) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      maxDepth = Math.max(maxDepth, depth);
      
      nodeConnections[nodeId].outgoing.forEach(childId => {
        dfs(childId, depth + 1);
      });
    };
    
    rootNodes.forEach(rootId => {
      dfs(rootId, 1);
    });
    
    return maxDepth;
  };
  
  const calculateOrgWidth = (chart) => {
    // In a real implementation, this would calculate the maximum number of nodes at any depth
    // This is a simplified implementation
    if (chart.nodes.length === 0) return 0;
    
    return Math.ceil(chart.nodes.length / Math.max(calculateOrgDepth(chart), 1));
  };
  
  const calculateRoleDistribution = () => {
    // Group roles by department
    const departments = {};
    
    roles.forEach(role => {
      const dept = role.department || 'Uncategorized';
      if (!departments[dept]) {
        departments[dept] = {
          total: 0,
          assigned: 0,
          unassigned: 0
        };
      }
      
      departments[dept].total++;
      
      // Check if this role is assigned to any position
      const isAssigned = orgChart.nodes.some(node => 
        node.roles && node.roles.includes(role.id)
      );
      
      if (isAssigned) {
        departments[dept].assigned++;
      } else {
        departments[dept].unassigned++;
      }
    });
    
    // Convert to array for chart data
    return Object.entries(departments).map(([name, data]) => ({
      name,
      total: data.total,
      assigned: data.assigned,
      unassigned: data.unassigned,
      assignmentRate: data.total > 0 ? ((data.assigned / data.total) * 100).toFixed(0) : 0
    }));
  };
  
  const calculatePersonnelMetrics = () => {
    // Calculate personnel assignment metrics
    const totalPersonnel = personnel.length;
    
    // Count personnel assigned to positions
    const assignedPersonnelIds = new Set();
    orgChart.nodes.forEach(node => {
      if (node.personnel) {
        node.personnel.forEach(id => assignedPersonnelIds.add(id));
      }
    });
    
    const assignedCount = assignedPersonnelIds.size;
    const unassignedCount = totalPersonnel - assignedCount;
    const assignmentRate = totalPersonnel > 0 ? ((assignedCount / totalPersonnel) * 100).toFixed(0) : 0;
    
    // Group by availability
    const availabilityGroups = {
      'Available': 0,
      'Partially Available': 0,
      'Not Available': 0,
      'Unknown': 0
    };
    
    personnel.forEach(person => {
      const availability = person.availability || 'Unknown';
      if (availabilityGroups.hasOwnProperty(availability)) {
        availabilityGroups[availability]++;
      } else {
        availabilityGroups['Unknown']++;
      }
    });
    
    // Group by experience level
    const experienceGroups = {};
    
    personnel.forEach(person => {
      const experience = person.experience || 'Unknown';
      if (!experienceGroups[experience]) {
        experienceGroups[experience] = 0;
      }
      experienceGroups[experience]++;
    });
    
    return {
      totalPersonnel,
      assignedCount,
      unassignedCount,
      assignmentRate,
      availabilityGroups,
      experienceGroups
    };
  };
  
  const calculateComparisonMetrics = () => {
    // Calculate metrics for comparison between current and future states
    const current = {
      positionCount: currentOrgChart.nodes.length,
      reportingLineCount: currentOrgChart.connections.length,
      depth: calculateOrgDepth(currentOrgChart),
      width: calculateOrgWidth(currentOrgChart)
    };
    
    const future = {
      positionCount: futureOrgChart.nodes.length,
      reportingLineCount: futureOrgChart.connections.length,
      depth: calculateOrgDepth(futureOrgChart),
      width: calculateOrgWidth(futureOrgChart)
    };
    
    // Calculate changes
    const changes = {
      positionChange: future.positionCount - current.positionCount,
      positionChangePercent: current.positionCount > 0 
        ? ((future.positionCount - current.positionCount) / current.positionCount * 100).toFixed(1)
        : 0,
      reportingLineChange: future.reportingLineCount - current.reportingLineCount,
      reportingLineChangePercent: current.reportingLineCount > 0
        ? ((future.reportingLineCount - current.reportingLineCount) / current.reportingLineCount * 100).toFixed(1)
        : 0,
      depthChange: future.depth - current.depth,
      depthChangePercent: current.depth > 0
        ? ((future.depth - current.depth) / current.depth * 100).toFixed(1)
        : 0,
      widthChange: future.width - current.width,
      widthChangePercent: current.width > 0
        ? ((future.width - current.width) / current.width * 100).toFixed(1)
        : 0
    };
    
    // Calculate added/removed positions (by title)
    const currentPositionTitles = currentOrgChart.nodes.map(node => node.title);
    const futurePositionTitles = futureOrgChart.nodes.map(node => node.title);
    
    const addedPositions = futurePositionTitles.filter(title => 
      !currentPositionTitles.includes(title)
    );
    
    const removedPositions = currentPositionTitles.filter(title => 
      !futurePositionTitles.includes(title)
    );
    
    return {
      current,
      future,
      changes,
      addedPositions,
      removedPositions
    };
  };
  
  // Calculate all metrics
  const organizationMetrics = calculateOrganizationMetrics();
  const roleDistribution = calculateRoleDistribution();
  const personnelMetrics = calculatePersonnelMetrics();
  const comparisonMetrics = calculateComparisonMetrics();
  
  // Prepare data for charts
  const departmentChartData = roleDistribution.map(dept => ({
    name: dept.name,
    Assigned: dept.assigned,
    Unassigned: dept.unassigned
  }));
  
  const availabilityChartData = Object.entries(personnelMetrics.availabilityGroups)
    .filter(([status, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count
    }));
  
  const experienceChartData = Object.entries(personnelMetrics.experienceGroups)
    .filter(([exp, count]) => count > 0)
    .map(([exp, count]) => ({
      name: exp,
      value: count
    }));
  
  const comparisonChartData = [
    {
      name: 'Positions',
      Current: comparisonMetrics.current.positionCount,
      Future: comparisonMetrics.future.positionCount
    },
    {
      name: 'Reporting Lines',
      Current: comparisonMetrics.current.reportingLineCount,
      Future: comparisonMetrics.future.reportingLineCount
    },
    {
      name: 'Depth',
      Current: comparisonMetrics.current.depth,
      Future: comparisonMetrics.future.depth
    },
    {
      name: 'Width',
      Current: comparisonMetrics.current.width,
      Future: comparisonMetrics.future.width
    }
  ];
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Organization Analytics Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button 
            variant="contained" 
            startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <CloudDownloadIcon />}
            onClick={handleExportPdf}
            disabled={isLoading}
          >
            Export as PDF
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Viewing data for:
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Focus Factory:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {factories.map(factory => (
                    <Button
                      key={factory}
                      variant={factory === selectedFactory ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleFactoryChange(factory)}
                      sx={{
                        minWidth: 0,
                        px: 1.5
                      }}
                    >
                      {factory}
                    </Button>
                  ))}
                </Box>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Phase:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {phases.map(phase => (
                    <Button
                      key={phase}
                      variant={phase === selectedPhase ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handlePhaseChange(phase)}
                      sx={{
                        minWidth: 0,
                        px: 1.5,
                        textTransform: 'capitalize'
                      }}
                    >
                      {phase}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab label="Organization Overview" />
          <Tab label="Role Analysis" />
          <Tab label="Personnel Analysis" />
          <Tab label="Current vs Future" />
        </Tabs>
        
        {/* Tab 1: Organization Overview */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader 
                  title="Structure Metrics" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Typography variant="body2">Total Positions</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="bold">
                              {organizationMetrics.positionCount}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography variant="body2">Reporting Lines</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="bold">
                              {organizationMetrics.reportingLineCount}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography variant="body2">Organizational Depth</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="bold">
                              {organizationMetrics.orgDepth} levels
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography variant="body2">Organizational Width</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="bold">
                              {organizationMetrics.orgWidth} positions
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2">Span of Control</Typography>
                              <Tooltip title="Average number of direct reports per manager">
                                <IconButton size="small">
                                  <InfoIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="bold">
                              {organizationMetrics.spanOfControl}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardHeader 
                  title="Department Distribution" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="Assigned" stackId="a" fill="#82ca9d" />
                      <Bar dataKey="Unassigned" stackId="a" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader 
                  title="Key Insights" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Structure Efficiency
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {
                            organizationMetrics.spanOfControl > 7 ? 
                              'The organization has a high span of control, which may indicate an efficient flat structure but could lead to management challenges.' :
                            organizationMetrics.spanOfControl < 3 ?
                              'The organization has a low span of control, which may indicate too many management layers and potential inefficiency.' :
                              'The organization has a balanced span of control, indicating a good balance between management oversight and efficiency.'
                          }
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Role Assignment
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {
                            roleDistribution.reduce((sum, dept) => sum + dept.unassigned, 0) > 
                            roleDistribution.reduce((sum, dept) => sum + dept.assigned, 0) ?
                              'There is a high number of unassigned roles, which may indicate redundant role definitions or incomplete organization design.' :
                              'Most roles are assigned to positions, indicating a well-defined organization structure.'
                          }
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Department Balance
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {
                            roleDistribution.length === 1 ?
                              'The organization has only one department, which may indicate a specialized focus but potential lack of diversity in functions.' :
                            roleDistribution.length > 5 ?
                              'The organization has many departments, indicating a diverse set of functions but potential complexity in coordination.' :
                              'The organization has a balanced number of departments, indicating good functional separation without excessive complexity.'
                          }
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Tab 2: Role Analysis */}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader 
                  title="Role Distribution by Department" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent sx={{ height: 350 }}>
                  {roleDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={departmentChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="Assigned" fill="#82ca9d" name="Assigned Roles" />
                        <Bar dataKey="Unassigned" fill="#ffc658" name="Unassigned Roles" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        No roles defined yet
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader 
                  title="Role Assignment Rates" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Department</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="right">Assigned</TableCell>
                          <TableCell align="right">Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {roleDistribution.map((dept) => (
                          <TableRow key={dept.name}>
                            <TableCell>{dept.name}</TableCell>
                            <TableCell align="right">{dept.total}</TableCell>
                            <TableCell align="right">{dept.assigned}</TableCell>
                            <TableCell 
                              align="right"
                              sx={{ 
                                color: 
                                  dept.assignmentRate > 80 ? 'success.main' : 
                                  dept.assignmentRate > 50 ? 'primary.main' : 
                                  dept.assignmentRate > 30 ? 'warning.main' : 
                                  'error.main'
                              }}
                            >
                              {dept.assignmentRate}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader 
                  title="Role Details" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <Divider />
                <CardContent sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Role Title</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Position Assignment</TableCell>
                          <TableCell>Required Skills</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {roles.map((role) => {
                          // Find positions where this role is assigned
                          const assignedPositions = orgChart.nodes.filter(node => 
                            node.roles && node.roles.includes(role.id)
                          ).map(node => node.title);
                          
                          return (
                            <TableRow key={role.id}>
                              <TableCell>{role.title}</TableCell>
                              <TableCell>{role.department || 'Uncategorized'}</TableCell>
                              <TableCell>
                                {assignedPositions.length > 0 ? (
                                  <Typography variant="body2" color="success.main">
                                    Assigned
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="warning.main">
                                    Unassigned
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {assignedPositions.length > 0 ? (
                                  <Typography variant="body2">
                                    {assignedPositions.join(', ')}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    Not assigned
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {role.skills && role.skills.length > 0 ? (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {role.skills.map((skill, index) => (
                                      <Chip 
                                        key={index} 
                                        label={skill} 
                                        size="small" 
                                        variant="outlined"
                                      />
                                    ))}
                                  </Box>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No skills specified
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Tab 3: Personnel Analysis */}
        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader 
                  title="Personnel Assignment Status" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="h3" align="center">
                        {personnelMetrics.assignmentRate}%
                      </Typography>
                      <Typography variant="body2" align="center" color="text.secondary">
                        Assignment Rate
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                        <TableContainer>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell>
                                  <Typography variant="body2">Total Personnel</Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body1" fontWeight="bold">
                                    {personnelMetrics.totalPersonnel}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography variant="body2">Assigned</Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body1" fontWeight="bold" color="success.main">
                                    {personnelMetrics.assignedCount}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography variant="body2">Unassigned</Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body1" fontWeight="bold" color="warning.main">
                                    {personnelMetrics.unassignedCount}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader 
                  title="Availability Distribution" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent sx={{ height: 230 }}>
                  {availabilityChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={availabilityChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {availabilityChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        No personnel data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader 
                  title="Experience Level Distribution" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent sx={{ height: 230 }}>
                  {experienceChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={experienceChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {experienceChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        No experience data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader 
                  title="Skill Coverage Analysis" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <Divider />
                <CardContent>
                  <Typography variant="body2" paragraph>
                    This analysis shows the distribution of skills across personnel and identifies potential skill gaps.
                  </Typography>
                  
                  {/* Extract all unique skills */}
                  {(() => {
                    // Get all unique skills from roles
                    const requiredSkills = new Set();
                    roles.forEach(role => {
                      if (role.skills) {
                        role.skills.forEach(skill => requiredSkills.add(skill));
                      }
                    });
                    
                    // Create a map of skills to personnel counts
                    const skillCoverage = {};
                    Array.from(requiredSkills).forEach(skill => {
                      skillCoverage[skill] = {
                        required: roles.filter(role => 
                          role.skills && role.skills.includes(skill)
                        ).length,
                        available: personnel.filter(person => 
                          person.skills && person.skills.includes(skill)
                        ).length
                      };
                    });
                    
                    // Convert to array for rendering
                    const skillCoverageArray = Object.entries(skillCoverage)
                      .map(([skill, data]) => ({
                        skill,
                        required: data.required,
                        available: data.available,
                        coverage: data.required > 0 
                          ? (data.available / data.required) 
                          : data.available > 0 ? 2 : 0
                      }))
                      .sort((a, b) => a.coverage - b.coverage);
                    
                    return (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Skill</TableCell>
                              <TableCell align="right">Required</TableCell>
                              <TableCell align="right">Available</TableCell>
                              <TableCell align="right">Coverage</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {skillCoverageArray.map((item) => (
                              <TableRow key={item.skill}>
                                <TableCell>{item.skill}</TableCell>
                                <TableCell align="right">{item.required}</TableCell>
                                <TableCell align="right">{item.available}</TableCell>
                                <TableCell align="right">
                                  {item.required > 0 
                                    ? `${(item.coverage * 100).toFixed(0)}%` 
                                    : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  {item.coverage >= 1.5 ? (
                                    <Typography variant="body2" color="success.main">
                                      Well covered
                                    </Typography>
                                  ) : item.coverage >= 1 ? (
                                    <Typography variant="body2" color="primary.main">
                                      Adequately covered
                                    </Typography>
                                  ) : item.coverage > 0 ? (
                                    <Typography variant="body2" color="warning.main">
                                      Potential shortage
                                    </Typography>
                                  ) : (
                                    <Typography variant="body2" color="error.main">
                                      Critical gap
                                    </Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Tab 4: Current vs Future */}
        {tabValue === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader 
                  title="Current vs Future Comparison" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="Current" fill="#8884d8" name="Current State" />
                      <Bar dataKey="Future" fill="#82ca9d" name="Future State" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Change Analysis" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Metric</TableCell>
                          <TableCell align="right">Current</TableCell>
                          <TableCell align="right">Future</TableCell>
                          <TableCell align="right">Change</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Positions</TableCell>
                          <TableCell align="right">{comparisonMetrics.current.positionCount}</TableCell>
                          <TableCell align="right">{comparisonMetrics.future.positionCount}</TableCell>
                          <TableCell align="right" sx={{ 
                            color: comparisonMetrics.changes.positionChange > 0 
                              ? 'success.main' 
                              : comparisonMetrics.changes.positionChange < 0 
                                ? 'error.main' 
                                : 'text.primary'
                          }}>
                            {comparisonMetrics.changes.positionChange > 0 ? '+' : ''}
                            {comparisonMetrics.changes.positionChange} ({comparisonMetrics.changes.positionChangePercent}%)
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Reporting Lines</TableCell>
                          <TableCell align="right">{comparisonMetrics.current.reportingLineCount}</TableCell>
                          <TableCell align="right">{comparisonMetrics.future.reportingLineCount}</TableCell>
                          <TableCell align="right" sx={{ 
                            color: comparisonMetrics.changes.reportingLineChange > 0 
                              ? 'success.main' 
                              : comparisonMetrics.changes.reportingLineChange < 0 
                                ? 'error.main' 
                                : 'text.primary'
                          }}>
                            {comparisonMetrics.changes.reportingLineChange > 0 ? '+' : ''}
                            {comparisonMetrics.changes.reportingLineChange} ({comparisonMetrics.changes.reportingLineChangePercent}%)
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Depth</TableCell>
                          <TableCell align="right">{comparisonMetrics.current.depth}</TableCell>
                          <TableCell align="right">{comparisonMetrics.future.depth}</TableCell>
                          <TableCell align="right" sx={{ 
                            color: comparisonMetrics.changes.depthChange > 0 
                              ? 'warning.main' 
                              : comparisonMetrics.changes.depthChange < 0 
                                ? 'success.main' 
                                : 'text.primary'
                          }}>
                            {comparisonMetrics.changes.depthChange > 0 ? '+' : ''}
                            {comparisonMetrics.changes.depthChange} ({comparisonMetrics.changes.depthChangePercent}%)
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Width</TableCell>
                          <TableCell align="right">{comparisonMetrics.current.width}</TableCell>
                          <TableCell align="right">{comparisonMetrics.future.width}</TableCell>
                          <TableCell align="right" sx={{ 
                            color: comparisonMetrics.changes.widthChange > 0 
                              ? 'primary.main' 
                              : comparisonMetrics.changes.widthChange < 0 
                                ? 'warning.main' 
                                : 'text.primary'
                          }}>
                            {comparisonMetrics.changes.widthChange > 0 ? '+' : ''}
                            {comparisonMetrics.changes.widthChange} ({comparisonMetrics.changes.widthChangePercent}%)
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Position Changes" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Added Positions ({comparisonMetrics.addedPositions.length})
                      </Typography>
                      {comparisonMetrics.addedPositions.length > 0 ? (
                        <List dense>
                          {comparisonMetrics.addedPositions.map((position, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={position} />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No positions added
                        </Typography>
                      )}
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Removed Positions ({comparisonMetrics.removedPositions.length})
                      </Typography>
                      {comparisonMetrics.removedPositions.length > 0 ? (
                        <List dense>
                          {comparisonMetrics.removedPositions.map((position, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={position} />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No positions removed
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader 
                  title="Transformation Summary" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <Typography variant="body1" paragraph>
                    {
                      comparisonMetrics.future.positionCount > comparisonMetrics.current.positionCount ?
                        `The organization is expanding with ${comparisonMetrics.changes.positionChange} new positions (${comparisonMetrics.changes.positionChangePercent}% increase). ` :
                      comparisonMetrics.future.positionCount < comparisonMetrics.current.positionCount ?
                        `The organization is contracting with ${Math.abs(comparisonMetrics.changes.positionChange)} positions being eliminated (${Math.abs(comparisonMetrics.changes.positionChangePercent)}% decrease). ` :
                        'The organization is maintaining the same number of positions. '
                    }
                    
                    {
                      comparisonMetrics.future.depth > comparisonMetrics.current.depth ?
                        `The organizational depth is increasing, which may indicate more hierarchical layers. ` :
                      comparisonMetrics.future.depth < comparisonMetrics.current.depth ?
                        `The organizational depth is decreasing, which suggests a flatter structure. ` :
                        'The organizational depth remains unchanged. '
                    }
                    
                    {
                      comparisonMetrics.future.width > comparisonMetrics.current.width ?
                        `The organization is becoming wider, with more positions at each level. ` :
                      comparisonMetrics.future.width < comparisonMetrics.current.width ?
                        `The organization is becoming narrower, with fewer positions at each level. ` :
                        'The organizational width remains unchanged. '
                    }
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    {
                      comparisonMetrics.addedPositions.length > 0 && comparisonMetrics.removedPositions.length > 0 ?
                        `This transformation involves both adding ${comparisonMetrics.addedPositions.length} new positions and removing ${comparisonMetrics.removedPositions.length} existing positions, indicating a significant reorganization rather than just growth or reduction.` :
                      comparisonMetrics.addedPositions.length > 0 ?
                        `This transformation focuses on adding ${comparisonMetrics.addedPositions.length} new positions without removing existing ones, indicating growth and expansion.` :
                      comparisonMetrics.removedPositions.length > 0 ?
                        `This transformation focuses on removing ${comparisonMetrics.removedPositions.length} positions without adding new ones, indicating consolidation or downsizing.` :
                        'This transformation maintains the same positions but may involve internal changes in reporting structure or role assignments.'
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default DashboardAnalytics;