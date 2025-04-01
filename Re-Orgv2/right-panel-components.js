// src/components/RightPanel/RightPanel.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Divider, TextField, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { selectPersonnelByFactory } from '../../features/personnelSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import PersonnelList from './PersonnelList';
import PersonnelCreator from './PersonnelCreator';

const RightPanel = () => {
  const currentFactory = useSelector(selectCurrentFactory);
  const personnel = useSelector(state => selectPersonnelByFactory(state, currentFactory));
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingPersonnel, setIsCreatingPersonnel] = useState(false);

  const filteredPersonnel = personnel.filter(person => 
    person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.currentRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddPersonnelClick = () => {
    setIsCreatingPersonnel(true);
  };

  const handlePersonnelCreatorClose = () => {
    setIsCreatingPersonnel(false);
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Personnel Management
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search personnel"
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
          onClick={handleAddPersonnelClick}
        >
          Add Personnel
        </Button>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <PersonnelList personnel={filteredPersonnel} />
      </Box>
      
      {isCreatingPersonnel && (
        <PersonnelCreator 
          open={isCreatingPersonnel}
          onClose={handlePersonnelCreatorClose}
        />
      )}
    </Box>
  );
};

export default RightPanel;

// src/components/RightPanel/PersonnelList.js
import React from 'react';
import { useSelector } from 'react-redux';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar,
  Avatar,
  Paper, 
  Chip, 
  Box, 
  Typography, 
  IconButton 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import PersonIcon from '@mui/icons-material/Person';
import { Draggable } from 'react-beautiful-dnd';
import { selectCurrentFactory } from '../../features/focusFactorySlice';

const PersonnelList = ({ personnel }) => {
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

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available':
        return '#4caf50';
      case 'Partially Available':
        return '#ff9800';
      case 'Not Available':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <List>
      {personnel.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          No personnel found. Click "Add Personnel" to create one.
        </Typography>
      ) : (
        personnel.map((person, index) => (
          <Draggable key={person.id} draggableId={person.id} index={index}>
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
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" component="span">
                          {person.name}
                        </Typography>
                        {person.availability && (
                          <Chip 
                            size="small" 
                            label={person.availability} 
                            sx={{ 
                              ml: 1, 
                              backgroundColor: getAvailabilityColor(person.availability),
                              color: 'white',
                              height: 20,
                              fontSize: '0.7rem'
                            }} 
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span" color="text.secondary">
                          {person.currentRole}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {person.skills?.map((skill, i) => (
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

export default PersonnelList;

// src/components/RightPanel/PersonnelCreator.js
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
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { addPersonnel } from '../../features/personnelSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';

const availabilityOptions = [
  'Available',
  'Partially Available',
  'Not Available'
];

const experienceLevels = [
  'Entry Level',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Management'
];

const PersonnelCreator = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const currentFactory = useSelector(selectCurrentFactory);
  
  const [person, setPerson] = useState({
    name: '',
    currentRole: '',
    experience: '',
    availability: 'Available',
    skills: []
  });
  
  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPerson({
      ...person,
      [name]: value
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() !== '') {
      setPerson({
        ...person,
        skills: [...person.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleDeleteSkill = (index) => {
    const updatedSkills = [...person.skills];
    updatedSkills.splice(index, 1);
    setPerson({
      ...person,
      skills: updatedSkills
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = () => {
    dispatch(addPersonnel({
      factory: currentFactory,
      person: person
    }));
    onClose();
  };

  const isFormValid = person.name.trim() !== '' && person.currentRole.trim() !== '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Add New Personnel
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
            label="Name"
            name="name"
            value={person.name}
            onChange={handleInputChange}
            required
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Current Role"
            name="currentRole"
            value={person.currentRole}
            onChange={handleInputChange}
            required
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="experience-label">Experience Level</InputLabel>
            <Select
              labelId="experience-label"
              name="experience"
              value={person.experience}
              onChange={handleInputChange}
              label="Experience Level"
            >
              {experienceLevels.map((level) => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Availability
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            name="availability"
            value={person.availability}
            onChange={handleInputChange}
            row
          >
            {availabilityOptions.map((option) => (
              <FormControlLabel 
                key={option} 
                value={option} 
                control={<Radio />} 
                label={option} 
              />
            ))}
          </RadioGroup>
        </FormControl>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Skills
        </Typography>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            label="Add Skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
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
          {person.skills.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              onDelete={() => handleDeleteSkill(index)}
            />
          ))}
          {person.skills.length === 0 && (
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
          Add Personnel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PersonnelCreator;
