import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tabs, Tab, Paper, Box, Typography } from '@mui/material';
import { selectCurrentFactory, selectFactories, setCurrentFactory } from '../../features/focusFactorySlice';

const FocusFactorySelector = () => {
  const dispatch = useDispatch();
  const currentFactory = useSelector(selectCurrentFactory);
  const factories = useSelector(selectFactories);

  const handleFactoryChange = (event, newFactory) => {
    dispatch(setCurrentFactory(newFactory));
  };

  const getFactoryColor = (factory) => {
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

  return (
    <Paper elevation={1} sx={{ padding: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Focus Factory:</Typography>
        <Tabs
          value={currentFactory}
          onChange={handleFactoryChange}
          textColor="primary"
          indicatorColor="primary"
        >
          {factories.map((factory) => (
            <Tab 
              key={factory} 
              value={factory} 
              label={factory}
              sx={{ 
                fontWeight: 'bold',
                color: getFactoryColor(factory),
                '&.Mui-selected': {
                  color: getFactoryColor(factory),
                }
              }}
            />
          ))}
        </Tabs>
      </Box>
    </Paper>
  );
};

export default FocusFactorySelector; 