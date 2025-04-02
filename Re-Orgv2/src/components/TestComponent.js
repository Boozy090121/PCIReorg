import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';

const TestComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">React Test Component</Typography>
      <Typography>Count: {count}</Typography>
      <Button 
        variant="contained" 
        onClick={() => setCount(prev => prev + 1)}
        sx={{ mt: 1 }}
      >
        Increment
      </Button>
    </Box>
  );
};

export default TestComponent; 