// src/components/LeftPanel/LeftPanel.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Divider, TextField, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { selectRolesByFactory } from '../../features/roleSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import RoleList from './RoleList';
import RoleCreator from './RoleCreator';

const LeftPanel = () => {
  const currentFactory = useSelector(selectCurrentFactory);
  const roles = useSelector(state => selectRolesByFactory(state, currentFactory));
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  const filteredRoles = roles.filter(role => 
    role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.responsibilities?.some(resp => resp.toLowerCase().includes(searchTerm.toLowerCase())) ||
    role.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddRoleClick = () => {
    setIsCreatingRole(true);
  };

  const handleRoleCreatorClose = () => {
    setIsCreatingRole(false);
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Roles & Responsibilities
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search roles"
          value={searchTerm}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddRoleClick}
        >
          Add Role
        </Button>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <RoleList roles={filteredRoles} />
      </Box>
      
      {isCreatingRole && (
        <RoleCreator 
          open={isCreatingRole}
          onClose={handleRoleCreatorClose}
        />
      )}
    </Box>
  );
};

export default LeftPanel;

// src/components/LeftPanel/RoleList.js
import React from 'react';
import { useSelector } from 'react-redux';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Paper, 
  Chip, 
  Box, 
  Typography, 
  IconButton 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Draggable } from 'react-beautiful-dnd';
import { selectCurrentFactory } from '../../features/focusFactorySlice';

const RoleList = ({ roles }) => {
  const currentFactory = useSelector(selectCurrentFactory);
  
  const getFactoryColor = (factory) => {
    switch (factory) {
      case 'ADD':
        return '#CC2030';
      case 'BBV':
        return '#00518A';
      case 'SYN':
        return '#232323';
      default:
        return '#666666';
    }
  };

  return (
    <List>
      {roles.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          No roles found. Click "Add Role" to create one.
        </Typography>
      ) : (
        roles.map((role, index) => (
          <Draggable key={role.id} draggableId={role.id} index={index}>
            {(provided, snapshot) => (
              <Paper
                ref={provided.innerRef}
                {...provided.draggableProps}
                elevation={snapshot.isDragging ? 3 : 1}
                sx={{ 
                  mb: 2, 
                  borderLeft: `4px solid ${getFactoryColor(currentFactory)}`,
                  opacity: snapshot.isDragging ? 0.8 : 1
                }}
                className="drag-item"
              >
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="edit" size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <Box {...provided.dragHandleProps} sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <DragIndicatorIcon color="action" />
                  </Box>
                  <ListItemText
                    primary={role.title}
                    secondary={
                      <>
                        <Typography variant="body2" component="span" color="text.secondary">
                          {role.department}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {role.skills?.map((skill, i) => (
                            <Chip 
                              key={i} 
                              label={skill} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))}
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              </Paper>
            )}
          </Draggable>
        ))
      )}
    </List>
  );
};

export default RoleList;

// src/components/LeftPanel/RoleCreator.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Chip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { addRole } from '../../features/roleSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';

const departments = [
  'Quality Assurance',
  'Quality Control',
  'Regulatory Affairs',
  'Compliance',
  'Validation',
  'Manufacturing',
  'R&D',
  'Engineering'
];

const RoleCreator = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const currentFactory = useSelector(selectCurrentFactory);
  
  const [role, setRole] = useState({
    title: '',
    department: '',
    responsibilities: [],
    skills: []
  });
  
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRole({
      ...role,
      [name]: value
    });
  };

  const handleAddResponsibility = () => {
    if (newResponsibility.trim() !== '') {
      setRole({
        ...role,
        responsibilities: [...role.responsibilities, newResponsibility.trim()]
      });
      setNewResponsibility('');
    }
  };

  const handleDeleteResponsibility = (index) => {
    const updatedResponsibilities = [...role.responsibilities];
    updatedResponsibilities.splice(index, 1);
    setRole({
      ...role,
      responsibilities: updatedResponsibilities
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() !== '') {
      setRole({
        ...role,
        skills: [...role.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleDeleteSkill = (index) => {
    const updatedSkills = [...role.skills];
    updatedSkills.splice(index, 1);
    setRole({
      ...role,
      skills: updatedSkills
    });
  };

  const handleKeyPress = (e, addFunction) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFunction();
    }
  };

  const handleSubmit = () => {
    dispatch(addRole({
      factory: currentFactory,
      role: role
    }));
    onClose();
  };

  const isFormValid = role.title.trim() !== '' && role.department !== '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Create New Role
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Role Title"
            name="title"
            value={role.title}
            onChange={handleInputChange}
            required
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="department-label">Department</InputLabel>
            <Select
              labelId="department-label"
              name="department"
              value={role.department}
              onChange={handleInputChange}
              label="Department"
              required
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Responsibilities
        </Typography>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            label="Add Responsibility"
            value={newResponsibility}
            onChange={(e) => setNewResponsibility(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleAddResponsibility)}
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddResponsibility}
            sx={{ mt: 2, ml: 1, height: 40 }}
          >
            <AddIcon />
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {role.responsibilities.map((responsibility, index) => (
            <Chip
              key={index}
              label={responsibility}
              onDelete={() => handleDeleteResponsibility(index)}
            />
          ))}
          {role.responsibilities.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No responsibilities added yet
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Required Skills
        </Typography>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            label="Add Skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleAddSkill)}
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddSkill}
            sx={{ mt: 2, ml: 1, height: 40 }}
          >
            <AddIcon />
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {role.skills.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              onDelete={() => handleDeleteSkill(index)}
            />
          ))}
          {role.skills.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No skills added yet
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!isFormValid}
        >
          Create Role
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleCreator;
