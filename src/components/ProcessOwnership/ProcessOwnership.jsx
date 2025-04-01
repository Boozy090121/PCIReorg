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
  const [filteredProcesses, setFilteredProcesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentProcess, setCurrentProcess] = useState(null);

  useEffect(() => {
    // Filter processes based on search term
    const filtered = processes.filter(process => 
      process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProcesses(filtered);
  }, [processes, searchTerm]);

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

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentProcess(null);
  };

  const handleProcessSave = () => {
    if (currentProcess.id) {
      setProcesses(prevProcesses => 
        prevProcesses.map(p => p.id === currentProcess.id ? currentProcess : p)
      );
    } else {
      setProcesses(prevProcesses => [
        ...prevProcesses,
        {
          ...currentProcess,
          id: `proc_${Date.now()}`
        }
      ]);
    }
    handleDialogClose();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="All Processes" />
          <Tab label="By Department" />
          <Tab label="By Owner" />
          <Tab label="Process Flow" />
        </Tabs>
      </Box>

      {/* Search and Add Process Bar */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search processes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: <span className="material-icons">search</span>
          }}
        />
        <Button
          variant="contained"
          startIcon={<span className="material-icons">add</span>}
          onClick={handleAddProcess}
        >
          Add Process
        </Button>
      </Box>

      {/* All Processes Tab */}
      {currentTab === 0 && (
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Process Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProcesses.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell>{process.name}</TableCell>
                    <TableCell>{process.department}</TableCell>
                    <TableCell>{process.owner}</TableCell>
                    <TableCell>
                      <Chip 
                        label={process.status || 'Active'} 
                        color="primary" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEditProcess(process)}>
                        <span className="material-icons">edit</span>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* By Department Tab */}
      {currentTab === 1 && (
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <Grid container spacing={2}>
            {Object.entries(
              filteredProcesses.reduce((acc, process) => {
                if (!acc[process.department]) {
                  acc[process.department] = [];
                }
                acc[process.department].push(process);
                return acc;
              }, {})
            ).map(([department, processes]) => (
              <Grid item xs={12} md={6} key={department}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {department}
                    </Typography>
                    <List dense>
                      {processes.map(process => (
                        <ListItem key={process.id}>
                          <ListItemText 
                            primary={process.name}
                            secondary={`Owner: ${process.owner}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* By Owner Tab */}
      {currentTab === 2 && (
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <Grid container spacing={2}>
            {Object.entries(
              filteredProcesses.reduce((acc, process) => {
                if (!acc[process.owner]) {
                  acc[process.owner] = [];
                }
                acc[process.owner].push(process);
                return acc;
              }, {})
            ).map(([owner, processes]) => (
              <Grid item xs={12} md={6} key={owner}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {owner}
                    </Typography>
                    <List dense>
                      {processes.map(process => (
                        <ListItem key={process.id}>
                          <ListItemText 
                            primary={process.name}
                            secondary={`Department: ${process.department}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Process Flow Tab */}
      {currentTab === 3 && (
        <Box sx={{ p: 0, flex: 1, overflow: 'hidden' }}>
          <ProcessFlow 
            processes={filteredProcesses} 
            onUpdateProcess={(updatedProcess) => {
              setProcesses(prevProcesses => 
                prevProcesses.map(p => p.id === updatedProcess.id ? updatedProcess : p)
              );
            }} 
          />
        </Box>
      )}

      {/* Process Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
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
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleProcessSave} 
            variant="contained" 
            disabled={!currentProcess?.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcessOwnership; 