// src/components/CenterPanel/CenterPanel.js
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, Paper, Button, IconButton, Tooltip, Badge, 
  Typography, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitScreenIcon,
  Fullscreen as FullscreenIcon,
  Add as AddIcon,
  Tune as TuneIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  PersonOutline as PersonOutlineIcon,
  WorkOutline as WorkOutlineIcon,
  PersonSearch as PersonSearchIcon,
  PersonAdd as PersonAddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { selectOrgChart } from '../../features/orgChartSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import { selectCurrentPhase } from '../../features/phaseSlice';
import { addNode, updateNode } from '../../features/orgChartSlice';
import OrgChartContent from './OrgChartContent';
import OrgNodeCreator from './OrgNodeCreator';
import VisualizationOptions from './VisualizationOptions';
import SearchAndFilter from './SearchAndFilter';

// Selectors
export const selectRolesByFactory = (state, factory) => {
  return state.roles.roles[factory] || [];
};

export const selectPersonnelByFactory = (state, factory) => {
  return state.personnel.personnel[factory] || [];
};

export const CenterPanel = () => {
  const dispatch = useDispatch();
  const currentFactory = useSelector(selectCurrentFactory);
  const currentPhase = useSelector(selectCurrentPhase);
  const orgChart = useSelector(state => 
    selectOrgChart(state, currentPhase, currentFactory)
  );

  const [zoom, setZoom] = useState(1);
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visualOptionsOpen, setVisualOptionsOpen] = useState(false);
  const [searchFilterOpen, setSearchFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [activeSearch, setActiveSearch] = useState('');
  const [chartPosition, setChartPosition] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Visualization settings state
  const [visualSettings, setVisualSettings] = useState({
    layout: 'hierarchical',
    direction: 'vertical',
    nodeSpacing: 60,
    levelSpacing: 100,
    showRoles: true,
    showPersonnel: true,
    showDepartments: false,
    highlightVacancies: true,
    nodeBorderWidth: 2,
    nodeWidth: 220,
    nodeHeight: 120,
    connectionStyle: 'straight',
    customColors: false,
    nodeColor: '#ffffff',
    textColor: '#000000',
    borderColor: '',
  });

  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  };

  const handleFitScreen = () => {
    setZoom(1);
    setChartPosition({ x: 0, y: 0 });
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleAddNodeClick = () => {
    setIsCreatingNode(true);
  };

  const handleNodeCreatorClose = () => {
    setIsCreatingNode(false);
  };
  
  const handleVisualizationOptionsOpen = () => {
    setVisualOptionsOpen(true);
  };
  
  const handleVisualizationOptionsClose = () => {
    setVisualOptionsOpen(false);
  };
  
  const handleApplyVisualSettings = (newSettings) => {
    setVisualSettings(newSettings);
  };
  
  const handleSearchFilterOpen = () => {
    setSearchFilterOpen(true);
  };
  
  const handleSearchFilterClose = () => {
    setSearchFilterOpen(false);
  };
  
  const handleApplySearch = (searchTerm) => {
    setActiveSearch(searchTerm);
  };
  
  const handleApplyFilters = (filters) => {
    setActiveFilters(Object.values(filters).filter(Boolean).length);
  };
  
  const handleClearSearch = () => {
    setActiveSearch('');
  };
  
  const handleClearFilters = () => {
    setActiveFilters(0);
  };

  // Canvas panning functionality
  const handleCanvasMouseDown = (e) => {
    // Only start panning if not clicking on a node
    if (e.target.classList.contains('org-chart-canvas')) {
      setIsDraggingCanvas(true);
      setDragStart({
        x: e.clientX - chartPosition.x,
        y: e.clientY - chartPosition.y
      });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isDraggingCanvas) {
      setChartPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  const handleCanvasMouseLeave = () => {
    setIsDraggingCanvas(false);
  };

  return (
    <Box 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...(isFullscreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          backgroundColor: 'white',
        })
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 2,
        flexShrink: 0,
        p: 1,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddNodeClick}
            size="small"
          >
            Add Position
          </Button>
          
          <Button
            variant="outlined"
            startIcon={activeSearch ? 
              <Badge color="primary" variant="dot">
                <SearchIcon />
              </Badge> : 
              <SearchIcon />
            }
            onClick={handleSearchFilterOpen}
            size="small"
          >
            Search
          </Button>
          
          <Button
            variant="outlined"
            startIcon={activeFilters > 0 ? 
              <Badge badgeContent={activeFilters} color="primary">
                <FilterListIcon />
              </Badge> : 
              <FilterListIcon />
            }
            onClick={handleSearchFilterOpen}
            size="small"
          >
            Filter
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Visualization Options">
            <IconButton onClick={handleVisualizationOptionsOpen} size="small">
              <TuneIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fit to Screen">
            <IconButton onClick={handleFitScreen} size="small">
              <FitScreenIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <IconButton onClick={handleToggleFullscreen} size="small">
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Box 
        id="org-chart-container"
        sx={{ 
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          backgroundColor: '#f9f9f9'
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseLeave}
        className="org-chart-canvas"
      >
        <Box
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: `scale(${zoom}) translate(${chartPosition.x}px, ${chartPosition.y}px)`,
            transformOrigin: '0 0',
            transition: isDraggingCanvas ? 'none' : 'transform 0.1s ease'
          }}
          className="org-chart-canvas"
        >
          <OrgChartContent 
            nodes={orgChart.nodes} 
            connections={orgChart.connections}
            zoom={zoom}
            visualSettings={visualSettings}
            searchTerm={activeSearch}
          />
        </Box>
      </Box>
      
      {isCreatingNode && (
        <OrgNodeCreator 
          open={isCreatingNode}
          onClose={handleNodeCreatorClose}
        />
      )}
      
      <VisualizationOptions
        open={visualOptionsOpen}
        onClose={handleVisualizationOptionsClose}
        onApplySettings={handleApplyVisualSettings}
        currentSettings={visualSettings}
      />
      
      <SearchAndFilter
        open={searchFilterOpen}
        onClose={handleSearchFilterClose}
        onApplySearch={handleApplySearch}
        onApplyFilters={handleApplyFilters}
        onClearSearch={handleClearSearch}
        onClearFilters={handleClearFilters}
        currentSearch={activeSearch}
      />
    </Box>
  );
};

export const OrgChartContent = ({ 
  nodes, 
  connections, 
  zoom, 
  visualSettings = {}, 
  searchTerm = '' 
}) => {
  const currentFactory = useSelector(selectCurrentFactory);
  const currentPhase = useSelector(selectCurrentPhase);
  const roles = useSelector(state => selectRolesByFactory(state, currentFactory));
  const personnel = useSelector(state => selectPersonnelByFactory(state, currentFactory));
  
  // Render connections between nodes
  const renderConnections = () => {
    if (!connections || !Array.isArray(connections)) return null;
    
    return connections.map(connection => {
      const sourceNode = nodes?.find(n => n.id === connection.sourceId);
      const targetNode = nodes?.find(n => n.id === connection.targetId);
      
      if (!sourceNode || !targetNode) return null;
      
      // Calculate connection points
      const startX = sourceNode.x + (visualSettings.nodeWidth || 200) / 2;
      const startY = sourceNode.y + (visualSettings.nodeHeight || 120) / 2;
      const endX = targetNode.x + (visualSettings.nodeWidth || 200) / 2;
      const endY = targetNode.y + (visualSettings.nodeHeight || 120) / 2;
      
      return (
        <g key={connection.id}>
          <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke="#666"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        </g>
      );
    });
  };

  // Filter nodes based on search term
  const filteredNodes = nodes.filter(node => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Check node title
    if (node.title.toLowerCase().includes(searchLower)) return true;
    
    // Check assigned roles
    if (node.roles && node.roles.length > 0) {
      const nodeRoles = roles.filter(role => node.roles.includes(role.id));
      if (nodeRoles.some(role => 
        role.title.toLowerCase().includes(searchLower) ||
        (role.department && role.department.toLowerCase().includes(searchLower))
      )) {
        return true;
      }
    }
    
    // Check assigned personnel
    if (node.personnel && node.personnel.length > 0) {
      const nodePersonnel = personnel.filter(person => node.personnel.includes(person.id));
      if (nodePersonnel.some(person => 
        person.name.toLowerCase().includes(searchLower) ||
        (person.currentRole && person.currentRole.toLowerCase().includes(searchLower))
      )) {
        return true;
      }
    }
    
    return false;
  });
  
  return (
    <Box
      sx={{
        position: 'relative',
        width: '2000px',
        height: '1500px',
        padding: '60px',
        boxSizing: 'border-box'
      }}
      className="org-chart-canvas"
    >
      {/* SVG for connections */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>
        {renderConnections()}
      </svg>
      
      {/* Render Nodes */}
      {nodes.map((node, index) => {
        // Skip nodes that don't match the search if a search term is provided
        if (searchTerm && !filteredNodes.some(n => n.id === node.id)) {
          return null;
        }
        
        return (
          <OrgNode
            key={node.id}
            node={node}
            index={index}
            factory={currentFactory}
            phase={currentPhase}
            visualSettings={visualSettings}
            isHighlighted={searchTerm && filteredNodes.some(n => n.id === node.id)}
          />
        );
      })}
      
      {/* Show "No results" message if search term is provided but no nodes match */}
      {searchTerm && filteredNodes.length === 0 && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: 3,
            borderRadius: 1,
            boxShadow: 3,
            width: 300,
            textAlign: 'center',
            zIndex: 3,
          }}
        >
          <h3>No Results Found</h3>
          <p>No positions, roles, or personnel match your search term: "{searchTerm}"</p>
        </Box>
      )}
    </Box>
  );
};

export const OrgNode = ({ 
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
  
  // Add before the OrgNode component
  const usePersonnelMatching = (node, factory, phase) => {
    const dispatch = useDispatch();
    const [matchingSuggestionsOpen, setMatchingSuggestionsOpen] = useState(false);
    const personnel = useSelector(state => selectPersonnelByFactory(state, currentFactory));
    const roles = useSelector(state => selectRolesByFactory(state, currentFactory));

    const openMatchingSuggestions = () => {
      setMatchingSuggestionsOpen(true);
    };

    const closeMatchingSuggestions = () => {
      setMatchingSuggestionsOpen(false);
    };

    const handleAssignPersonnel = (personId) => {
      // Get the current node's personnel
      const currentPersonnel = node.personnel || [];
      
      // Add the new person if they're not already assigned
      if (!currentPersonnel.includes(personId)) {
        const updatedPersonnel = [...currentPersonnel, personId];
        
        // Update the node with the new personnel
        dispatch(updateNode({
          phase,
          factory,
          node: {
            ...node,
            personnel: updatedPersonnel
          }
        }));
      }
      
      closeMatchingSuggestions();
    };

    return {
      matchingSuggestionsOpen,
      openMatchingSuggestions,
      closeMatchingSuggestions,
      handleAssignPersonnel
    };
  };

  // Find assigned roles and personnel
  const assignedRoles = roles.filter(role => node.roles?.includes(role.id));
  const assignedPersonnel = personnel.filter(person => node.personnel?.includes(person.id));
  
  // Get the department of the node from the first assigned role (if any)
  const department = assignedRoles.length > 0 ? assignedRoles[0].department : '';
  
  // First determine if this node has a vacancy (roles assigned but no personnel)
  const hasRoles = Array.isArray(assignedRoles) && assignedRoles.length > 0;
  const hasPersonnel = Array.isArray(assignedPersonnel) && assignedPersonnel.length > 0;
  const hasVacancy = hasRoles && !hasPersonnel && visualSettings.highlightVacancies;
  
  // Calculate potential matches if there's a vacancy
  const potentialMatches = (() => {
    if (!hasVacancy) return 0;
    
    // Extract all required skills from assigned roles with additional safety checks
    const requiredSkills = new Set();
    assignedRoles.forEach(role => {
      if (role && Array.isArray(role.skills)) {
        role.skills.forEach(skill => {
          if (skill) requiredSkills.add(skill);
        });
      }
    });
    
    // If no skills required, all unassigned personnel are potential matches
    if (requiredSkills.size === 0) {
      return personnel.filter(person => 
        person && 
        person.id && 
        !assignedPersonnel.includes(person.id)
      ).length;
    }
    
    // Count unassigned personnel with at least one matching skill
    return personnel.filter(person => {
      if (!person || !person.id) return false;
      if (assignedPersonnel.includes(person.id)) return false; // Skip if already assigned
      if (!Array.isArray(person.skills) || person.skills.length === 0) return false; // Skip if no skills
      
      // Check if any skills match
      return person.skills.some(skill => skill && requiredSkills.has(skill));
    }).length;
  })();
  
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
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              p: 1,
              pb: 0
            }}>
              <Typography variant="h6" sx={{ 
                fontSize: '1rem', 
                fontWeight: 'bold',
                maxWidth: 'calc(100% - 60px)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {node.title}
              </Typography>
              <Box>
                <IconButton size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
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
                  
                  <Droppable droppableId={`personnel-${node.id}`} type="PERSONNEL">
                    {(dropProvided) => (
                      <Box
                        ref={dropProvided.innerRef}
                        {...dropProvided.droppableProps}
                        sx={{ 
                          minHeight: 24, 
                          backgroundColor: 'rgba(0,0,0,0.03)',
                          borderRadius: 1,
                          p: 0.5,
                          maxHeight: '40%',
                          overflow: 'auto'
                        }}
                      >
                        {assignedPersonnel.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {assignedPersonnel.map(person => (
                              <Tooltip key={person.id} title={person.currentRole || ''}>
                                <Chip 
                                  label={person.name} 
                                  size="small" 
                                  sx={{ 
                                    height: 20, 
                                    fontSize: '0.675rem', 
                                    '& .MuiChip-label': { p: '0 6px' } 
                                  }} 
                                />
                              </Tooltip>
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
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', p: 0.5 }}>
                                Drag personnel here
                              </Typography>
                            )}
                          </Box>
                        )}
                        {dropProvided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Box>
              )}
              
              {visualSettings.showRoles && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <WorkOutlineIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6 }} />
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                      Roles
                    </Typography>
                  </Box>
                  
                  <Droppable droppableId={`roles-${node.id}`} type="ROLE">
                    {(dropProvided) => (
                      <Box
                        ref={dropProvided.innerRef}
                        {...dropProvided.droppableProps}
                        sx={{ 
                          minHeight: 24,
                          backgroundColor: 'rgba(0,0,0,0.03)',
                          borderRadius: 1,
                          p: 0.5,
                          maxHeight: '40%',
                          overflow: 'auto'
                        }}
                      >
                        {assignedRoles.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {assignedRoles.map(role => (
                              <Tooltip key={role.id} title={role.department || ''}>
                                <Chip 
                                  label={role.title} 
                                  size="small" 
                                  sx={{ 
                                    height: 20, 
                                    fontSize: '0.675rem', 
                                    '& .MuiChip-label': { p: '0 6px' } 
                                  }} 
                                />
                              </Tooltip>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', p: 0.5 }}>
                            Drag roles here
                          </Typography>
                        )}
                        {dropProvided.placeholder}
                      </Box>
                    )}
                  </Droppable>
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

export const OrgNodeCreator = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const currentFactory = useSelector(selectCurrentFactory);
  const currentPhase = useSelector(selectCurrentPhase);
  
  const [node, setNode] = useState({
    title: '',
    x: 400, // default x position
    y: 200, // default y position
    roles: [],
    personnel: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNode({
      ...node,
      [name]: value
    });
  };

  const handleSubmit = () => {
    dispatch(addNode({
      phase: currentPhase,
      factory: currentFactory,
      node: node
    }));
    onClose();
  };

  const isFormValid = node.title.trim() !== '';

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Add New Position
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
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Position Title"
            type="text"
            fullWidth
            variant="outlined"
            value={node.title}
            onChange={handleInputChange}
            required
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              margin="dense"
              name="x"
              label="X Position"
              type="number"
              variant="outlined"
              value={node.x}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ width: '50%' }}
            />
            <TextField
              margin="dense"
              name="y"
              label="Y Position"
              type="number"
              variant="outlined"
              value={node.y}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ width: '50%' }}
            />
          </Box>
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
          Add Position
        </Button>
      </DialogActions>
    </Dialog>
  );
};
