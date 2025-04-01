import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateNode } from '../../features/orgChartSlice';
import { selectPersonnelByFactory } from '../../features/personnelSlice';
import { selectRolesByFactory } from '../../features/roleSlice';

export const usePersonnelMatching = (node, factory, phase) => {
  const dispatch = useDispatch();
  
  // Add safety check for required props
  if (!node || !factory || !phase) {
    console.warn('usePersonnelMatching: Missing required props', { node, factory, phase });
    return {
      matchingSuggestionsOpen: false,
      openMatchingSuggestions: () => {},
      closeMatchingSuggestions: () => {},
      handleAssignPersonnel: () => {},
      getPotentialMatchCount: () => 0
    };
  }

  const [matchingSuggestionsOpen, setMatchingSuggestionsOpen] = useState(false);
  const personnel = useSelector(state => selectPersonnelByFactory(state, factory)) || [];
  const roles = useSelector(state => selectRolesByFactory(state, factory)) || [];
  
  const getPotentialMatchCount = (assignedRoles = []) => {
    try {
      // Extract all required skills from assigned roles with additional safety checks
      const requiredSkills = new Set();
      if (Array.isArray(assignedRoles)) {
        assignedRoles.forEach(role => {
          if (role && Array.isArray(role.skills)) {
            role.skills.forEach(skill => {
              if (skill) requiredSkills.add(skill);
            });
          }
        });
      }
      
      // Get current node's assigned personnel
      const nodePersonnel = Array.isArray(node.personnel) ? node.personnel : [];
      
      // If no skills required, all unassigned personnel are potential matches
      if (requiredSkills.size === 0) {
        return personnel.filter(person => 
          person && 
          person.id && 
          !nodePersonnel.includes(person.id)
        ).length;
      }
      
      // Count unassigned personnel with at least one matching skill
      return personnel.filter(person => {
        if (!person || !person.id) return false;
        if (nodePersonnel.includes(person.id)) return false; // Skip if already assigned
        if (!Array.isArray(person.skills) || person.skills.length === 0) return false; // Skip if no skills
        
        // Check if any skills match
        return person.skills.some(skill => skill && requiredSkills.has(skill));
      }).length;
    } catch (error) {
      console.error('Error calculating potential matches:', error);
      return 0;
    }
  };
  
  const openMatchingSuggestions = () => {
    setMatchingSuggestionsOpen(true);
  };
  
  const closeMatchingSuggestions = () => {
    setMatchingSuggestionsOpen(false);
  };
  
  const handleAssignPersonnel = (personId) => {
    // Get the current node's personnel
    const currentPersonnel = Array.isArray(node.personnel) ? node.personnel : [];
    
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
    handleAssignPersonnel,
    getPotentialMatchCount
  };
}; 