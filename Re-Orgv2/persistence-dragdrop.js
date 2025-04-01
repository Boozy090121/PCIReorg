// src/components/Persistence/PersistenceManager.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Button, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Typography, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { DragDropContext } from 'react-beautiful-dnd';

// This is a simplified persistence manager
// In a real application, you would connect this to a backend API

const LOCAL_STORAGE_KEY = 'quality-reorganization-tool-state';

const PersistenceManager = () => {
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Get the entire state from Redux
  const state = useSelector(state => state);
  
  // Auto-save every 5 minutes
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      handleSave();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(autoSaveInterval);
  }, [state]);
  
  // Check for saved state on load
  useEffect(() => {
    const savedStateString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedStateString) {
      try {
        const savedState = JSON.parse(savedStateString);
        const savedDate = savedState.savedAt ? new Date(savedState.savedAt) : null;
        setLastSaved(savedDate);
      } catch (error) {
        console.error('Error parsing saved state:', error);
      }
    }
  }, []);
  
  const handleSave = () => {
    setIsSaving(true);
    
    try {
      // Add a timestamp to the saved state
      const stateToSave = {
        ...state,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
      setLastSaved(new Date());
      
      showSnackbar('Configuration saved successfully', 'success');
    } catch (error) {
      console.error('Error saving state:', error);
      showSnackbar('Error saving configuration', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleLoad = () => {
    setIsLoading(true);
    
    try {
      const savedStateString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStateString) {
        const savedState = JSON.parse(savedStateString);
        
        // In a real app, you would dispatch actions to load this state into Redux
        // For this example, we'll just show a success message
        
        setLastSaved(new Date(savedState.savedAt));
        showSnackbar('Configuration loaded successfully', 'success');
      } else {
        showSnackbar('No saved configuration found', 'warning');
      }
    } catch (error) {
      console.error('Error loading state:', error);
      showSnackbar('Error loading configuration', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExport = () => {
    try {
      const stateToExport = {
        ...state,
        exportedAt: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(stateToExport, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `quality-reorg-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setExportDialogOpen(false);
      showSnackbar('Configuration exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting state:', error);
      showSnackbar('Error exporting configuration', 'error');
    }
  };
  
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importedState = JSON.parse(e.target.result);
        
        // In a real app, you would validate the imported state here
        // and then dispatch actions to load it into Redux
        
        showSnackbar('Configuration imported successfully', 'success');
        setImportDialogOpen(false);
      } catch (error) {
        console.error('Error parsing imported state:', error);
        showSnackbar('Error importing configuration: Invalid format', 'error');
      }
    };
    
    reader.onerror = () => {
      showSnackbar('Error reading file', 'error');
    };
    
    reader.readAsText(file);
  };
  
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={isSaving}
        >
          Save
        </Button>
        
        <Button 
          variant="outlined"
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <RestoreIcon />}
          onClick={handleLoad}
          disabled={isLoading}
        >
          Load
        </Button>
        
        <Button 
          variant="outlined"
          startIcon={<FileCopyIcon />}
          onClick={() => setExportDialogOpen(true)}
        >
          Export
        </Button>
        
        <Button 
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={() => setImportDialogOpen(true)}
        >
          Import
        </Button>
      </Box>
      
      {lastSaved && (
        <Typography variant="caption" color="text.secondary">
          Last saved: {lastSaved.toLocaleString()}
        </Typography>
      )}
      
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Configuration</DialogTitle>
        <DialogContent>
          <Typography>
            This will export the entire configuration as a JSON file.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained" color="primary">
            Export
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>Import Configuration</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Select a previously exported JSON file to import.
          </Typography>
          <Typography variant="caption" color="warning.main">
            Warning: This will overwrite your current configuration.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
            >
              Select File
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleImport}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PersistenceManager;

// src/components/Persistence/ExportImportManager.js
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';

const ExportImportManager = () => {
  const dispatch = useDispatch();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Get the entire state from Redux
  const state = useSelector(state => state);
  
  const handleExport = () => {
    setIsExporting(true);
    
    try {
      const stateToExport = {
        ...state,
        exportedAt: new Date().toISOString(),
        version: '1.0.0' // Add a version number for compatibility checks
      };
      
      const dataStr = JSON.stringify(stateToExport, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `quality-reorg-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setExportDialogOpen(false);
      showSnackbar('Configuration exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting state:', error);
      showSnackbar('Error exporting configuration', 'error');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importedState = JSON.parse(e.target.result);
        
        // In a real app, you would validate the imported state here
        // Check version compatibility
        if (!importedState.version) {
          showSnackbar('Invalid configuration file: No version found', 'error');
          setIsImporting(false);
          return;
        }
        
        // Check structure
        if (!importedState.focusFactory || 
            !importedState.phase || 
            !importedState.roles || 
            !importedState.personnel || 
            !importedState.orgChart) {
          showSnackbar('Invalid configuration file: Missing required data', 'error');
          setIsImporting(false);
          return;
        }
        
        // In a real app, you would dispatch actions to load this state into Redux
        
        showSnackbar('Configuration imported successfully', 'success');
        setImportDialogOpen(false);
      } catch (error) {
        console.error('Error parsing imported state:', error);
        showSnackbar('Error importing configuration: Invalid format', 'error');
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      showSnackbar('Error reading file', 'error');
      setIsImporting(false);
    };
    
    reader.readAsText(file);
  };
  
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => setExportDialogOpen(true)}
        >
          Export Configuration
        </Button>
        
        <Button 
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => setImportDialogOpen(true)}
        >
          Import Configuration
        </Button>
      </Box>
      
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Configuration</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            This will export the entire application configuration as a JSON file that can be imported later or shared with others.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The exported file will include:
          </Typography>
          <ul>
            <li>All focus factories (ADD, BBV, SYN)</li>
            <li>Both current and future states</li>
            <li>All roles and personnel</li>
            <li>Organization charts and assignments</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleExport} 
            variant="contained" 
            color="primary"
            disabled={isExporting}
            startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>Import Configuration</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Select a previously exported configuration file to import.
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will overwrite your current configuration. Make sure to export your current configuration first if you want to keep it.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              disabled={isImporting}
            >
              {isImporting ? 'Importing...' : 'Select File'}
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleImport}
                disabled={isImporting}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExportImportManager;

// src/components/DragDrop/DragDropProvider.js
import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import { selectCurrentPhase } from '../../features/phaseSlice';
import { updateNode } from '../../features/orgChartSlice';

const DragDropProvider = ({ children }) => {
  const dispatch = useDispatch();
  const currentFactory = useSelector(selectCurrentFactory);
  const currentPhase = useSelector(selectCurrentPhase);
  
  // This function handles all drag-and-drop operations in the application
  const handleDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;
    
    // If there's no destination or the item was dropped in the same place, do nothing
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Handle different types of drag operations
    
    // 1. Dragging Roles
    if (type === 'ROLE') {
      // Check if the destination is a node's roles area
      if (destination.droppableId.startsWith('roles-')) {
        const nodeId = destination.droppableId.replace('roles-', '');
        
        // In a real app, you would:
        // 1. Find the node by ID
        // 2. Add the role ID to the node's roles array
        // 3. Update the node in Redux
        
        // For this simplified implementation, we'll just log the operation
        console.log(`Role ${draggableId} dragged to node ${nodeId}`);
      }
    }
    
    // 2. Dragging Personnel
    else if (type === 'PERSONNEL') {
      // Check if the destination is a node's personnel area
      if (destination.droppableId.startsWith('personnel-')) {
        const nodeId = destination.droppableId.replace('personnel-', '');
        
        // In a real app, you would:
        // 1. Find the node by ID
        // 2. Add the personnel ID to the node's personnel array
        // 3. Update the node in Redux
        
        // For this simplified implementation, we'll just log the operation
        console.log(`Personnel ${draggableId} dragged to node ${nodeId}`);
      }
    }
    
    // 3. Dragging Nodes (for repositioning)
    else if (type === 'NODE') {
      // In a real app, you would calculate the new position based on the destination
      // and update the node's coordinates
      console.log(`Node ${draggableId} repositioned`);
    }
  };
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};

export default DragDropProvider;
