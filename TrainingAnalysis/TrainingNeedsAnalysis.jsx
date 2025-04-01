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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  LinearProgress,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  School as SchoolIcon, 
  Add as AddIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

const TrainingNeedsAnalysis = () => {
  const currentFactory = useSelector(state => state.focusFactory.currentFactory);
  const currentPhase = useSelector(state => state.phase.currentPhase);
  const futurePhase = currentPhase === 'current' ? 'future' : 'current';
  
  const roles = useSelector(state => state.roles.roles[currentFactory]);
  const personnel = useSelector(state => state.personnel.personnel[currentFactory]);
  
  const [currentTab, setCurrentTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTraining, setCurrentTraining] = useState(null);
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [competencyGaps, setCompetencyGaps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample competencies data
  const competencies = [
    { id: 'comp_1', name: 'Quality Systems Management', category: 'Quality Systems' },
    { id: 'comp_2', name: 'GMP Compliance', category: 'Regulatory' },
    { id: 'comp_3', name: 'Risk Management', category: 'Quality Systems' },
    { id: 'comp_4', name: 'Change Control', category: 'Quality Systems' },
    { id: 'comp_5', name: 'Document Control', category: 'Documentation' },
    { id: 'comp_6', name: 'Validation', category: 'Technical' },
    { id: 'comp_7', name: 'Root Cause Analysis', category: 'Quality Control' },
    { id: 'comp_8', name: 'Statistical Methods', category: 'Technical' },
  ];
  
  // Sample training courses
  const trainingCourses = [
    { id: 'train_1', name: 'GMP Basics', competencies: ['comp_2'], duration: 8, type: 'Online' },
    { id: 'train_2', name: 'Quality Management Systems', competencies: ['comp_1', 'comp_3'], duration: 16, type: 'Workshop' },
    { id: 'train_3', name: 'Change Control Process', competencies: ['comp_4'], duration: 8, type: 'Online' },
    { id: 'train_4', name: 'Document Management', competencies: ['comp_5'], duration: 4, type: 'Online' },
    { id: 'train_5', name: 'Validation Fundamentals', competencies: ['comp_6'], duration: 24, type: 'Classroom' },
    { id: 'train_6', name: 'Advanced Problem Solving', competencies: ['comp_7'], duration: 16, type: 'Workshop' },
    { id: 'train_7', name: 'Statistics for Quality', competencies: ['comp_8'], duration: 16, type: 'Classroom' },
  ];

  useEffect(() => {
    // Simulate competency gap analysis results
    const gaps = generateCompetencyGaps();
    setCompetencyGaps(gaps);
    
    // Generate training plans based on gaps
    const plans = generateTrainingPlans(gaps);
    setTrainingPlans(plans);
  }, [currentFactory, currentPhase]);
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCreateTraining = () => {
    setCurrentTraining({
      id: '',
      title: '',
      competencies: [],
      personnel: [],
      startDate: '',
      endDate: '',
      status: 'Planned',
      priority: 'Medium',
      type: 'Online',
      description: ''
    });
    setDialogOpen(true);
  };
  
  const handleEditTraining = (training) => {
    setCurrentTraining({...training});
    setDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentTraining(null);
  };
  
  const handleSaveTraining = () => {
    if (currentTraining.id) {
      setTrainingPlans(prevPlans => 
        prevPlans.map(plan => plan.id === currentTraining.id ? currentTraining : plan)
      );
    } else {
      setTrainingPlans(prevPlans => [
        ...prevPlans,
        {
          ...currentTraining,
          id: `training_${Date.now()}`
        }
      ]);
    }
    handleDialogClose();
  };
  
  const handleDeleteTraining = (trainingId) => {
    setTrainingPlans(prevPlans => prevPlans.filter(plan => plan.id !== trainingId));
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTraining(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Function to generate competency gaps (simulated data)
  const generateCompetencyGaps = () => {
    return [
      { 
        id: 'gap_1', 
        competencyId: 'comp_1', 
        name: 'Quality Systems Management', 
        category: 'Quality Systems',
        currentLevel: 2,
        requiredLevel: 4,
        gap: 2,
        affectedRoles: ['Quality Manager', 'Quality Specialist'],
        affectedPersonnel: ['John Smith', 'Emily Wilson'],
        priority: 'High',
        impact: 'Critical for ISO 13485 compliance'
      },
      { 
        id: 'gap_2', 
        competencyId: 'comp_3', 
        name: 'Risk Management', 
        category: 'Quality Systems',
        currentLevel: 1,
        requiredLevel: 3,
        gap: 2,
        affectedRoles: ['Quality Specialist', 'Validation Manager'],
        affectedPersonnel: ['Jane Doe', 'Robert Johnson'],
        priority: 'Medium',
        impact: 'Important for new product risk assessments'
      },
      { 
        id: 'gap_3', 
        competencyId: 'comp_6', 
        name: 'Validation', 
        category: 'Technical',
        currentLevel: 2,
        requiredLevel: 4,
        gap: 2,
        affectedRoles: ['Validation Manager', 'Quality Control Specialist'],
        affectedPersonnel: ['Robert Johnson', 'Sarah Garcia'],
        priority: 'High',
        impact: 'Essential for new equipment qualification'
      },
      { 
        id: 'gap_4', 
        competencyId: 'comp_8', 
        name: 'Statistical Methods', 
        category: 'Technical',
        currentLevel: 1,
        requiredLevel: 3,
        gap: 2,
        affectedRoles: ['Quality Control Specialist', 'Quality Analyst'],
        affectedPersonnel: ['Michael Brown'],
        priority: 'Medium',
        impact: 'Needed for improved sampling plans'
      },
    ];
  };
  
  // Function to generate training plans based on competency gaps
  const generateTrainingPlans = (gaps) => {
    return [
      {
        id: 'training_1',
        title: 'Quality Management Systems Advanced',
        competencies: ['comp_1', 'comp_3'],
        personnel: ['John Smith', 'Emily Wilson', 'Jane Doe'],
        startDate: '2025-05-01',
        endDate: '2025-05-15',
        status: 'Planned',
        priority: 'High',
        type: 'Workshop',
        description: 'Advanced workshop covering quality systems management and risk-based approaches',
        duration: 16,
        cost: 5000
      },
      {
        id: 'training_2',
        title: 'Validation Masterclass',
        competencies: ['comp_6'],
        personnel: ['Robert Johnson', 'Sarah Garcia'],
        startDate: '2025-06-10',
        endDate: '2025-06-12',
        status: 'Planned',
        priority: 'High',
        type: 'Classroom',
        description: 'Comprehensive training on validation strategies and execution',
        duration: 24,
        cost: 7500
      },
      {
        id: 'training_3',
        title: 'Statistical Analysis for Quality Professionals',
        competencies: ['comp_8'],
        personnel: ['Michael Brown'],
        startDate: '2025-05-20',
        endDate: '2025-05-21',
        status: 'Planned',
        priority: 'Medium',
        type: 'Online',
        description: 'Introduction to statistical methods for quality control',
        duration: 16,
        cost: 2500
      },
    ];
  };

  // Filter training plans based on search term
  const filteredTrainingPlans = trainingPlans.filter(plan => 
    searchTerm === '' || 
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.personnel.some(person => person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    plan.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare data for charts
  const gapsByCategory = competencyGaps.reduce((acc, gap) => {
    if (!acc[gap.category]) {
      acc[gap.category] = {
        name: gap.category,
        value: 0,
        gaps: []
      };
    }
    acc[gap.category].value += 1;
    acc[gap.category].gaps.push(gap);
    return acc;
  }, {});
  
  const gapCategoryChartData = Object.values(gapsByCategory);
  
  const trainingByType = filteredTrainingPlans.reduce((acc, plan) => {
    if (!acc[plan.type]) {
      acc[plan.type] = 0;
    }
    acc[plan.type] += 1;
    return acc;
  }, {});
  
  const trainingTypeChartData = Object.entries(trainingByType).map(([type, count]) => ({
    name: type,
    value: count
  }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Calculate training costs by priority
  const costByPriority = filteredTrainingPlans.reduce((acc, plan) => {
    if (!acc[plan.priority]) {
      acc[plan.priority] = 0;
    }
    acc[plan.priority] += plan.cost || 0;
    return acc;
  }, {});
  
  const costChartData = [
    { name: 'High', value: costByPriority['High'] || 0 },
    { name: 'Medium', value: costByPriority['Medium'] || 0 },
    { name: 'Low', value: costByPriority['Low'] || 0 },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">
          Training Needs Analysis
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search training plans..."
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
            onClick={handleCreateTraining}
          >
            Add Training Plan
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Competency Gaps" />
          <Tab label="Training Plans" />
          <Tab label="By Employee" />
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
                    Training Needs Summary
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Based on the gap analysis between current and future states, we've identified
                    {competencyGaps.length} competency gaps affecting {
                      [...new Set(competencyGaps.flatMap(gap => gap.affectedPersonnel))].length
                    } employees. 
                    These gaps are addressed through {trainingPlans.length} training plans.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h3">{competencyGaps.length}</Typography>
                        <Typography variant="body2" color="text.secondary">Competency Gaps</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h3">{trainingPlans.length}</Typography>
                        <Typography variant="body2" color="text.secondary">Training Plans</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h3">
                          ${trainingPlans.reduce((sum, plan) => sum + (plan.cost || 0), 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Total Training Budget</Typography>
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
                    Competency Gaps by Category
                  </Typography>
                  <Box sx={{ height: 250, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gapCategoryChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {gapCategoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Training Plans by Type
                  </Typography>
                  <Box sx={{ height: 250, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={trainingTypeChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#8884d8" name="Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Training Budget by Priority
                  </Typography>
                  <Box sx={{ height: 250, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={costChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Bar dataKey="value" fill="#82ca9d" name="Budget" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Key Recommendations
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Critical Skills
                        </Typography>
                        <Typography variant="body2">
                          Focus first on addressing the high-priority gaps in Quality Systems Management
                          and Validation, as these will have the greatest impact on operations.
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Training Approach
                        </Typography>
                        <Typography variant="body2">
                          Blend workshop, classroom, and online training methods to maximize engagement
                          while minimizing operational disruption.
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Timeline
                        </Typography>
                        <Typography variant="body2">
                          Schedule high-priority training in Q2 2023, with medium-priority training
                          to follow in Q3. This ensures critical gaps are addressed first.
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

      {/* Competency Gaps Tab */}
      {currentTab === 1 && (
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Competency</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Current Level</TableCell>
                  <TableCell>Required Level</TableCell>
                  <TableCell>Gap</TableCell>
                  <TableCell>Affected Roles</TableCell>
                  <TableCell>Affected Personnel</TableCell>
                  <TableCell>Priority</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {competencyGaps.map(gap => (
                  <TableRow key={gap.id}>
                    <TableCell>{gap.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={gap.category} 
                        size="small" 
                        color={
                          gap.category === 'Quality Systems' ? 'primary' :
                          gap.category === 'Technical' ? 'success' :
                          gap.category === 'Regulatory' ? 'warning' : 'info'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Rating value={gap.currentLevel} readOnly size="small" max={5} />
                    </TableCell>
                    <TableCell>
                      <Rating value={gap.requiredLevel} readOnly size="small" max={5} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color="error" sx={{ mr: 1 }}>
                          +{gap.gap}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(gap.gap / 5) * 100}
                          color="error"
                          sx={{ width: 50, height: 8, borderRadius: 5 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {gap.affectedRoles.map((role, index) => (
                        <Chip 
                          key={index} 
                          label={role} 
                          size="small" 
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      {gap.affectedPersonnel.join(', ')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={gap.priority} 
                        size="small" 
                        color={
                          gap.priority === 'High' ? 'error' :
                          gap.priority === 'Medium' ? 'warning' : 'info'
                        } 
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {competencyGaps.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No competency gaps identified. Either all requirements are met or gap analysis has not been performed.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      
      {/* Training Plans Tab */}
      {currentTab === 2 && (
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Training Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Target Competencies</TableCell>
                  <TableCell>Personnel</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell align="right">Cost</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTrainingPlans.map(plan => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <Typography variant="body2">{plan.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={plan.type} 
                        size="small" 
                        color={
                          plan.type === 'Workshop' ? 'primary' :
                          plan.type === 'Classroom' ? 'success' : 'info'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {plan.competencies.map(compId => {
                        const competency = competencies.find(c => c.id === compId);
                        return competency ? (
                          <Chip 
                            key={compId} 
                            label={competency.name} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        ) : null;
                      })}
                    </TableCell>
                    <TableCell>
                      {plan.personnel.join(', ')}
                    </TableCell>
                    <TableCell>
                      {plan.duration} hours
                    </TableCell>
                    <TableCell>
                      {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={plan.status} 
                        size="small" 
                        color={
                          plan.status === 'Completed' ? 'success' :
                          plan.status === 'In Progress' ? 'info' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={plan.priority} 
                        size="small" 
                        color={
                          plan.priority === 'High' ? 'error' :
                          plan.priority === 'Medium' ? 'warning' : 'info'
                        } 
                      />
                    </TableCell>
                    <TableCell align="right">
                      ${plan.cost?.toLocaleString() || 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEditTraining(plan)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteTraining(plan.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTrainingPlans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No training plans found. Add a new training plan or adjust your search criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* By Employee Tab */}
      {currentTab === 3 && (
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <Grid container spacing={3}>
            {personnel.map((person, index) => {
              // Find training plans for this person
              const personTraining = trainingPlans.filter(plan => 
                plan.personnel.includes(person.name)
              );
              
              // Find competency gaps affecting this person
              const personGaps = competencyGaps.filter(gap => 
                gap.affectedPersonnel.includes(person.name)
              );
              
              return (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {person.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {person.currentRole || 'No role assigned'}
                      </Typography>
                      
                      {personGaps.length > 0 ? (
                        <>
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            Competency Gaps:
                          </Typography>
                          <List dense>
                            {personGaps.map((gap, gapIndex) => (
                              <ListItem key={gapIndex}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <SchoolIcon fontSize="small" color="error" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={gap.name}
                                  secondary={`Current: ${gap.currentLevel}, Required: ${gap.requiredLevel}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          No competency gaps identified.
                        </Typography>
                      )}
                      
                      {personTraining.length > 0 ? (
                        <>
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            Assigned Training:
                          </Typography>
                          <List dense>
                            {personTraining.map((training, trainIndex) => (
                              <ListItem key={trainIndex}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <AssessmentIcon fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={training.title}
                                  secondary={`${training.type} • ${new Date(training.startDate).toLocaleDateString()}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          No training assigned yet.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
            {personnel.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No personnel data available. Add personnel first.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
      
      {/* Training Plan Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentTraining?.id ? 'Edit Training Plan' : 'Create Training Plan'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Training Title"
                name="title"
                value={currentTraining?.title || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={currentTraining?.type || 'Online'}
                  onChange={handleInputChange}
                  label="Type"
                >
                  <MenuItem value="Online">Online</MenuItem>
                  <MenuItem value="Classroom">Classroom</MenuItem>
                  <MenuItem value="Workshop">Workshop</MenuItem>
                  <MenuItem value="On-the-job">On-the-job</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={currentTraining?.description || ''}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Competencies</InputLabel>
                <Select
                  multiple
                  name="competencies"
                  value={currentTraining?.competencies || []}
                  onChange={(e) => handleInputChange({
                    target: { name: 'competencies', value: e.target.value }
                  })}
                  label="Competencies"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(compId => {
                        const comp = competencies.find(c => c.id === compId);
                        return comp ? (
                          <Chip key={compId} label={comp.name} size="small" />
                        ) : null;
                      })}
                    </Box>
                  )}
                >
                  {competencies.map(comp => (
                    <MenuItem key={comp.id} value={comp.id}>
                      {comp.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Personnel</InputLabel>
                <Select
                  multiple
                  name="personnel"
                  value={currentTraining?.personnel || []}
                  onChange={(e) => handleInputChange({
                    target: { name: 'personnel', value: e.target.value }
                  })}
                  label="Personnel"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(person => (
                        <Chip key={person} label={person} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {personnel.map(person => (
                    <MenuItem key={person.id} value={person.name}>
                      {person.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={currentTraining?.startDate || ''}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={currentTraining?.endDate || ''}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Duration (hours)"
                name="duration"
                type="number"
                value={currentTraining?.duration || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Cost ($)"
                name="cost"
                type="number"
                value={currentTraining?.cost || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={currentTraining?.status || 'Planned'}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="Planned">Planned</MenuItem>
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={currentTraining?.priority || 'Medium'}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSaveTraining} 
            variant="contained"
            disabled={!currentTraining?.title}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrainingNeedsAnalysis; 