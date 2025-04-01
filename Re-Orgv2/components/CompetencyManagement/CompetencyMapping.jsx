import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Rating,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Autocomplete,
  Card,
  CardContent,
  Grid,
  Slider,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { 
  addCompetency, 
  updateCompetency, 
  deleteCompetency,
  setRoleCompetency,
  updateRoleCompetency
} from '../../features/competencySlice';

const CompetencyMapping = () => {
  const dispatch = useDispatch();
  const competencies = useSelector(state => state.competency.competencies);
  const roleCompetencies = useSelector(state => state.competency.roleCompetencies);
  const roles = useSelector(state => state.roles.roles[state.focusFactory.currentFactory]);
  
  const [currentTab, setCurrentTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [currentCompetency, setCurrentCompetency] = useState(null);
  const [currentRoleMapping, setCurrentRoleMapping] = useState(null);
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleAddCompetency = () => {
    setCurrentCompetency({
      id: '',
      name: '',
      description: '',
      category: '',
      level: 1,
      requiredCertifications: [],
      evaluationCriteria: [],
      regulatoryReference: '',
      keywords: []
    });
    setDialogOpen(true);
  };
  
  const handleEditCompetency = (competency) => {
    setCurrentCompetency({...competency});
    setDialogOpen(true);
  };
  
  const handleDeleteCompetency = (competencyId) => {
    if (confirm("Are you sure you want to delete this competency?")) {
      dispatch(deleteCompetency(competencyId));
    }
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentCompetency(null);
  };
  
  const handleRoleDialogClose = () => {
    setRoleDialogOpen(false);
    setCurrentRoleMapping(null);
  };
  
  const handleCompetencySave = () => {
    if (currentCompetency.id) {
      dispatch(updateCompetency(currentCompetency));
    } else {
      dispatch(addCompetency({
        ...currentCompetency,
        id: `comp_${Date.now()}`
      }));
    }
    handleDialogClose();
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCompetency(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleLevelChange = (event, newValue) => {
    setCurrentCompetency(prev => ({
      ...prev,
      level: newValue
    }));
  };
  
  const handleMapCompetenciesToRole = (role) => {
    const existingMapping = roleCompetencies.find(rc => rc.roleId === role.id);
    
    setCurrentRoleMapping(existingMapping || {
      roleId: role.id,
      requiredCompetencies: [],
      totalWeight: 0
    });
    
    setRoleDialogOpen(true);
  };
  
  const handleAddRequiredCompetency = (competency) => {
    if (!competency) return;
    
    if (currentRoleMapping.requiredCompetencies.some(rc => rc.competencyId === competency.id)) {
      return;
    }
    
    const updatedMapping = {
      ...currentRoleMapping,
      requiredCompetencies: [
        ...currentRoleMapping.requiredCompetencies,
        {
          competencyId: competency.id,
          minimumLevel: competency.level,
          isEssential: true,
          weight: 5
        }
      ]
    };
    
    updatedMapping.totalWeight = updatedMapping.requiredCompetencies.reduce(
      (sum, rc) => sum + rc.weight, 0
    );
    
    setCurrentRoleMapping(updatedMapping);
  };
  
  const handleRequiredCompetencyChange = (index, field, value) => {
    const updatedRequiredCompetencies = [...currentRoleMapping.requiredCompetencies];
    updatedRequiredCompetencies[index] = {
      ...updatedRequiredCompetencies[index],
      [field]: value
    };
    
    const updatedMapping = {
      ...currentRoleMapping,
      requiredCompetencies: updatedRequiredCompetencies,
      totalWeight: updatedRequiredCompetencies.reduce((sum, rc) => sum + rc.weight, 0)
    };
    
    setCurrentRoleMapping(updatedMapping);
  };
  
  const handleRemoveRequiredCompetency = (index) => {
    const updatedRequiredCompetencies = [...currentRoleMapping.requiredCompetencies];
    updatedRequiredCompetencies.splice(index, 1);
    
    const updatedMapping = {
      ...currentRoleMapping,
      requiredCompetencies: updatedRequiredCompetencies,
      totalWeight: updatedRequiredCompetencies.reduce((sum, rc) => sum + rc.weight, 0)
    };
    
    setCurrentRoleMapping(updatedMapping);
  };
  
  const handleRoleMappingSave = () => {
    if (currentRoleMapping) {
      if (roleCompetencies.some(rc => rc.roleId === currentRoleMapping.roleId)) {
        dispatch(updateRoleCompetency(currentRoleMapping));
      } else {
        dispatch(setRoleCompetency(currentRoleMapping));
      }
    }
    handleRoleDialogClose();
  };
  
  const findCompetencyById = (id) => {
    return competencies.find(comp => comp.id === id);
  };
  
  const findRoleById = (id) => {
    return roles.find(role => role.id === id);
  };
  
  const getCompetencyCountForRole = (roleId) => {
    const mapping = roleCompetencies.find(rc => rc.roleId === roleId);
    return mapping ? mapping.requiredCompetencies.length : 0;
  };
  
  const getEssentialCountForRole = (roleId) => {
    const mapping = roleCompetencies.find(rc => rc.roleId === roleId);
    return mapping ? mapping.requiredCompetencies.filter(rc => rc.isEssential).length : 0;
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Competencies" />
          <Tab label="Role Mappings" />
        </Tabs>
      </Box>
      
      {/* Competencies Tab */}
      {currentTab === 0 && (
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Competency Library</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<span className="material-icons">add</span>}
              onClick={handleAddCompetency}
            >
              Add Competency
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Certifications</TableCell>
                  <TableCell>Regulatory Reference</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {competencies.map((competency) => (
                  <TableRow key={competency.id}>
                    <TableCell component="th" scope="row">
                      <Typography fontWeight="medium">{competency.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {competency.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{competency.category}</TableCell>
                    <TableCell>
                      <Rating 
                        value={competency.level} 
                        readOnly 
                        max={5} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {competency.requiredCertifications.map((cert, index) => (
                          <Chip 
                            key={index} 
                            label={cert} 
                            size="small" 
                            variant="outlined" 
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>{competency.regulatoryReference}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEditCompetency(competency)}>
                        <span className="material-icons" style={{fontSize: '20px'}}>edit</span>
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteCompetency(competency.id)}>
                        <span className="material-icons" style={{fontSize: '20px'}}>delete</span>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {competencies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No competencies defined. Add competencies to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      
      {/* Role Mappings Tab */}
      {currentTab === 1 && (
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Role-Competency Mappings
          </Typography>
          
          <Grid container spacing={2}>
            {roles.map((role) => (
              <Grid item xs={12} sm={6} md={4} key={role.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {role.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {role.department}
                    </Typography>
                    
                    <Box sx={{ my: 2 }}>
                      <Typography variant="body2">
                        <strong>Competencies:</strong> {getCompetencyCountForRole(role.id)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Essential:</strong> {getEssentialCountForRole(role.id)}
                      </Typography>
                    </Box>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => handleMapCompetenciesToRole(role)}
                      startIcon={<span className="material-icons">assessment</span>}
                    >
                      Manage Competencies
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Competency Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentCompetency?.id ? 'Edit Competency' : 'Add Competency'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Competency Name"
                value={currentCompetency?.name || ''}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="category"
                label="Category"
                value={currentCompetency?.category || ''}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={currentCompetency?.description || ''}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Competency Level</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={currentCompetency?.level || 1}
                  onChange={handleLevelChange}
                  step={1}
                  marks
                  min={1}
                  max={5}
                  valueLabelDisplay="on"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption">Basic</Typography>
                <Typography variant="caption">Expert</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="regulatoryReference"
                label="Regulatory Reference"
                value={currentCompetency?.regulatoryReference || ''}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="requiredCertifications"
                label="Required Certifications (comma-separated)"
                value={currentCompetency?.requiredCertifications?.join(', ') || ''}
                onChange={(e) => {
                  const certs = e.target.value.split(',').map(cert => cert.trim()).filter(Boolean);
                  setCurrentCompetency(prev => ({
                    ...prev,
                    requiredCertifications: certs
                  }));
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="keywords"
                label="Keywords (comma-separated)"
                value={currentCompetency?.keywords?.join(', ') || ''}
                onChange={(e) => {
                  const keywords = e.target.value.split(',').map(kw => kw.trim()).filter(Boolean);
                  setCurrentCompetency(prev => ({
                    ...prev,
                    keywords: keywords
                  }));
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="evaluationCriteria"
                label="Evaluation Criteria (one per line)"
                value={currentCompetency?.evaluationCriteria?.join('\n') || ''}
                onChange={(e) => {
                  const criteria = e.target.value.split('\n').map(c => c.trim()).filter(Boolean);
                  setCurrentCompetency(prev => ({
                    ...prev,
                    evaluationCriteria: criteria
                  }));
                }}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCompetencySave} 
            variant="contained" 
            startIcon={<span className="material-icons">save</span>}
            disabled={!currentCompetency?.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Role Mapping Dialog */}
      <Dialog 
        open={roleDialogOpen} 
        onClose={handleRoleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Role Competency Mapping: {findRoleById(currentRoleMapping?.roleId)?.title || ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Add Required Competency
            </Typography>
            <Autocomplete
              options={competencies}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Search Competencies" 
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <span className="material-icons" style={{marginRight: '8px'}}>search</span>
                        {params.InputProps.startAdornment}
                      </>
                    )
                  }}
                />
              )}
              onChange={(event, value) => handleAddRequiredCompetency(value)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            Required Competencies
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Competency</TableCell>
                  <TableCell>Min. Level</TableCell>
                  <TableCell>Essential</TableCell>
                  <TableCell>Weight</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentRoleMapping?.requiredCompetencies.map((rc, index) => {
                  const competency = findCompetencyById(rc.competencyId);
                  return (
                    <TableRow key={rc.competencyId}>
                      <TableCell>
                        <Typography variant="body2">{competency?.name || 'Unknown'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {competency?.category || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Rating
                          value={rc.minimumLevel}
                          onChange={(event, newValue) => {
                            handleRequiredCompetencyChange(index, 'minimumLevel', newValue);
                          }}
                          size="small"
                          max={5}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={rc.isEssential}
                              onChange={(e) => {
                                handleRequiredCompetencyChange(index, 'isEssential', e.target.checked);
                              }}
                              size="small"
                            />
                          }
                          label=""
                        />
                      </TableCell>
                      <TableCell>
                        <Slider
                          value={rc.weight}
                          onChange={(event, newValue) => {
                            handleRequiredCompetencyChange(index, 'weight', newValue);
                          }}
                          min={1}
                          max={10}
                          step={1}
                          valueLabelDisplay="auto"
                          size="small"
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          onClick={() => handleRemoveRequiredCompetency(index)}
                        >
                          <span className="material-icons" style={{fontSize: '20px'}}>delete</span>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!currentRoleMapping?.requiredCompetencies || 
                  currentRoleMapping.requiredCompetencies.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No competencies assigned to this role yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRoleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleRoleMappingSave} 
            variant="contained" 
            startIcon={<span className="material-icons">save</span>}
          >
            Save Mapping
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompetencyMapping; 