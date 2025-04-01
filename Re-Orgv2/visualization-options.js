// src/components/CenterPanel/VisualizationOptions.js
import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Drawer, 
  IconButton, 
  Divider, 
  FormControl, 
  FormControlLabel, 
  InputLabel, 
  Select, 
  MenuItem, 
  Switch, 
  Slider, 
  TextField, 
  Button,
  Grid,
  Tooltip
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import html2canvas from 'html2canvas';

const VisualizationOptions = ({ 
  open, 
  onClose, 
  onApplySettings, 
  currentSettings
}) => {
  const currentFactory = useSelector(selectCurrentFactory);
  
  // Initialize state with current settings or defaults
  const [settings, setSettings] = useState({
    layout: 'hierarchical',
    direction: 'vertical',
    nodeSpacing: 80,
    levelSpacing: 120,
    showRoles: true,
    showPersonnel: true,
    showDepartments: false,
    highlightVacancies: true,
    nodeBorderWidth: 2,
    nodeWidth: 240,
    nodeHeight: 120,
    connectionStyle: 'straight',
    customColors: false,
    nodeColor: '#ffffff',
    textColor: '#000000',
    borderColor: '',
  });

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: value !== undefined ? value : checked
    }));
  };

  const handleSliderChange = (name, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: value
    }));
  };

  const handleApply = () => {
    onApplySettings(settings);
    onClose();
  };

  const handleReset = () => {
    // Reset to defaults
    setSettings({
      layout: 'hierarchical',
      direction: 'vertical',
      nodeSpacing: 100,
      levelSpacing: 160,
      showRoles: true,
      showPersonnel: true,
      showDepartments: false,
      highlightVacancies: true,
      nodeBorderWidth: 2,
      nodeWidth: 280,
      nodeHeight: 160,
      connectionStyle: 'straight',
      customColors: false,
      nodeColor: '#ffffff',
      textColor: '#000000',
      borderColor: '',
    });
  };

  const handleSaveAsImage = () => {
    // Using html2canvas to capture the org chart
    const chartElement = document.getElementById('org-chart-container');
    
    if (chartElement) {
      html2canvas(chartElement).then(canvas => {
        // Create a download link
        const link = document.createElement('a');
        link.download = `org-chart-${currentFactory}-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const handlePrint = () => {
    // Prepare the chart for printing
    const chartElement = document.getElementById('org-chart-container');
    
    if (chartElement) {
      html2canvas(chartElement).then(canvas => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Organization Chart - ${currentFactory}</title>
              <style>
                body { margin: 0; padding: 20px; }
                img { max-width: 100%; }
              </style>
            </head>
            <body>
              <h1>Organization Chart - ${currentFactory}</h1>
              <img src="${canvas.toDataURL('image/png')}" />
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      });
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
    >
      <Box sx={{ width: 350, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Visualization Options
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Layout Options
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="layout-type-label">Layout Type</InputLabel>
            <Select
              labelId="layout-type-label"
              name="layout"
              value={settings.layout}
              onChange={handleChange}
              label="Layout Type"
            >
              <MenuItem value="hierarchical">Hierarchical</MenuItem>
              <MenuItem value="forcedirected">Force Directed</MenuItem>
              <MenuItem value="radial">Radial</MenuItem>
              <MenuItem value="horizontal">Horizontal</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="direction-label">Direction</InputLabel>
            <Select
              labelId="direction-label"
              name="direction"
              value={settings.direction}
              onChange={handleChange}
              label="Direction"
              disabled={settings.layout !== 'hierarchical'}
            >
              <MenuItem value="vertical">Top to Bottom</MenuItem>
              <MenuItem value="horizontal">Left to Right</MenuItem>
              <MenuItem value="reverse-vertical">Bottom to Top</MenuItem>
              <MenuItem value="reverse-horizontal">Right to Left</MenuItem>
            </Select>
          </FormControl>
          
          <Typography id="node-spacing-slider" gutterBottom sx={{ mt: 2 }}>
            Node Spacing: {settings.nodeSpacing}px
          </Typography>
          <Slider
            value={settings.nodeSpacing}
            onChange={(_, value) => handleSliderChange('nodeSpacing', value)}
            aria-labelledby="node-spacing-slider"
            valueLabelDisplay="auto"
            min={20}
            max={150}
          />
          
          <Typography id="level-spacing-slider" gutterBottom sx={{ mt: 2 }}>
            Level Spacing: {settings.levelSpacing}px
          </Typography>
          <Slider
            value={settings.levelSpacing}
            onChange={(_, value) => handleSliderChange('levelSpacing', value)}
            aria-labelledby="level-spacing-slider"
            valueLabelDisplay="auto"
            min={50}
            max={200}
          />
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Node Display
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.showRoles} 
                    onChange={handleChange} 
                    name="showRoles" 
                  />
                }
                label="Show Roles"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.showPersonnel} 
                    onChange={handleChange} 
                    name="showPersonnel" 
                  />
                }
                label="Show Personnel"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.showDepartments} 
                    onChange={handleChange} 
                    name="showDepartments" 
                  />
                }
                label="Show Departments"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.highlightVacancies} 
                    onChange={handleChange} 
                    name="highlightVacancies" 
                  />
                }
                label="Highlight Vacancies"
              />
            </Grid>
          </Grid>
          
          <Typography id="node-width-slider" gutterBottom sx={{ mt: 2 }}>
            Node Width: {settings.nodeWidth}px
          </Typography>
          <Slider
            value={settings.nodeWidth}
            onChange={(_, value) => handleSliderChange('nodeWidth', value)}
            aria-labelledby="node-width-slider"
            valueLabelDisplay="auto"
            min={150}
            max={350}
          />
          
          <Typography id="node-height-slider" gutterBottom sx={{ mt: 2 }}>
            Node Height: {settings.nodeHeight}px
          </Typography>
          <Slider
            value={settings.nodeHeight}
            onChange={(_, value) => handleSliderChange('nodeHeight', value)}
            aria-labelledby="node-height-slider"
            valueLabelDisplay="auto"
            min={80}
            max={200}
          />
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Connections
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="connection-style-label">Connection Style</InputLabel>
            <Select
              labelId="connection-style-label"
              name="connectionStyle"
              value={settings.connectionStyle}
              onChange={handleChange}
              label="Connection Style"
            >
              <MenuItem value="straight">Straight</MenuItem>
              <MenuItem value="curved">Curved</MenuItem>
              <MenuItem value="orthogonal">Orthogonal</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={settings.customColors} 
                onChange={handleChange} 
                name="customColors" 
              />
            }
            label="Use Custom Colors"
          />
          
          {settings.customColors && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  label="Node Color"
                  name="nodeColor"
                  value={settings.nodeColor}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <input
                        type="color"
                        value={settings.nodeColor}
                        onChange={(e) => handleChange({
                          target: { name: 'nodeColor', value: e.target.value }
                        })}
                        style={{ width: 24, height: 24, padding: 0, border: 'none' }}
                      />
                    ),
                  }}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Text Color"
                  name="textColor"
                  value={settings.textColor}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <input
                        type="color"
                        value={settings.textColor}
                        onChange={(e) => handleChange({
                          target: { name: 'textColor', value: e.target.value }
                        })}
                        style={{ width: 24, height: 24, padding: 0, border: 'none' }}
                      />
                    ),
                  }}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Border Color (empty for factory colors)"
                  name="borderColor"
                  value={settings.borderColor}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: settings.borderColor && (
                      <input
                        type="color"
                        value={settings.borderColor}
                        onChange={(e) => handleChange({
                          target: { name: 'borderColor', value: e.target.value }
                        })}
                        style={{ width: 24, height: 24, padding: 0, border: 'none' }}
                      />
                    ),
                  }}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
          )}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<RestoreIcon />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleApply}
          >
            Apply
          </Button>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Export Options
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            fullWidth
          >
            Print
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<FileDownloadIcon />}
            onClick={handleSaveAsImage}
            fullWidth
          >
            Save as Image
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default VisualizationOptions;