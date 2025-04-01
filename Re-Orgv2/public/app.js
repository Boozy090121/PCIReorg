const { useState, useEffect } = React;
const { 
  Button, 
  Container, 
  Typography, 
  Box, 
  CssBaseline, 
  ThemeProvider, 
  createTheme 
} = MaterialUI;

// Create a theme instance
const theme = createTheme();

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if Firebase is initialized
    const checkFirebase = () => {
      if (window.firebase) {
        setIsInitialized(true);
      }
    };

    checkFirebase();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Quality Re-organization Tool
          </Typography>
          <Typography variant="body1" gutterBottom>
            Firebase Status: {isInitialized ? 'Initialized' : 'Not Initialized'}
          </Typography>
          <Button variant="contained" color="primary">
            Get Started
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />); 