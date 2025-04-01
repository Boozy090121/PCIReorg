import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  Divider, 
  IconButton, 
  Tooltip, 
  Badge,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import BusinessIcon from '@mui/icons-material/Business';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { selectRolesByFactory } from '../../features/roleSlice';
import { selectPersonnelByFactory } from '../../features/personnelSlice';
import { deleteNode } from '../../features/orgChartSlice';
import PersonnelMatchingSuggestions from './PersonnelMatchingSuggestions';
import { usePersonnelMatching } from './usePersonnelMatching';

const OrgNode = ({ 
  node, 
  index, 
  factory, 
  phase, 
  visualSettings = {},
  isHighlighted = false
}) => {
  const dispatch = useDispatch();
  const roles = useSelector(state => selectRolesByFactory(state, factory));
  const personnel = useSelector(state => selectPersonnelByFactory(state, factory));
  
  // Use our personnel matching hook
  const {
    matchingSuggestionsOpen,
    openMatchingSuggestions,
    closeMatchingSuggestions,
    handleAssignPersonnel,
    getPotentialMatchCount
  } = usePersonnelMatching(node, factory, phase);
  
  // Find assigned roles and personnel
  const assignedRoles = roles.filter(role => node.roles?.includes(role.id));
  const assignedPersonnel = personnel.filter(person => node.personnel?.includes(person.id));
  
  // Get the department of the node from the first assigned role (if any)
  const department = assignedRoles.length > 0 ? assignedRoles[0].department : '';
  
  // Determine if this node has a vacancy (roles assigned but no personnel)
  const hasVacancy = assignedRoles.length > 0 && assignedPersonnel.length === 0 && visualSettings.highlightVacancies;
  
  // Calculate vacancy details (if node has roles assigned but no personnel)
  const vacancyDetails = {
    hasVacancy: assignedRoles.length > 0 && assignedPersonnel.length === 0,
    roleCount: assignedRoles.length,
    potentialMatches: getPotentialMatchCount(assignedRoles)
  };
  
  const handleDelete = () => {
    dispatch(deleteNode({
      phase,
      factory,
      nodeId: node.id
    }));
  };
  
  // Get colors based on settings
  const getNodeBorderColor = () => {
    if (visualSettings.customColors && visualSettings.borderColor) {
      return visualSettings.borderColor;
    }
    
    // Use the factory color if no custom color is specified
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
  
  // Get text color
  const getTextColor = () => {
    if (visualSettings.customColors) {
      return visualSettings.textColor;
    }
    return '#000000';
  };
  
  // Get background color
  const getBackgroundColor = () => {
    if (hasVacancy) {
      return '#fff8e1'; // Light yellow for vacancies
    }
    
    if (visualSettings.customColors) {
      return visualSettings.nodeColor;
    }
    
    return '#ffffff';
  };
  
  // Get node dimensions from settings
  const nodeWidth = visualSettings.nodeWidth || 200;
  const nodeHeight = visualSettings.nodeHeight || 120;
  const nodeBorderWidth = visualSettings.nodeBorderWidth || 2;
  
  return (
    <>
      <Draggable draggableId={node.id} index={index}>
        {(provided, snapshot) => (
          <Paper
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`org-node ${factory}`}
            elevation={snapshot.isDragging ? 8 : isHighlighted ? 6 : 2}
            sx={{
              position: 'absolute',
              top: node.y,
              left: node.x,
              width: nodeWidth,
              height: nodeHeight,
              transition: snapshot.isDragging ? 'none' : 'all 0.2s',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: getBackgroundColor(),
              color: getTextColor(),
              border: `${nodeBorderWidth}px solid ${getNodeBorderColor()}`,
              boxShadow: isHighlighted ? '0 0 0 2px #ff9800, 0 4px 8px rgba(0,0,0,0.2)' : undefined,
            }}
          >
            {/* ... rest of the component remains the same ... */}
          </Paper>
        )}
      </Draggable>
      
      {/* Personnel matching suggestions dialog */}
      {matchingSuggestionsOpen && (
        <PersonnelMatchingSuggestions 
          open={matchingSuggestionsOpen}
          onClose={closeMatchingSuggestions}
          node={node}
          onAssignPersonnel={handleAssignPersonnel}
        />
      )}
    </>
  );
};

export default OrgNode; 