import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  SwapHoriz as SwapHorizIcon,
  Person as PersonIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { selectPersonnelByFactory } from '../../features/personnelSlice';
import { selectRolesByFactory } from '../../features/roleSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import {
  addTransition,
  updateTransition,
  deleteTransition,
  updateTransitionProgress,
  updateTransitionStatus,
  addTransitionRisk,
  removeTransitionRisk,
  addTransitionDependency,
  removeTransitionDependency,
  addRequiredTraining,
  removeRequiredTraining,
  selectTransitionsByFactory,
  selectTransitionStats
} from '../../features/transitionPlanSlice';

const TransitionPlan = () => {
  const dispatch = useDispatch();
  const currentFactory = useSelector(selectCurrentFactory);
  const personnel = useSelector(state => selectPersonnelByFactory(state, currentFactory));
  const roles = useSelector(state => selectRolesByFactory(state, currentFactory));
  const transitions = useSelector(state => selectTransitionsByFactory(state, currentFactory));
  const stats = useSelector(state => selectTransitionStats(state, currentFactory));
  
  // Local state for UI
  const [currentTab, setCurrentTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTransition, setCurrentTransition] = useState(null);
  
  // Mock data for transitions
  useEffect(() => {
    const mockTransitions = [
      {
        id: 1,
        personnelId: personnel[0]?.id,
        fromRoleId: roles[0]?.id,
        toRoleId: roles[1]?.id,
        startDate: '2024-04-01',
        endDate: '2024-06-30',
        status: 'In Progress',
        progress: 35,
        trainingRequired: ['Leadership Training', 'Technical Skills'],
        risks: ['Knowledge Transfer', 'Timeline Risk'],
        dependencies: ['Hire Replacement', 'Complete Projects'],
        priority: 'High'
      },
      // Add more mock transitions as needed
    ];
    
    setTransitions(mockTransitions);
  }, []);
  
  // Handlers
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleCreateTransition = () => {
    setCurrentTransition(null);
    setDialogOpen(true);
  };
  
  const handleEditTransition = (transition) => {
    setCurrentTransition(transition);
    setDialogOpen(true);
  };
  
  const handleDeleteTransition = (transitionId) => {
    dispatch(deleteTransition({ factory: currentFactory, transitionId }));
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentTransition(null);
  };
  
  const handleSaveTransition = (transitionData) => {
    if (currentTransition) {
      // Update existing transition
      dispatch(updateTransition({
        factory: currentFactory,
        transition: { ...currentTransition, ...transitionData }
      }));
    } else {
      // Create new transition
      dispatch(addTransition({
        factory: currentFactory,
        transition: {
          id: Date.now(),
          ...transitionData,
          progress: 0,
          status: 'Planned'
        }
      }));
    }
    handleDialogClose();
  };
  
  // Helper functions
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'primary';
      case 'planned':
        return 'info';
      case 'delayed':
        return 'warning';
      case 'at risk':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Chart data
  const statusData = [
    { name: 'Completed', value: stats.completed, color: '#4caf50' },
    { name: 'In Progress', value: stats.inProgress, color: '#2196f3' },
    { name: 'At Risk', value: stats.atRisk, color: '#f44336' },
    { name: 'Planned', value: stats.total - (stats.completed + stats.inProgress + stats.atRisk), color: '#90caf9' }
  ];
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Transition Plan
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTransition}
        >
          New Transition
        </Button>
      </Box>
      
      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Transitions" />
        <Tab label="Timeline" />
        <Tab label="Risks & Dependencies" />
      </Tabs>
      
      {/* Overview Tab */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Transitions
                </Typography>
                <Typography variant="h4">
                  {stats.total}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.completionRate} 
                  sx={{ mt: 2 }} 
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {stats.completionRate}% Complete
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  In Progress
                </Typography>
                <Typography variant="h4">
                  {stats.inProgress}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Active Transitions
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completed
                </Typography>
                <Typography variant="h4">
                  {stats.completed}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Successful Transitions
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  At Risk
                </Typography>
                <Typography variant="h4" color="error">
                  {stats.atRisk}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <WarningIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="error">
                    Needs Attention
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Charts */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                Transition Status
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                Key Metrics
              </Typography>
              {/* Add another chart or key metrics here */}
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Transitions Tab */}
      {currentTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Personnel</TableCell>
                <TableCell>From Role</TableCell>
                <TableCell>To Role</TableCell>
                <TableCell>Timeline</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transitions.map(transition => {
                const person = personnel.find(p => p.id === transition.personnelId);
                const fromRole = roles.find(r => r.id === transition.fromRoleId);
                const toRole = roles.find(r => r.id === transition.toRoleId);
                
                return (
                  <TableRow key={transition.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1 }} />
                        {person?.name}
                      </Box>
                    </TableCell>
                    <TableCell>{fromRole?.title}</TableCell>
                    <TableCell>{toRole?.title}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="caption" display="block">
                          Start: {transition.startDate}
                        </Typography>
                        <Typography variant="caption" display="block">
                          End: {transition.endDate}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={transition.progress} 
                            color={getStatusColor(transition.status)}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {transition.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transition.status} 
                        color={getStatusColor(transition.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transition.priority} 
                        color={transition.priority.toLowerCase() === 'high' ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEditTransition(transition)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteTransition(transition.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Timeline Tab */}
      {currentTab === 2 && (
        <Box>
          {/* Add Timeline visualization here */}
          <Typography variant="h6">Timeline Coming Soon</Typography>
        </Box>
      )}
      
      {/* Risks & Dependencies Tab */}
      {currentTab === 3 && (
        <Grid container spacing={3}>
          {transitions.map(transition => {
            const person = personnel.find(p => p.id === transition.personnelId);
            return (
              <Grid item xs={12} md={6} key={transition.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {person?.name}'s Transition
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Risks:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {transition.risks.map((risk, index) => (
                          <Chip
                            key={index}
                            label={risk}
                            color="error"
                            variant="outlined"
                            size="small"
                            icon={<WarningIcon />}
                          />
                        ))}
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Dependencies:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {transition.dependencies.map((dep, index) => (
                          <Chip
                            key={index}
                            label={dep}
                            color="primary"
                            variant="outlined"
                            size="small"
                            icon={<ScheduleIcon />}
                          />
                        ))}
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Required Training:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {transition.trainingRequired.map((training, index) => (
                          <Chip
                            key={index}
                            label={training}
                            color="success"
                            variant="outlined"
                            size="small"
                            icon={<WorkIcon />}
                          />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      
      {/* Transition Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentTransition ? 'Edit Transition' : 'New Transition'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Personnel"
                value={currentTransition?.personnelId || ''}
                onChange={(e) => setCurrentTransition(prev => ({ ...prev, personnelId: e.target.value }))}
              >
                {personnel.map(person => (
                  <MenuItem key={person.id} value={person.id}>
                    {person.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="From Role"
                value={currentTransition?.fromRoleId || ''}
                onChange={(e) => setCurrentTransition(prev => ({ ...prev, fromRoleId: e.target.value }))}
              >
                {roles.map(role => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="To Role"
                value={currentTransition?.toRoleId || ''}
                onChange={(e) => setCurrentTransition(prev => ({ ...prev, toRoleId: e.target.value }))}
              >
                {roles.map(role => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={currentTransition?.startDate || ''}
                onChange={(e) => setCurrentTransition(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={currentTransition?.endDate || ''}
                onChange={(e) => setCurrentTransition(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Status"
                value={currentTransition?.status || 'Planned'}
                onChange={(e) => setCurrentTransition(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="Planned">Planned</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Delayed">Delayed</MenuItem>
                <MenuItem value="At Risk">At Risk</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Priority"
                value={currentTransition?.priority || 'Medium'}
                onChange={(e) => setCurrentTransition(prev => ({ ...prev, priority: e.target.value }))}
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={() => handleSaveTransition(currentTransition)}
            variant="contained"
            disabled={!currentTransition?.personnelId || !currentTransition?.fromRoleId || !currentTransition?.toRoleId}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransitionPlan; 