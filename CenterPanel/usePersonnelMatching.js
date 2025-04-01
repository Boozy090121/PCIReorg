import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateNode } from '../../features/orgChartSlice';
import { selectPersonnelByFactory } from '../../features/personnelSlice';

export const usePersonnelMatching = (node, factory, phase) => {
  const dispatch = useDispatch();
  const [matchingSuggestionsOpen, setMatchingSuggestionsOpen] = useState(false);
  const personnel = useSelector(state => selectPersonnelByFactory(state, factory));
  
  const getPotentialMatchCount = (assignedRoles) => {
    if (!assignedRoles || assignedRoles.length === 0) return 0;
    
    // Extract all required skills from assigned roles
    const requiredSkills = new Set();
    assignedRoles.forEach(role => {
      if (role.skills) {
        role.skills.forEach(skill => requiredSkills.add(skill));
      }
    });
    
    // If no skills required, all unassigned personnel are potential matches
    if (requiredSkills.size === 0) {
      return personnel.filter(person => !node.personnel?.includes(person.id)).length;
    }
    
    // Count unassigned personnel with at least one matching skill
    return personnel.filter(person => {
      if (node.personnel?.includes(person.id)) return false; // Skip if already assigned
      if (!person.skills || person.skills.length === 0) return false; // Skip if no skills
      
      // Check if any skills match
      return person.skills.some(skill => requiredSkills.has(skill));
    }).length;
  };
  
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
    
    // Close the dialog after assigning
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