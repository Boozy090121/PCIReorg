// src/components/panels/left-panel-components.js
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, Typography, Divider, TextField, InputAdornment, Button,
  List, ListItem, ListItemText, Paper, Chip, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { selectRolesByFactory } from '../../features/roleSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import './drag-drop-styles.css';
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

export { RoleList, RoleCreator };
export default LeftPanel;
