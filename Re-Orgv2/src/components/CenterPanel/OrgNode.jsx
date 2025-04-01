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
import { Draggable } from 'react-beautiful-dnd';
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
  
  // Use our personnel matching hook
  const {
    matchingSuggestionsOpen,
    openMatchingSuggestions,
    closeMatchingSuggestions,
    handleAssignPersonnel,
    getPotentialMatchCount
  } = usePersonnelMatching(node, factory, phase);
  
  // Get the department of the node from the first assigned role (if any)
  const department = assignedRoles.length > 0 && assignedRoles[0]?.department || '';
  
  // First determine if this node has a vacancy (roles assigned but no personnel)
  const hasRoles = assignedRoles.length > 0;
  const hasPersonnel = assignedPersonnel.length > 0;
  const hasVacancy = hasRoles && !hasPersonnel;
  
  // Then calculate potential matches if there's a vacancy
  const potentialMatches = hasVacancy ? getPotentialMatchCount(assignedRoles) : 0;
  
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
        {(provided, snapshot) => (
          <Paper
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            elevation={snapshot.isDragging ? 8 : 1}
            sx={{
              width: nodeWidth,
              minHeight: nodeHeight,
              position: 'absolute',
              left: node.x,
              top: node.y,
              backgroundColor: getBackgroundColor(),
              border: `${nodeBorderWidth}px solid ${getNodeBorderColor()}`,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              color: getTextColor(),
              transition: 'box-shadow 0.2s ease',
              cursor: 'grab',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                '& .node-actions': {
                  opacity: 1
                }
              },
              ...(isHighlighted && {
                boxShadow: '0 0 0 2px #1976d2',
              })
            }}
          >
            {/* Node Header */}
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: 1 }}>
                {node.title}
              </Typography>
              
              <Box className="node-actions" sx={{ opacity: 0, transition: 'opacity 0.2s ease' }}>
                <IconButton size="small" onClick={handleDelete} sx={{ p: 0.5 }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            <Divider />
            
            {/* Node Content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 1 }}>
              {/* Roles Section */}
              {visualSettings.showRoles && (
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <WorkOutlineIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6 }} />
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                      Roles
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {assignedRoles.map(role => (
                      <Chip 
                        key={role.id}
                        label={role.title}
                        size="small"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.675rem',
                          '& .MuiChip-label': { p: '0 6px' }
                        }}
                      />
                    ))}
                    {!hasRoles && (
                      <Typography variant="caption" color="text.secondary">
                        No roles assigned
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              
              {/* Department Section */}
              {visualSettings.showDepartments && department && (
                <Box sx={{ px: 1, display: 'flex', alignItems: 'center' }}>
                  <BusinessIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6, fontSize: '0.875rem' }} />
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {department}
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 0.5 }} />
              
              {/* Personnel Section */}
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
                  {hasPersonnel ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {assignedPersonnel.map(person => (
                        <Chip 
                          key={person.id}
                          label={person.name}
                          size="small"
                          sx={{ 
                            height: 20, 
                            fontSize: '0.675rem',
                            '& .MuiChip-label': { p: '0 6px' }
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {hasVacancy ? (
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            width: '100%' 
                          }}
                        >
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
                  )}
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