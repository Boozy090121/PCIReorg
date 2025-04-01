// src/components/CenterPanel/CenterPanel.js
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Paper, Button, IconButton, Tooltip, Badge } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { selectOrgChart } from '../../features/orgChartSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import { selectCurrentPhase } from '../../features/phaseSlice';
import { addNode, updateNode } from '../../features/orgChartSlice';
import OrgChartContent from './OrgChartContent';
import OrgNodeCreator from './OrgNodeCreator';
import VisualizationOptions from './VisualizationOptions';
import SearchAndFilter from './SearchAndFilter';

const CenterPanel = () => {
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

  const handleDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    // If dropped outside of a droppable area or in the same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Handle node repositioning
    if (type === 'NODE') {
      // Find the node
      const nodeIndex = orgChart.nodes.findIndex(node => node.id === draggableId);
      if (nodeIndex === -1) return;
      
      const node = orgChart.nodes[nodeIndex];
      
      // Update position based on the visualSettings layout
      let updatedNode;
      
      if (visualSettings.layout === 'hierarchical') {
        // For hierarchical layout, position is more structured
        updatedNode = {
          ...node,
          x: destination.index * visualSettings.nodeSpacing + 100,
          y: parseInt(destination.droppableId) * visualSettings.levelSpacing + 100
        };
      } else {
        // For other layouts, allow more freedom in positioning
        updatedNode = {
          ...node,
          x: destination.index * 150 + 100,
          y: parseInt(destination.droppableId) * 100 + 100
        };
      }
      
      dispatch(updateNode({
        phase: currentPhase,
        factory: currentFactory,
        node: updatedNode
      }));
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100%', 
        position: 'relative',
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
      <Paper 
        elevation={0} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddNodeClick}
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
            >
              Filter
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Visualization Options">
              <IconButton onClick={handleVisualizationOptionsOpen}>
                <TuneIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fit to Screen">
              <IconButton onClick={handleFitScreen}>
                <FitScreenIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton onClick={handleToggleFullscreen}>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box 
            id="org-chart-container"
            sx={{ 
              flex: 1, 
              overflow: 'auto', 
              position: 'relative',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              backgroundColor: '#f9f9f9'
            }}
          >
            <Droppable droppableId="org-chart" type="NODE">
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{ 
                    height: '100%',
                    width: '100%',
                    position: 'relative'
                  }}
                >
                  <OrgChartContent 
                    nodes={orgChart.nodes} 
                    connections={orgChart.connections}
                    zoom={zoom}
                    visualSettings={visualSettings}
                    searchTerm={activeSearch}
                  />
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Box>
        </DragDropContext>
      </Paper>
      
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

export default CenterPanel;

// src/components/CenterPanel/OrgChartContent.js
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import OrgNode from './OrgNode';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import { selectCurrentPhase } from '../../features/phaseSlice';
import { selectRolesByFactory } from '../../features/roleSlice';
import { selectPersonnelByFactory } from '../../features/personnelSlice';

const OrgChartContent = ({ 
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
  
  // Apply layout based on visualSettings
  useEffect(() => {
    if (!visualSettings.layout || nodes.length === 0) return;
    
    // This would be where you implement different layout algorithms
    // In a real application, you'd use a proper graph layout library
    // like dagre, elkjs, or a custom implementation
    
    // For this example, we'll just simulate the layout change
    console.log(`Layout changed to: ${visualSettings.layout}, direction: ${visualSettings.direction}`);
    
  }, [visualSettings.layout, visualSettings.direction, nodes]);
  
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
  
  // Calculate connections as SVG paths
  const renderConnections = () => {
    return connections.map(connection => {
      const sourceNode = nodes.find(node => node.id === connection.sourceId);
      const targetNode = nodes.find(node => node.id === connection.targetId);
      
      if (!sourceNode || !targetNode) return null;
      
      // Skip connections for filtered out nodes
      if (searchTerm && 
          !filteredNodes.some(n => n.id === sourceNode.id) && 
          !filteredNodes.some(n => n.id === targetNode.id)) {
        return null;
      }
      
      // Calculate node dimensions from settings
      const nodeWidth = visualSettings.nodeWidth || 200;
      const nodeHeight = visualSettings.nodeHeight || 120;
      
      // Calculate source and target positions
      const sourceX = sourceNode.x + nodeWidth / 2;
      const sourceY = sourceNode.y + nodeHeight;
      const targetX = targetNode.x + nodeWidth / 2;
      const targetY = targetNode.y;
      
      // Create path based on connection style
      let path;
      
      switch (visualSettings.connectionStyle) {
        case 'straight':
          path = `M${sourceX},${sourceY} L${targetX},${targetY}`;
          break;
        case 'orthogonal':
          const midY = (sourceY + targetY) / 2;
          path = `M${sourceX},${sourceY} L${sourceX},${midY} L${targetX},${midY} L${targetX},${targetY}`;
          break;
        case 'curved':
        default:
          path = `M${sourceX},${sourceY} C${sourceX},${(sourceY + targetY) / 2} ${targetX},${(sourceY + targetY) / 2} ${targetX},${targetY}`;
      }
      
      // Highlight the connection if it's connected to a search result
      const isHighlighted = searchTerm && (
        filteredNodes.some(n => n.id === sourceNode.id) || 
        filteredNodes.some(n => n.id === targetNode.id)
      );
      
      return (
        <path
          key={connection.id}
          d={path}
          className="connection-line"
          markerEnd="url(#arrowhead)"
          style={{
            stroke: isHighlighted ? '#ff9800' : '#666',
            strokeWidth: isHighlighted ? 3 : 2,
            strokeDasharray: isHighlighted ? '5,5' : 'none',
          }}
        />
      );
    });
  };
  
  // Calculate layout dimensions
  const chartWidth = visualSettings.layout === 'horizontal' || visualSettings.direction === 'horizontal' 
    ? '4000px' : '3000px';
  const chartHeight = visualSettings.layout === 'horizontal' || visualSettings.direction === 'horizontal'
    ? '2500px' : '3000px';
  
  return (
    <Box
      sx={{
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
        height: chartHeight,
        width: chartWidth,
        position: 'relative',
      }}
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
            textAlign: 'center'
          }}
        >
          <h3>No Results Found</h3>
          <p>No positions, roles, or personnel match your search term: "{searchTerm}"</p>
        </Box>
      )}
    </Box>
  );
};

export default OrgChartContent;

// src/components/CenterPanel/OrgNode.js
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
    handleAssignPersonnel
  } = usePersonnelMatching(node, factory, phase);
  
  // Find assigned roles and personnel
  const assignedRoles = roles.filter(role => node.roles?.includes(role.id));
  const assignedPersonnel = personnel.filter(person => node.personnel?.includes(person.id));
  
  // Get the department of the node from the first assigned role (if any)
  const department = assignedRoles.length > 0 ? assignedRoles[0].department : '';
  
  // Determine if this node has a vacancy (no personnel assigned)
  const hasVacancy = assignedPersonnel.length === 0 && visualSettings.highlightVacancies;
  
  // Calculate vacancy details (if node has roles assigned but no personnel)
  const vacancyDetails = {
    hasVacancy: assignedRoles.length > 0 && assignedPersonnel.length === 0,
    roleCount: assignedRoles.length,
    // Get potential matches based on matching skills
    potentialMatches: getPotentialMatchCount()
  };
  
  function getPotentialMatchCount() {
    if (!vacancyDetails.hasVacancy) return 0;
    
    // Extract all required skills from assigned roles
    const requiredSkills = new Set();
    assignedRoles.forEach(role => {
      if (role.skills) {
        role.skills.forEach(skill => requiredSkills.add(skill));
      }
    });
    
    // Count personnel with at least one matching skill
    if (requiredSkills.size === 0) return personnel.length; // If no skills required, all personnel match
    
    // Count unassigned personnel with at least one matching skill
    return personnel.filter(person => {
      if (node.personnel?.includes(person.id)) return false; // Skip if already assigned
      if (!person.skills || person.skills.length === 0) return false; // Skip if no skills
      
      // Check if any skills match
      return person.skills.some(skill => requiredSkills.has(skill));
    }).length;
  }
  
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
                    
                    {/* Add the matching button if there are vacancies and roles assigned */}
                    {vacancyDetails.hasVacancy && vacancyDetails.potentialMatches > 0 && (
                      <Tooltip title="Find matching personnel">
                        <IconButton 
                          size="small" 
                          onClick={openMatchingSuggestions}
                          sx={{ p: 0.5 }}
                        >
                          <Badge 
                            badgeContent={vacancyDetails.potentialMatches} 
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
                            {vacancyDetails.hasVacancy ? (
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
                                
                                {vacancyDetails.potentialMatches > 0 && (
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

export default OrgNode;

// src/components/CenterPanel/OrgNodeCreator.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { addNode } from '../../features/orgChartSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import { selectCurrentPhase } from '../../features/phaseSlice';

const OrgNodeCreator = ({ open, onClose }) => {
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

export default OrgNodeCreator;
