import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, ToggleButtonGroup, ToggleButton, Button, Typography, Paper } from '@mui/material';
import CompareIcon from '@mui/icons-material/Compare';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { selectCurrentPhase, selectPhases, setCurrentPhase } from '../../features/phaseSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import { copyOrgChart } from '../../features/orgChartSlice';

const PhaseManager = () => {
  const dispatch = useDispatch();
  const currentPhase = useSelector(selectCurrentPhase);
  const phases = useSelector(selectPhases);
  const currentFactory = useSelector(selectCurrentFactory);

  const handlePhaseChange = (event, newPhase) => {
    if (newPhase !== null) {
      dispatch(setCurrentPhase(newPhase));
    }
  };

  const handleCopyPhase = () => {
    const sourcePhase = currentPhase;
    const targetPhase = currentPhase === 'current' ? 'future' : 'current';
    
    dispatch(copyOrgChart({
      sourcePhase,
      targetPhase,
      factory: currentFactory
    }));
  };

  return (
    <Paper elevation={1} sx={{ padding: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Phase:</Typography>
        <ToggleButtonGroup
          value={currentPhase}
          exclusive
          onChange={handlePhaseChange}
          aria-label="phase selector"
        >
          {phases.map((phase) => (
            <ToggleButton 
              key={phase} 
              value={phase} 
              aria-label={phase}
              sx={{ textTransform: 'capitalize' }}
            >
              {phase}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyPhase}
          sx={{ ml: 2 }}
        >
          Copy to {currentPhase === 'current' ? 'Future' : 'Current'}
        </Button>
        
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<CompareIcon />}
          sx={{ ml: 1 }}
        >
          Compare Phases
        </Button>
      </Box>
    </Paper>
  );
};

export default PhaseManager; 