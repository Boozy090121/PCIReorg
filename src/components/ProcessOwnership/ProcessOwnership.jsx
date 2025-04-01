import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import ProcessFlow from './ProcessFlow';

const ProcessOwnership = () => {
  const dispatch = useDispatch();
  const currentFactory = useSelector(state => state.focusFactory.currentFactory);
  const [currentTab, setCurrentTab] = useState(0);
  const [processes, setProcesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentProcess, setCurrentProcess] = useState(null);

  // Compute filtered processes directly from processes and searchTerm
  const filteredProcesses = processes.filter(process => 
    searchTerm === '' || 
    process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAddProcess = () => {
    setCurrentProcess({
      id: '',
      name: '',
      department: '',
      owner: '',
      description: '',
      steps: [],
      dependencies: [],
      metrics: []
    });
    setDialogOpen(true);
  };

  const handleEditProcess = (process) => {
    setCurrentProcess({...process});
    setDialogOpen(true);
  };

  const handleSaveProcess = (process) => {
    if (process.id) {
      // Update existing process
      setProcesses(prevProcesses => 
        prevProcesses.map(p => p.id === process.id ? process : p)
      );
    } else {
      // Add new process
      const newProcess = {
        ...process,
        id: Date.now().toString()
      };
      setProcesses(prevProcesses => [...prevProcesses, newProcess]);
    }
    setDialogOpen(false);
    setCurrentProcess(null);
  };

  const handleDeleteProcess = (processId) => {
    setProcesses(prevProcesses => 
      prevProcesses.filter(p => p.id !== processId)
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Process Ownership
        </Typography>
        <Button
          variant="contained"
          onClick={handleAddProcess}
        >
          Add Process
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search processes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
      </Box>

      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="List View" />
        <Tab label="Flow View" />
      </Tabs>

      {currentTab === 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Process Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Dependencies</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProcesses.map((process) => (
                <TableRow key={process.id}>
                  <TableCell>{process.name}</TableCell>
                  <TableCell>{process.department}</TableCell>
                  <TableCell>{process.owner}</TableCell>
                  <TableCell>
                    {process.dependencies?.map(depId => {
                      const dep = processes.find(p => p.id === depId);
                      return dep ? (
                        <Chip
                          key={depId}
                          label={dep.name}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ) : null;
                    })}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEditProcess(process)}>
                      <span className="material-icons">edit</span>
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteProcess(process.id)}>
                      <span className="material-icons">delete</span>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <ProcessFlow
          processes={filteredProcesses}
          onUpdateProcess={handleSaveProcess}
        />
      )}

      {/* Process Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentProcess?.id ? 'Edit Process' : 'Add Process'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Process Name"
                value={currentProcess?.name || ''}
                onChange={(e) => setCurrentProcess(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Department"
                value={currentProcess?.department || ''}
                onChange={(e) => setCurrentProcess(prev => ({
                  ...prev,
                  department: e.target.value
                }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Owner"
                value={currentProcess?.owner || ''}
                onChange={(e) => setCurrentProcess(prev => ({
                  ...prev,
                  owner: e.target.value
                }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={currentProcess?.description || ''}
                onChange={(e) => setCurrentProcess(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleSaveProcess(currentProcess)} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcessOwnership; 