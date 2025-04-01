// src/components/panels/right-panel-components.js
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, Typography, Divider, TextField, InputAdornment, Button,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Paper, 
  Chip, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import PersonIcon from '@mui/icons-material/Person';
import { selectPersonnelByFactory } from '../../features/personnelSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import PersonnelList from './PersonnelList';
import PersonnelCreator from './PersonnelCreator';
import './drag-drop-styles.css';

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

export { PersonnelList, PersonnelCreator };
export default RightPanel;
