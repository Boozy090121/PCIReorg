import React from 'react';
import { Box, Paper } from '@mui/material';

const FlexibleLayout = ({ leftPanel, centerPanel, rightPanel }) => {
  return (
    <Box className="panel-container">
      <Paper className="left-panel" elevation={0}>
        {leftPanel}
      </Paper>
      <Paper className="center-panel" elevation={0}>
        {centerPanel}
      </Paper>
      <Paper className="right-panel" elevation={0}>
        {rightPanel}
      </Paper>
    </Box>
  );
};

export default FlexibleLayout; 