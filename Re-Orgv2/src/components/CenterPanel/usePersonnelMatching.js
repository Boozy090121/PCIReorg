import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateNode } from '../../features/orgChartSlice';
import { selectPersonnelByFactory } from '../../features/personnelSlice';

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
  
  const getPotentialMatchCount = (assignedRoles = []) => {
    try {
      // Safety check for undefined/null inputs
      if (!assignedRoles || !Array.isArray(assignedRoles) || assignedRoles.length === 0) {
        return 0;
      }
      
      if (!Array.isArray(personnel)) {
        return 0;
      }
      
      // Ensure node.personnel is an array
      const nodePersonnel = Array.isArray(node?.personnel) ? node.personnel : [];
      
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
      console.warn('Error in getPotentialMatchCount:', error);
      return 0;
    }
  };
  
  const openMatchingSuggestions = () => {
    setMatchingSuggestionsOpen(true);
  };
  
  const closeMatchingSuggestions = () => {
    setMatchingSuggestionsOpen(false);
  };
  
  const handleAssignPersonnel = (person) => {
    if (!person || !person.id) {
      console.warn('handleAssignPersonnel: Invalid person object', person);
      return;
    }
    
    try {
      // Ensure node.personnel is an array
      const currentPersonnel = Array.isArray(node?.personnel) ? node.personnel : [];
      
      // Add the personnel ID to the node's personnel array
      const updatedPersonnel = [...currentPersonnel, person.id];
      
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
      
      // Close the suggestions dialog
      closeMatchingSuggestions();
    } catch (error) {
      console.warn('Error in handleAssignPersonnel:', error);
    }
  };
  
  return {
    matchingSuggestionsOpen,
    openMatchingSuggestions,
    closeMatchingSuggestions,
    handleAssignPersonnel,
    getPotentialMatchCount
  };
}; 