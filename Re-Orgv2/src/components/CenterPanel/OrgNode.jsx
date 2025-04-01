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
// Use the global ReactBeautifulDnD from CDN
const { Draggable } = window.ReactBeautifulDnD;
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
  
  // Add safety check for required props
  if (!node || !factory || !phase) {
    console.warn('OrgNode: Missing required props', { node, factory, phase });
    return null;
  }

  const roles = useSelector(state => selectRolesByFactory(state, factory)) || [];
  const personnel = useSelector(state => selectPersonnelByFactory(state, factory)) || [];
  
  // Ensure node.roles and node.personnel are arrays
  const nodeRoles = Array.isArray(node.roles) ? node.roles : [];
  const nodePersonnel = Array.isArray(node.personnel) ? node.personnel : [];
  
  // Find assigned roles and personnel with additional safety checks
  const assignedRoles = roles.filter(role => role && nodeRoles.includes(role.id)) || [];
  const assignedPersonnel = personnel.filter(person => person && nodePersonnel.includes(person.id)) || [];
  
  // First determine if this node has a vacancy (roles assigned but no personnel)
  const hasRoles = Array.isArray(assignedRoles) && assignedRoles.length > 0;
  const hasPersonnel = Array.isArray(assignedPersonnel) && assignedPersonnel.length > 0;
  const hasVacancy = hasRoles && !hasPersonnel;
  
  // Use our personnel matching hook with the calculated vacancy state
  const {
    matchingSuggestionsOpen,
    openMatchingSuggestions,
    closeMatchingSuggestions,
    handleAssignPersonnel,
    getPotentialMatchCount
  } = usePersonnelMatching(node, factory, phase, hasVacancy);
  
  // Calculate potential matches if there's a vacancy
  const potentialMatches = hasVacancy && Array.isArray(assignedRoles) ? getPotentialMatchCount(assignedRoles) : 0;
  
  // Get the department of the node from the first assigned role (if any)
  const department = assignedRoles.length > 0 && assignedRoles[0]?.department || '';
  
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
    if (hasVacancy && visualSettings.highlightVacancies) {
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
        {(provided) => (
          <Paper
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            elevation={3}
            sx={{
              position: 'absolute',
              left: node.x,
              top: node.y,
              width: nodeWidth,
              height: nodeHeight,
              backgroundColor: getBackgroundColor(),
              border: `${nodeBorderWidth}px solid ${getNodeBorderColor()}`,
              color: getTextColor(),
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
              cursor: 'grab',
              '&:hover': {
                boxShadow: 6,
                transform: 'scale(1.02)'
              },
              ...(isHighlighted && {
                boxShadow: 6,
                transform: 'scale(1.02)',
                border: `${nodeBorderWidth}px solid #2196f3`
              })
            }}
          >
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold', flex: 1 }}>
                {node.title || 'Untitled Position'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" onClick={handleDelete}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            {visualSettings.showDepartments && department && (
              <Box sx={{ px: 1, display: 'flex', alignItems: 'center' }}>
                <BusinessIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6, fontSize: '0.875rem' }} />
                <Typography variant="caption" color="text.secondary" noWrap>
                  {department}
                </Typography>
              </Box>
            )}
            
            <Divider sx={{ my: 0.5 }} />
            
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 1 }}>
              {visualSettings.showPersonnel && (
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonOutlineIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6 }} />
                      <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                        Personnel
                      </Typography>
                    </Box>
                    
                    {/* Add the matching button if there are vacancies and potential matches */}
                    {hasVacancy && potentialMatches > 0 && (
                      <Tooltip title="Find matching personnel">
                        <IconButton 
                          size="small" 
                          onClick={openMatchingSuggestions}
                          sx={{ p: 0.5 }}
                        >
                          <Badge 
                            badgeContent={potentialMatches} 
                            color="primary"
                            overlap="circular"
                            sx={{ '& .MuiBadge-badge': { fontSize: '9px', height: '16px', minWidth: '16px' } }}
                          >
                            <PersonSearchIcon fontSize="small" />
                          </Badge>
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  
                  {/* Display assigned personnel or vacancy message */}
                  <Box sx={{ pl: 1 }}>
                    {hasPersonnel ? (
                      assignedPersonnel.map((person, i) => (
                        <Typography 
                          key={person.id} 
                          variant="caption" 
                          display="block"
                          noWrap
                          sx={{ 
                            color: 'text.secondary',
                            '&:not(:last-child)': { mb: 0.5 }
                          }}
                        >
                          {person.name}
                        </Typography>
                      ))
                    ) : hasVacancy ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography 
                          variant="caption" 
                          color="error" 
                          sx={{ display: 'block', fontWeight: 'bold' }}
                        >
                          Vacancy
                        </Typography>
                        
                        {potentialMatches > 0 && (
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<PersonAddIcon fontSize="small" />}
                            onClick={openMatchingSuggestions}
                            sx={{ 
                              fontSize: '0.7rem', 
                              p: 0, 
                              minWidth: 0, 
                              textTransform: 'none',
                              mt: 0.5
                            }}
                          >
                            Find matches
                          </Button>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No personnel assigned
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
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