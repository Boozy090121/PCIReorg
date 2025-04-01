import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import {
  selectImplementationsByFactory,
  addImplementation,
  updateImplementation,
  deleteImplementation,
  updateImplementationProgress,
  addMilestone
} from '../../features/implementationTrackingSlice';

const ImplementationTracking = () => {
  const dispatch = useDispatch();
  const currentFactory = useSelector(selectCurrentFactory);
  const implementations = useSelector(state => 
    selectImplementationsByFactory(state, currentFactory)
  );
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [selectedImplementation, setSelectedImplementation] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: '',
    progress: 0
  });
  
  const [milestoneData, setMilestoneData] = useState({
    title: '',
    dueDate: '',
    description: ''
  });
  
  const handleOpenDialog = (implementation = null) => {
    if (implementation) {
      setSelectedImplementation(implementation);
      setFormData({
        title: implementation.title,
        description: implementation.description,
        startDate: implementation.startDate,
        endDate: implementation.endDate,
        status: implementation.status,
        priority: implementation.priority,
        assignedTo: implementation.assignedTo,
        progress: implementation.progress
      });
    } else {
      setSelectedImplementation(null);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'Not Started',
        priority: 'Medium',
        assignedTo: '',
        progress: 0
      });
    }
    setDialogOpen(true);
  };
  
  const handleOpenMilestoneDialog = (implementation) => {
    setSelectedImplementation(implementation);
    setMilestoneDialogOpen(true);
  };
  
  const handleSave = () => {
    if (selectedImplementation) {
      dispatch(updateImplementation({
        factory: currentFactory,
        implementationId: selectedImplementation.id,
        updates: formData
      }));
    } else {
      dispatch(addImplementation({
        factory: currentFactory,
        implementation: {
          id: Date.now().toString(),
          ...formData,
          milestones: []
        }
      }));
    }
    setDialogOpen(false);
  };
  
  const handleSaveMilestone = () => {
    dispatch(addMilestone({
      factory: currentFactory,
      implementationId: selectedImplementation.id,
      milestone: {
        id: Date.now().toString(),
        ...milestoneData,
        status: 'Pending'
      }
    }));
    setMilestoneDialogOpen(false);
    setMilestoneData({
      title: '',
      dueDate: '',
      description: ''
    });
  };
  
  const handleDelete = (implementationId) => {
    dispatch(deleteImplementation({
      factory: currentFactory,
      implementationId
    }));
  };
  
  const handleProgressChange = (implementationId, progress) => {
    dispatch(updateImplementationProgress({
      factory: currentFactory,
      implementationId,
      progress
    }));
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'primary';
      case 'At Risk':
        return 'error';
      case 'On Hold':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'info';
      default:
        return 'default';
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Implementation Tracking
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Implementation
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {implementations.map((implementation) => (
              <TableRow key={implementation.id}>
                <TableCell>{implementation.title}</TableCell>
                <TableCell>
                  <Chip
                    label={implementation.status}
                    color={getStatusColor(implementation.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={implementation.priority}
                    color={getPriorityColor(implementation.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 150 }}>
                    <LinearProgress
                      variant="determinate"
                      value={implementation.progress}
                      sx={{ flexGrow: 1 }}
                    />
                    <Typography variant="body2">
                      {implementation.progress}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{implementation.startDate}</TableCell>
                <TableCell>{implementation.endDate}</TableCell>
                <TableCell>{implementation.assignedTo}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(implementation)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Milestone">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenMilestoneDialog(implementation)}
                      >
                        <FlagIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(implementation.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Implementation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedImplementation ? 'Edit Implementation' : 'Add Implementation'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                fullWidth
              >
                <MenuItem value="Not Started">Not Started</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="At Risk">At Risk</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
              </TextField>
              <TextField
                select
                label="Priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                fullWidth
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </TextField>
            </Box>
            <TextField
              label="Assigned To"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              fullWidth
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>Progress:</Typography>
              <TextField
                type="number"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                inputProps={{ min: 0, max: 100 }}
                sx={{ width: 100 }}
              />
              <Typography>%</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Milestone Dialog */}
      <Dialog open={milestoneDialogOpen} onClose={() => setMilestoneDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Milestone</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Title"
              value={milestoneData.title}
              onChange={(e) => setMilestoneData({ ...milestoneData, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={milestoneData.description}
              onChange={(e) => setMilestoneData({ ...milestoneData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Due Date"
              type="date"
              value={milestoneData.dueDate}
              onChange={(e) => setMilestoneData({ ...milestoneData, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMilestoneDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveMilestone} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImplementationTracking; 