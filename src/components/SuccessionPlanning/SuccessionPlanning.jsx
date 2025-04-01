import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  Slider
} from '@mui/material';
import { 
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts';

const SuccessionPlanning = () => {
  const currentFactory = useSelector(state => state.focusFactory.currentFactory);
  const roles = useSelector(state => state.roles.roles[currentFactory]);
  const personnel = useSelector(state => state.personnel.personnel[currentFactory]);
  
  const [currentTab, setCurrentTab] = useState(0);
  const [criticalRoles, setCriticalRoles] = useState([]);
  const [successors, setSuccessors] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSuccessor, setCurrentSuccessor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskAssessment, setRiskAssessment] = useState([]);

  useEffect(() => {
    // Generate sample critical roles based on real roles
    generateCriticalRoles();
    
    // Generate sample successors
    generateSuccessors();
    
    // Generate risk assessment
    generateRiskAssessment();
  }, [currentFactory, roles, personnel]);
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Generate critical roles
  const generateCriticalRoles = () => {
    // Assume some roles are critical based on criteria like level or title
    const critical = roles
      .filter(role => 
        role.level === 'L5' || 
        role.level === 'L6' || 
        role.level === 'L7' || 
        role.title.includes('Manager') ||
        role.title.includes('Director') ||
        role.title.includes('Head')
      )
      .map(role => ({
        roleId: role.id,
        title: role.title,
        level: role.level,
        department: role.department,
        criticality: role.level === 'L7' ? 'Very High' : 
                     role.level === 'L6' ? 'High' : 
                     role.level === 'L5' ? 'Medium' : 'Low',
        vacancyImpact: role.level === 'L7' ? 'Severe' : 
                       role.level === 'L6' ? 'Major' : 
                       role.level === 'L5' ? 'Moderate' : 'Minor',
        timeToHire: role.level === 'L7' ? '6+ months' : 
                    role.level === 'L6' ? '4-6 months' : 
                    role.level === 'L5' ? '3-4 months' : '1-2 months',
        successorCount: Math.floor(Math.random() * 3) // Random 0-2 successors
      }));
    
    setCriticalRoles(critical);
  };
  
  // Filtered successors based on search term
  const filteredSuccessors = successors.filter(successor => 
    searchTerm === '' || 
    successor.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    successor.currentRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
    successor.readiness.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Prepare data for charts
  const readinessData = [
    { name: 'Ready Now', value: successors.filter(s => s.readiness === 'Ready Now').length },
    { name: 'Ready Soon', value: successors.filter(s => s.readiness === 'Ready Soon').length },
    { name: 'Ready Future', value: successors.filter(s => s.readiness === 'Ready Future').length }
  ];
  
  const criticalityData = [
    { name: 'Very High', value: criticalRoles.filter(r => r.criticality === 'Very High').length },
    { name: 'High', value: criticalRoles.filter(r => r.criticality === 'High').length },
    { name: 'Medium', value: criticalRoles.filter(r => r.criticality === 'Medium').length },
    { name: 'Low', value: criticalRoles.filter(r => r.criticality === 'Low').length }
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Create radar chart data for successor potential
  const successorPotentialData = successors.map(successor => ({
    subject: successor.personName,
    performance: successor.performanceRating * 20, // Scale to 0-100
    potential: successor.potentialRating * 20,     // Scale to 0-100
    readiness: successor.readinessLevel
  }));
  
  // Successor matrix data (performance vs potential)
  const successorMatrixData = successors.map(successor => ({
    x: successor.performanceRating * 20,
    y: successor.potentialRating * 20,
    z: 50, // Size
    name: successor.personName,
    currentRole: successor.currentRole,
    readiness: successor.readiness
  }));

  // Generate successors
  const generateSuccessors = () => {
    const sampleSuccessors = [
      {
        id: 'succ_1',
        roleId: roles.find(r => r.title.includes('Manager'))?.id || 'unknown',
        personId: personnel[0]?.id || 'unknown',
        personName: personnel[0]?.name || 'John Smith',
        currentRole: 'Quality Specialist',
        readiness: 'Ready Now',
        readinessLevel: 95,
        timeToReady: '0-3 months',
        developmentNeeds: ['Leadership Training', 'Project Management'],
        developmentPlan: 'Mentoring with current Quality Manager, advanced GMP training',
        performanceRating: 4.5,
        potentialRating: 4
      },
      // ... rest of the sample successors as provided ...
    ];
    
    setSuccessors(sampleSuccessors);
  };
  
  // Generate risk assessment
  const generateRiskAssessment = () => {
    const sampleRiskAssessment = [
      {
        id: 'risk_1',
        roleId: roles.find(r => r.title.includes('Manager'))?.id || 'unknown',
        roleTitle: 'Quality Manager',
        riskLevel: 'Medium',
        riskScore: 65,
        retirementRisk: 'Low',
        turnoverRisk: 'Medium',
        marketDemand: 'High',
        successionDepth: 'Good',
        mitigationPlan: 'Develop two ready successors, improve knowledge transfer'
      },
      // ... rest of the sample risk assessments as provided ...
    ];
    
    setRiskAssessment(sampleRiskAssessment);
  };
  
  // Add successor dialog functions
  const handleAddSuccessor = () => {
    setCurrentSuccessor({
      id: '',
      roleId: criticalRoles[0]?.roleId || '',
      personId: '',
      personName: '',
      currentRole: '',
      readiness: 'Ready Future',
      readinessLevel: 50,
      timeToReady: '6-12 months',
      developmentNeeds: [],
      developmentPlan: '',
      performanceRating: 3,
      potentialRating: 3
    });
    setDialogOpen(true);
  };

  const handleEditSuccessor = (successor) => {
    setCurrentSuccessor({...successor});
    setDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentSuccessor(null);
  };
  
  const handleSaveSuccessor = () => {
    if (currentSuccessor.id) {
      // Update existing
      setSuccessors(prevSuccessors => 
        prevSuccessors.map(succ => succ.id === currentSuccessor.id ? currentSuccessor : succ)
      );
    } else {
      // Add new
      setSuccessors(prevSuccessors => [
        ...prevSuccessors,
        {
          ...currentSuccessor,
          id: `succ_${Date.now()}`
        }
      ]);
    }
    handleDialogClose();
  };
  
  const handleDeleteSuccessor = (successorId) => {
    setSuccessors(prevSuccessors => prevSuccessors.filter(succ => succ.id !== successorId));
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSuccessor(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle readiness level change
  const handleReadinessLevelChange = (e, value) => {
    setCurrentSuccessor(prev => {
      let readiness;
      if (value >= 80) {
        readiness = 'Ready Now';
      } else if (value >= 60) {
        readiness = 'Ready Soon';
      } else {
        readiness = 'Ready Future';
      }
      
      return {
        ...prev,
        readinessLevel: value,
        readiness
      };
    });
  };
  
  // Handle development needs change
  const handleDevelopmentNeedsChange = (e) => {
    const needs = e.target.value
      .split(',')
      .map(need => need.trim())
      .filter(need => need !== '');
    
    setCurrentSuccessor(prev => ({
      ...prev,
      developmentNeeds: needs
    }));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">
          Succession Planning
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search successors..."
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
            }}
          />
          
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddSuccessor}
          >
            Add Successor
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Critical Roles" />
          <Tab label="Successors" />
          <Tab label="Risk Assessment" />
        </Tabs>
      </Box>
      
      {/* Overview Tab */}
      {currentTab === 0 && (
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Succession Planning Overview
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The succession planning program identifies critical roles and develops qualified 
                    successors to ensure leadership continuity. This dashboard shows 
                    {criticalRoles.length} critical roles and {successors.length} potential successors.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h3" color="primary">
                          {criticalRoles.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Critical Roles
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h3" color="success.main">
                          {successors.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Identified Successors
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h3" color={
                          successors.filter(s => s.readiness === 'Ready Now').length > 0 
                            ? 'success.main' 
                            : 'error.main'
                        }>
                          {successors.filter(s => s.readiness === 'Ready Now').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ready Now Successors
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Successor Readiness
                  </Typography>
                  <Box sx={{ height: 200, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={readinessData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#8884d8" name="Successors" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Role Criticality
                  </Typography>
                  <Box sx={{ height: 200, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={criticalityData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#82ca9d" name="Roles" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Successor Matrix (Performance vs Potential)
                  </Typography>
                  <Box sx={{ height: 300, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <CartesianGrid />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          name="Performance" 
                          domain={[0, 100]} 
                          label={{ value: 'Performance', position: 'bottom' }}
                          unit="%"
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          name="Potential" 
                          domain={[0, 100]} 
                          label={{ value: 'Potential', angle: -90, position: 'left' }}
                          unit="%"
                        />
                        <ZAxis type="number" dataKey="z" range={[50, 500]} />
                        <RechartsTooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div style={{ 
                                  backgroundColor: '#fff', 
                                  border: '1px solid #ccc',
                                  padding: '10px',
                                  borderRadius: '5px'
                                }}>
                                  <p style={{ margin: 0 }}><strong>{data.name}</strong></p>
                                  <p style={{ margin: 0 }}>{data.currentRole}</p>
                                  <p style={{ margin: 0 }}>Performance: {data.x}%</p>
                                  <p style={{ margin: 0 }}>Potential: {data.y}%</p>
                                  <p style={{ margin: 0 }}>Readiness: {data.readiness}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter 
                          name="Successors" 
                          data={successorMatrixData} 
                          fill="#8884d8"
                        >
                          {successorMatrixData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.readiness === 'Ready Now' ? '#00C49F' :
                                entry.readiness === 'Ready Soon' ? '#FFBB28' : '#FF8042'
                              } 
                            />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Risk Analysis
                  </Typography>
                  <List>
                    {riskAssessment.map((risk) => (
                      <ListItem key={risk.id}>
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: 
                                risk.riskLevel === 'Very High' ? 'error.main' :
                                risk.riskLevel === 'High' ? 'warning.main' :
                                risk.riskLevel === 'Medium' ? 'info.main' : 'success.main'
                            }}
                          >
                            <WarningIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={risk.roleTitle}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                Risk Level: {risk.riskLevel}
                              </Typography>
                              <br />
                              <Typography variant="body2">
                                Succession Depth: {risk.successionDepth}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Recommendations
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Gap Analysis
                        </Typography>
                        <Typography variant="body2">
                          Increase the pipeline for Quality Director and VP of Quality roles, 
                          which currently have limited or poor succession depth.
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          <TimelineIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Development Plans
                        </Typography>
                        <Typography variant="body2">
                          Accelerate development for 'Ready Soon' successors to increase 
                          the bench strength for critical roles.
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          <AssessmentIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Risk Mitigation
                        </Typography>
                        <Typography variant="body2">
                          Develop interim leadership plans and knowledge transfer protocols 
                          for high-risk roles to minimize disruption in case of vacancy.
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Critical Roles Tab */}
      {currentTab === 1 && (
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Role Title</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Criticality</TableCell>
                  <TableCell>Vacancy Impact</TableCell>
                  <TableCell>Time to Hire</TableCell>
                  <TableCell>Successors</TableCell>
                  <TableCell>Risk Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {criticalRoles.map(role => {
                  // Find risk assessment for this role
                  const risk = riskAssessment.find(r => r.roleId === role.roleId);
                  
                  // Count successors for this role
                  const roleSuccessors = successors.filter(s => s.roleId === role.roleId);
                  const readyNowCount = roleSuccessors.filter(s => s.readiness === 'Ready Now').length;
                  const readySoonCount = roleSuccessors.filter(s => s.readiness === 'Ready Soon').length;
                  const readyFutureCount = roleSuccessors.filter(s => s.readiness === 'Ready Future').length;
                  
                  return (
                    <TableRow key={role.roleId}>
                      <TableCell>{role.title}</TableCell>
                      <TableCell>{role.department}</TableCell>
                      <TableCell>{role.level}</TableCell>
                      <TableCell>
                        <Chip 
                          label={role.criticality} 
                          size="small" 
                          color={
                            role.criticality === 'Very High' ? 'error' :
                            role.criticality === 'High' ? 'warning' :
                            role.criticality === 'Medium' ? 'info' : 'success'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={role.vacancyImpact} 
                          size="small" 
                          color={
                            role.vacancyImpact === 'Severe' ? 'error' :
                            role.vacancyImpact === 'Major' ? 'warning' :
                            role.vacancyImpact === 'Moderate' ? 'info' : 'success'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{role.timeToHire}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {readyNowCount + readySoonCount + readyFutureCount}
                          </Typography>
                          <Tooltip title={`Ready Now: ${readyNowCount}, Ready Soon: ${readySoonCount}, Ready Future: ${readyFutureCount}`}>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'warning.main' }} />
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main' }} />
                            </Box>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={risk?.riskLevel || 'Unknown'} 
                          size="small" 
                          color={
                            risk?.riskLevel === 'Very High' ? 'error' :
                            risk?.riskLevel === 'High' ? 'warning' :
                            risk?.riskLevel === 'Medium' ? 'info' : 'success'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {criticalRoles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No critical roles defined yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      
      {/* Successors Tab */}
      {currentTab === 2 && (
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Successor</TableCell>
                  <TableCell>Current Role</TableCell>
                  <TableCell>Target Role</TableCell>
                  <TableCell>Readiness</TableCell>
                  <TableCell>Readiness Level</TableCell>
                  <TableCell>Time to Ready</TableCell>
                  <TableCell>Development Needs</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Potential</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSuccessors.map(successor => {
                  // Find the target role
                  const targetRole = criticalRoles.find(role => role.roleId === successor.roleId);
                  
                  return (
                    <TableRow key={successor.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                          <Typography variant="body2">{successor.personName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{successor.currentRole}</TableCell>
                      <TableCell>{targetRole?.title || 'Unknown'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={successor.readiness} 
                          size="small" 
                          color={
                            successor.readiness === 'Ready Now' ? 'success' :
                            successor.readiness === 'Ready Soon' ? 'warning' : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1, minWidth: 30 }}>
                            {successor.readinessLevel}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={successor.readinessLevel} 
                            sx={{ width: 50, height: 8, borderRadius: 5 }}
                            color={
                              successor.readinessLevel >= 80 ? 'success' :
                              successor.readinessLevel >= 60 ? 'warning' : 'error'
                            }
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{successor.timeToReady}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {successor.developmentNeeds.map((need, index) => (
                            <Chip 
                              key={index} 
                              label={need} 
                              size="small" 
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Rating value={successor.performanceRating} readOnly precision={0.5} size="small" />
                      </TableCell>
                      <TableCell>
                        <Rating value={successor.potentialRating} readOnly precision={0.5} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleEditSuccessor(successor)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteSuccessor(successor.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredSuccessors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No successors found. Add successors or adjust your search criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      
      {/* Risk Assessment Tab */}
      {currentTab === 3 && (
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <Grid container spacing={3}>
            {riskAssessment.map(risk => {
              const roleSuccessors = successors.filter(s => s.roleId === risk.roleId);
              
              return (
                <Grid item xs={12} md={6} key={risk.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">{risk.roleTitle}</Typography>
                        <Chip 
                          label={risk.riskLevel} 
                          size="small" 
                          color={
                            risk.riskLevel === 'Very High' ? 'error' :
                            risk.riskLevel === 'High' ? 'warning' :
                            risk.riskLevel === 'Medium' ? 'info' : 'success'
                          }
                        />
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Paper variant="outlined" sx={{ p: 1.5 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Risk Factors
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">Retirement Risk:</Typography>
                              <Chip 
                                label={risk.retirementRisk} 
                                size="small" 
                                color={
                                  risk.retirementRisk === 'High' ? 'error' :
                                  risk.retirementRisk === 'Medium' ? 'warning' : 'success'
                                }
                                variant="outlined"
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">Turnover Risk:</Typography>
                              <Chip 
                                label={risk.turnoverRisk} 
                                size="small" 
                                color={
                                  risk.turnoverRisk === 'High' ? 'error' :
                                  risk.turnoverRisk === 'Medium' ? 'warning' : 'success'
                                }
                                variant="outlined"
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Market Demand:</Typography>
                              <Chip 
                                label={risk.marketDemand} 
                                size="small" 
                                color={
                                  risk.marketDemand === 'Very High' || risk.marketDemand === 'High' ? 'error' :
                                  risk.marketDemand === 'Medium' ? 'warning' : 'success'
                                }
                                variant="outlined"
                              />
                            </Box>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Paper variant="outlined" sx={{ p: 1.5 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Succession Status
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">Succession Depth:</Typography>
                              <Chip 
                                label={risk.successionDepth} 
                                size="small" 
                                color={
                                  risk.successionDepth === 'Poor' ? 'error' :
                                  risk.successionDepth === 'Limited' ? 'warning' :
                                  risk.successionDepth === 'Good' ? 'info' : 'success'
                                }
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">Ready Now:</Typography>
                              <Typography variant="body2">
                                {roleSuccessors.filter(s => s.readiness === 'Ready Now').length}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Ready Soon:</Typography>
                              <Typography variant="body2">
                                {roleSuccessors.filter(s => s.readiness === 'Ready Soon').length}
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Mitigation Plan
                      </Typography>
                      <Typography variant="body2">
                        {risk.mitigationPlan}
                      </Typography>
                      
                      {roleSuccessors.length > 0 && (
                        <>
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            Successors
                          </Typography>
                          <List dense>
                            {roleSuccessors.map((successor, index) => (
                              <ListItem key={index}>
                                <ListItemAvatar>
                                  <Avatar 
                                    sx={{ 
                                      bgcolor: 
                                        successor.readiness === 'Ready Now' ? 'success.main' :
                                        successor.readiness === 'Ready Soon' ? 'warning.main' : 'error.main'
                                    }}
                                  >
                                    <PersonIcon />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={successor.personName}
                                  secondary={`${successor.currentRole} • ${successor.readiness} • ${successor.timeToReady}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
            {riskAssessment.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No risk assessments available.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
      
      {/* Successor Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentSuccessor?.id ? 'Edit Successor' : 'Add Successor'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Successor</InputLabel>
                <Select
                  name="personId"
                  value={currentSuccessor?.personId || ''}
                  onChange={(e) => {
                    const person = personnel.find(p => p.id === e.target.value);
                    handleInputChange({
                      target: { 
                        name: 'personId', 
                        value: e.target.value 
                      }
                    });
                    handleInputChange({
                      target: { 
                        name: 'personName', 
                        value: person?.name || ''
                      }
                    });
                    handleInputChange({
                      target: { 
                        name: 'currentRole', 
                        value: person?.currentRole || ''
                      }
                    });
                  }}
                  label="Successor"
                  required
                >
                  {personnel.map(person => (
                    <MenuItem key={person.id} value={person.id}>
                      {person.name} - {person.currentRole || 'No role'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Target Role</InputLabel>
                <Select
                  name="roleId"
                  value={currentSuccessor?.roleId || ''}
                  onChange={handleInputChange}
                  label="Target Role"
                  required
                >
                  {criticalRoles.map(role => (
                    <MenuItem key={role.roleId} value={role.roleId}>
                      {role.title} ({role.department})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Time to Ready</InputLabel>
                <Select
                  name="timeToReady"
                  value={currentSuccessor?.timeToReady || '6-12 months'}
                  onChange={handleInputChange}
                  label="Time to Ready"
                >
                  <MenuItem value="0-3 months">0-3 months</MenuItem>
                  <MenuItem value="3-6 months">3-6 months</MenuItem>
                  <MenuItem value="6-12 months">6-12 months</MenuItem>
                  <MenuItem value="12+ months">12+ months</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" gutterBottom>
                Readiness Level: {currentSuccessor?.readinessLevel || 50}%
              </Typography>
              <Box sx={{ px: 1 }}>
                <Slider
                  value={currentSuccessor?.readinessLevel || 50}
                  onChange={handleReadinessLevelChange}
                  aria-labelledby="readiness-level-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 50, label: '50%' },
                    { value: 100, label: '100%' }
                  ]}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {currentSuccessor?.readinessLevel >= 80 
                  ? 'Ready Now (80-100%)' 
                  : currentSuccessor?.readinessLevel >= 60 
                    ? 'Ready Soon (60-79%)' 
                    : 'Ready Future (0-59%)'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Development Needs (comma-separated)"
                name="developmentNeeds"
                value={currentSuccessor?.developmentNeeds?.join(', ') || ''}
                onChange={handleDevelopmentNeedsChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Development Plan"
                name="developmentPlan"
                value={currentSuccessor?.developmentPlan || ''}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" gutterBottom>
                Performance Rating
              </Typography>
              <Rating
                name="performanceRating"
                value={currentSuccessor?.performanceRating || 3}
                precision={0.5}
                onChange={(event, newValue) => {
                  handleInputChange({
                    target: { name: 'performanceRating', value: newValue }
                  });
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" gutterBottom>
                Potential Rating
              </Typography>
              <Rating
                name="potentialRating"
                value={currentSuccessor?.potentialRating || 3}
                precision={0.5}
                onChange={(event, newValue) => {
                  handleInputChange({
                    target: { name: 'potentialRating', value: newValue }
                  });
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSaveSuccessor} 
            variant="contained"
            disabled={!currentSuccessor?.personId || !currentSuccessor?.roleId}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuccessionPlanning; 