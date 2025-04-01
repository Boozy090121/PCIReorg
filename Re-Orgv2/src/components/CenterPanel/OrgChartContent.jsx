import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import OrgNode from './OrgNode';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import { selectCurrentPhase } from '../../features/phaseSlice';
import { selectRolesByFactory } from '../../features/roleSlice';
import { selectPersonnelByFactory } from '../../features/personnelSlice';

const OrgChartContent = ({ 
  nodes = [], 
  connections = [], 
  zoom = 1, 
  visualSettings = {}, 
  searchTerm = '' 
}) => {
  const currentFactory = useSelector(selectCurrentFactory);
  const currentPhase = useSelector(selectCurrentPhase);
  const roles = useSelector(state => selectRolesByFactory(state, currentFactory)) || [];
  const personnel = useSelector(state => selectPersonnelByFactory(state, currentFactory)) || [];
  
  // Safety check for required data
  if (!currentFactory || !currentPhase) {
    console.warn('OrgChartContent: Missing required data', { currentFactory, currentPhase });
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Unable to load organization chart. Missing required data.</Typography>
      </Box>
    );
  }
  
  // Filter nodes based on search term with safety checks
  const filteredNodes = nodes.filter(node => {
    if (!node) return false;
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Check node title
    if (node.title?.toLowerCase().includes(searchLower)) return true;
    
    // Check assigned roles with safety checks
    if (Array.isArray(node.roles) && node.roles.length > 0) {
      const nodeRoles = roles.filter(role => role && node.roles.includes(role.id));
      if (nodeRoles.some(role => 
        role?.title?.toLowerCase().includes(searchLower) ||
        (role?.department && role.department.toLowerCase().includes(searchLower))
      )) {
        return true;
      }
    }
    
    // Check assigned personnel with safety checks
    if (Array.isArray(node.personnel) && node.personnel.length > 0) {
      const nodePersonnel = personnel.filter(person => person && node.personnel.includes(person.id));
      if (nodePersonnel.some(person => 
        person?.name?.toLowerCase().includes(searchLower) ||
        (person?.currentRole && person.currentRole.toLowerCase().includes(searchLower))
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
        boxSizing: 'border-box',
        transform: `scale(${zoom})`,
        transformOrigin: '0 0'
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
        {connections.map((connection, index) => (
          <path
            key={index}
            d={connection.path}
            className="connection-line"
            markerEnd="url(#arrowhead)"
          />
        ))}
      </svg>
      
      {/* Render Nodes */}
      {nodes.map((node, index) => {
        // Skip invalid nodes
        if (!node || !node.id) return null;
        
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
          <Typography variant="h6" gutterBottom>No Results Found</Typography>
          <Typography>
            No positions, roles, or personnel match your search term: "{searchTerm}"
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OrgChartContent; 