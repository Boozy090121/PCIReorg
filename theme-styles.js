// src/styles/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#CC2030', // PCI Red
    },
    secondary: {
      main: '#00518A', // PCI Blue
    },
    focusFactory: {
      ADD: '#CC2030', // Red
      BBV: '#00518A', // Blue
      SYN: '#232323', // Dark Grey
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;

// src/styles/globals.css
body {
  margin: 0;
  font-family: 'Roboto', 'Arial', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.panel-container {
  display: flex;
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.left-panel {
  width: 25%;
  overflow-y: auto;
  border-right: 1px solid #e0e0e0;
  background-color: #fafafa;
}

.center-panel {
  width: 50%;
  overflow: auto;
  position: relative;
}

.right-panel {
  width: 25%;
  overflow-y: auto;
  border-left: 1px solid #e0e0e0;
  background-color: #fafafa;
}

.drag-item {
  cursor: grab;
}

.dragging {
  opacity: 0.5;
}

.org-node {
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  margin: 8px;
  background-color: white;
  min-width: 200px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.org-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.org-node.ADD {
  border-color: #CC2030;
}

.org-node.BBV {
  border-color: #00518A;
}

.org-node.SYN {
  border-color: #232323;
}

.connection-line {
  stroke: #666;
  stroke-width: 2;
  fill: none;
}

@media (max-width: 1024px) {
  .panel-container {
    flex-direction: column;
  }
  
  .left-panel, .center-panel, .right-panel {
    width: 100%;
    height: auto;
  }
  
  .left-panel, .center-panel {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
}
