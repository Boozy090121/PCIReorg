// src/components/CenterPanel/PersonnelMatchingSuggestions.js
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Typography,
  Chip,
  Box,
  IconButton,
  Divider,
  Rating,
  Tooltip,
  LinearProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { selectRolesByFactory } from '../../features/roleSlice';
import { selectPersonnelByFactory } from '../../features/personnelSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';

const PersonnelMatchingSuggestions = ({ 
  open, 
  onClose, 
  node,
  onAssignPersonnel
}) => {
  const currentFactory = useSelector(selectCurrentFactory);
  const roles = useSelector(state => selectRolesByFactory(state, currentFactory));
  const personnel = useSelector(state => selectPersonnelByFactory(state, currentFactory));
  
  const [matchedPersonnel, setMatchedPersonnel] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Find the roles assigned to this node
  const nodeRoles = roles.filter(role => node.roles?.includes(role.id));
  
  // Find the personnel already assigned to this node
  const assignedPersonnel = personnel.filter(person => node.personnel?.includes(person.id));
  
  // Get all required skills from the assigned roles
  const requiredSkills = new Set();
  nodeRoles.forEach(role => {
    if (role.skills) {
      role.skills.forEach(skill => requiredSkills.add(skill));
    }
  });
  
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate an API call or complex matching algorithm
    setTimeout(() => {
      // Get unassigned personnel
      const unassignedPersonnel = personnel.filter(person => 
        !node.personnel?.includes(person.id) && 
        person.availability !== 'Not Available'
      );
      
      // Calculate match score for each person
      const scoredPersonnel = unassignedPersonnel.map(person => {
        let matchScore = 0;
        let matchedSkillsCount = 0;
        
        // Check for matching skills
        if (person.skills && requiredSkills.size > 0) {
          person.skills.forEach(skill => {
            if (requiredSkills.has(skill)) {
              matchedSkillsCount++;
              matchScore += 20; // 20 points per matching skill
            }
          });
        }
        
        // Check for experience level match
        if (person.experience) {
          const roleNeedsLeadership = nodeRoles.some(role => 
            role.title.toLowerCase().includes('director') || 
            role.title.toLowerCase().includes('manager') || 
            role.title.toLowerCase().includes('lead')
          );
          
          if (roleNeedsLeadership && 
             (person.experience === 'Lead' || 
              person.experience === 'Management' || 
              person.experience === 'Senior')) {
            matchScore += 30; // 30 points for leadership match
          }
          
          // Additional points for experience level
          switch (person.experience) {
            case 'Entry Level':
              matchScore += 5;
              break;
            case 'Junior':
              matchScore += 10;
              break;
            case 'Mid-Level':
              matchScore += 15;
              break;
            case 'Senior':
              matchScore += 20;
              break;
            case 'Lead':
              matchScore += 25;
              break;
            case 'Management':
              matchScore += 30;
              break;
            default:
              break;
          }
        }
        
        // Add bonus points for 'Available' vs 'Partially Available'
        if (person.availability === 'Available') {
          matchScore += 15;
        } else if (person.availability === 'Partially Available') {
          matchScore += 5;
        }
        
        // Calculate match percentage (max score would be 100)
        const matchPercentage = Math.min(Math.round(matchScore), 100);
        
        return {
          ...person,
          matchScore,
          matchPercentage,
          matchedSkillsCount,
          totalRequiredSkills: requiredSkills.size
        };
      });
      
      // Sort by match score (highest first)
      scoredPersonnel.sort((a, b) => b.matchScore - a.matchScore);
      
      setMatchedPersonnel(scoredPersonnel);
      setIsLoading(false);
    }, 1000);
  }, [node.id]);
  
  const handleAssignPerson = (person) => {
    onAssignPersonnel(person);
  };
  
  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'primary';
    if (percentage >= 30) return 'warning';
    return 'error';
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Suggested Personnel for {node.title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 12
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {nodeRoles.length > 0 ? (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Required Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {requiredSkills.size > 0 ? (
                Array.from(requiredSkills).map((skill, index) => (
                  <Chip 
                    key={index} 
                    label={skill} 
                    color="primary" 
                    variant="outlined" 
                    size="small" 
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No specific skills required
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Personnel Matches
            </Typography>
            
            {isLoading ? (
              <Box sx={{ my: 4 }}>
                <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                  Finding the best matches...
                </Typography>
                <LinearProgress />
              </Box>
            ) : (
              matchedPersonnel.length > 0 ? (
                <List>
                  {matchedPersonnel.map((person) => (
                    <ListItem key={person.id} alignItems="flex-start" sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {person.name}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={person.availability} 
                              color={person.availability === 'Available' ? 'success' : 'warning'} 
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary" component="span">
                              {person.currentRole || 'No current role'} • {person.experience || 'Experience not specified'}
                            </Typography>
                            
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" component="span">
                                Skills: 
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                {person.skills?.map((skill, index) => (
                                  <Chip 
                                    key={index} 
                                    label={skill} 
                                    size="small"
                                    color={requiredSkills.has(skill) ? 'success' : 'default'}
                                    variant={requiredSkills.has(skill) ? 'filled' : 'outlined'}
                                    sx={{ 
                                      height: 20, 
                                      fontSize: '0.675rem', 
                                      '& .MuiChip-label': { p: '0 6px' } 
                                    }}
                                  />
                                ))}
                                {!person.skills?.length && (
                                  <Typography variant="body2" color="text.secondary">
                                    No skills listed
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
                          <Tooltip 
                            title={`Match score: ${person.matchPercentage}% - ${person.matchedSkillsCount} of ${person.totalRequiredSkills} required skills`}
                            placement="left"
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography 
                                variant="subtitle1" 
                                color={`${getMatchColor(person.matchPercentage)}.main`}
                                sx={{ mr: 1 }}
                              >
                                {person.matchPercentage}%
                              </Typography>
                              <Rating 
                                value={Math.ceil(person.matchPercentage / 20)} 
                                max={5} 
                                readOnly 
                                size="small" 
                              />
                            </Box>
                          </Tooltip>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={() => handleAssignPerson(person)}
                          >
                            Assign
                          </Button>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" align="center" sx={{ my: 4 }}>
                  No available personnel found. Add more personnel or change the role requirements.
                </Typography>
              )
            )}
          </>
        ) : (
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Typography variant="body1" paragraph>
              No roles have been assigned to this position yet.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Assign roles to the position first to see personnel matching suggestions.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PersonnelMatchingSuggestions;

// Add a hook function to incorporate personnel matching into OrgNode.js

// src/components/CenterPanel/usePersonnelMatching.js
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateNode } from '../../features/orgChartSlice';

export const usePersonnelMatching = (node, factory, phase) => {
  const dispatch = useDispatch();
  const [matchingSuggestionsOpen, setMatchingSuggestionsOpen] = useState(false);
  
  const openMatchingSuggestions = () => {
    setMatchingSuggestionsOpen(true);
  };
  
  const closeMatchingSuggestions = () => {
    setMatchingSuggestionsOpen(false);
  };
  
  const handleAssignPersonnel = (person) => {
    // Add the personnel ID to the node's personnel array
    const updatedPersonnel = node.personnel ? [...node.personnel, person.id] : [person.id];
    
    // Create updated node
    const updatedNode = {
      ...node,
      personnel: updatedPersonnel
    };
    
    // Dispatch update action
    dispatch(updateNode({
      phase,
      factory,
      node: updatedNode
    }));
  };
  
  return {
    matchingSuggestionsOpen,
    openMatchingSuggestions,
    closeMatchingSuggestions,
    handleAssignPersonnel
  };
};
