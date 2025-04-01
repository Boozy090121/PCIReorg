import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Tab,
  Tabs,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
} from '@mui/material';
import { useSelector } from 'react-redux';

const TrainingNeeds = () => {
  const competencies = useSelector(state => state.competency.competencies);
  const roleCompetencies = useSelector(state => state.competency.roleCompetencies);
  const personnelCompetencies = useSelector(state => state.competency.personnelCompetencies);
  const currentFactory = useSelector(state => state.focusFactory.currentFactory);
  const roles = useSelector(state => state.roles.roles[currentFactory]);
  const personnel = useSelector(state => state.personnel.personnel[currentFactory]);
  
  const [currentTab, setCurrentTab] = useState(0);
  const [trainingNeeds, setTrainingNeeds] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  
  useEffect(() => {
    // Calculate training needs
    const needs = [];
    
    personnel.forEach(person => {
      const role = roles.find(r => r.id === person.role);
      if (!role) return;
      
      const roleMapping = roleCompetencies.find(rc => rc.roleId === person.role);
      if (!roleMapping) return;
      
      const personProfile = personnelCompetencies.find(pc => pc.personnelId === person.id);
      
      roleMapping.requiredCompetencies.forEach(rc => {
        const requiredLevel = rc.minimumLevel;
        const comp = competencies.find(c => c.id === rc.competencyId);
        if (!comp) return;
        
        let currentLevel = 0;
        if (personProfile) {
          const acquiredComp = personProfile.acquiredCompetencies.find(
            ac => ac.competencyId === rc.competencyId
          );
          currentLevel = acquiredComp ? acquiredComp.currentLevel : 0;
        }
        
        if (currentLevel < requiredLevel) {
          needs.push({
            personnelId: person.id,
            personnelName: person.name,
            roleId: role.id,
            roleName: role.title,
            competencyId: comp.id,
            competencyName: comp.name,
            category: comp.category,
            currentLevel,
            requiredLevel,
            gap: requiredLevel - currentLevel,
            isEssential: rc.isEssential,
            certifications: comp.requiredCertifications
          });
        }
      });
    });
    
    // Sort by gap size (largest first) and then by essential flag
    needs.sort((a, b) => {
      if (a.isEssential !== b.isEssential) {
        return a.isEssential ? -1 : 1;
      }
      return b.gap - a.gap;
    });
    
    setTrainingNeeds(needs);
  }, [roles, personnel, competencies, roleCompetencies, personnelCompetencies]);
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleOpenDialog = (person) => {
    setSelectedPerson(person);
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPerson(null);
  };
  
  // Group needs by personnel
  const needsByPersonnel = trainingNeeds.reduce((acc, need) => {
    if (!acc[need.personnelId]) {
      acc[need.personnelId] = {
        personnelId: need.personnelId,
        personnelName: need.personnelName,
        roleName: need.roleName,
        needs: []
      };
    }
    acc[need.personnelId].needs.push(need);
    return acc;
  }, {});
  
  // Group needs by competency
  const needsByCompetency = trainingNeeds.reduce((acc, need) => {
    if (!acc[need.competencyId]) {
      acc[need.competencyId] = {
        competencyId: need.competencyId,
        competencyName: need.competencyName,
        category: need.category,
        personnel: []
      };
    }
    acc[need.competencyId].personnel.push({
      personnelId: need.personnelId,
      personnelName: need.personnelName,
      currentLevel: need.currentLevel,
      requiredLevel: need.requiredLevel,
      gap: need.gap
    });
    return acc;
  }, {});
  
  const getPersonnelWithNeedsCount = () => {
    return Object.keys(needsByPersonnel).length;
  };
  
  const getCompetenciesWithGapsCount = () => {
    return Object.keys(needsByCompetency).length;
  };
  
  const getTotalGapsCount = () => {
    return trainingNeeds.length;
  };
  
  const getCriticalGapsCount = () => {
    return trainingNeeds.filter(need => need.isEssential).length;
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Training Needs Dashboard" />
          <Tab label="By Personnel" />
          <Tab label="By Competency" />
        </Tabs>
      </Box>
      
      {/* Dashboard Tab */}
      {currentTab === 0 && (
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Training Needs Analysis
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Personnel with Training Needs
                  </Typography>
                  <Typography variant="h4">
                    {getPersonnelWithNeedsCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    out of {personnel.length} total personnel
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Competencies with Gaps
                  </Typography>
                  <Typography variant="h4">
                    {getCompetenciesWithGapsCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    out of {competencies.length} total competencies
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Training Gaps
                  </Typography>
                  <Typography variant="h4">
                    {getTotalGapsCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    across all personnel
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Critical Gaps
                  </Typography>
                  <Typography variant="h4" color="error">
                    {getCriticalGapsCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    essential competencies missing
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Typography variant="subtitle1" gutterBottom>
            Top Training Priorities
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Personnel</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Competency</TableCell>
                  <TableCell>Current / Required</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trainingNeeds.slice(0, 10).map((need, index) => (
                  <TableRow key={`${need.personnelId}-${need.competencyId}`}>
                    <TableCell>{need.personnelName}</TableCell>
                    <TableCell>{need.roleName}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{need.competencyName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {need.category}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={need.currentLevel} readOnly size="small" />
                        <Typography variant="body2" sx={{ mx: 1 }}>/</Typography>
                        <Rating value={need.requiredLevel} readOnly size="small" />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={need.isEssential ? "Critical" : "Important"} 
                        color={need.isEssential ? "error" : "warning"} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => handleOpenDialog(
                          personnel.find(p => p.id === need.personnelId)
                        )}
                      >
                        Plan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {trainingNeeds.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No training needs identified. All personnel meet their role requirements.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      
      {/* By Personnel Tab */}
      {currentTab === 1 && (
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Training Needs by Personnel
          </Typography>
          
          <Grid container spacing={2}>
            {Object.values(needsByPersonnel).map(personData => (
              <Grid item xs={12} sm={6} md={4} key={personData.personnelId}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <span className="material-icons" style={{marginRight: '8px', color: 'primary.main'}}>
                        person
                      </span>
                      <Typography variant="h6">
                        {personData.personnelName}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Role: {personData.roleName}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Training Needs ({personData.needs.length})
                    </Typography>
                    
                    <List dense>
                      {personData.needs.map(need => (
                        <ListItem key={need.competencyId}>
                          <ListItemIcon>
                            <span className="material-icons" style={{
                              color: need.isEssential ? 'error.main' : 'action.main'
                            }}>
                              school
                            </span>
                          </ListItemIcon>
                          <ListItemText 
                            primary={need.competencyName}
                            secondary={`Current: ${need.currentLevel}, Required: ${need.requiredLevel}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={() => handleOpenDialog(
                        personnel.find(p => p.id === personData.personnelId)
                      )}
                    >
                      Create Development Plan
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
            {Object.keys(needsByPersonnel).length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No training needs identified. All personnel meet their role requirements.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
      
      {/* By Competency Tab */}
      {currentTab === 2 && (
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Training Needs by Competency
          </Typography>
          
          <Grid container spacing={2}>
            {Object.values(needsByCompetency).map(compData => (
              <Grid item xs={12} sm={6} lg={4} key={compData.competencyId}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <span className="material-icons" style={{marginRight: '8px', color: 'primary.main'}}>
                        assignment
                      </span>
                      <Typography variant="h6">
                        {compData.competencyName}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Category: {compData.category}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Personnel Needing Training ({compData.personnel.length})
                    </Typography>
                    
                    <List dense>
                      {compData.personnel.map(p => (
                        <ListItem key={p.personnelId}>
                          <ListItemIcon>
                            <span className="material-icons">person</span>
                          </ListItemIcon>
                          <ListItemText 
                            primary={p.personnelName}
                            secondary={`Current: ${p.currentLevel}, Required: ${p.requiredLevel}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      disabled
                    >
                      Schedule Group Training
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
            {Object.keys(needsByCompetency).length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No training needs identified. All competencies meet requirements.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
      
      {/* Development Plan Dialog */}
      {selectedPerson && (
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Development Plan for {selectedPerson.name}
          </DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Current Role: {roles.find(r => r.id === selectedPerson.role)?.title || 'None'}
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Competency</TableCell>
                    <TableCell>Current / Required</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Recommended Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trainingNeeds
                    .filter(need => need.personnelId === selectedPerson.id)
                    .map(need => (
                      <TableRow key={need.competencyId}>
                        <TableCell>
                          <Typography variant="body2">{need.competencyName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {need.category}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography>{need.currentLevel}</Typography>
                            <span className="material-icons" style={{margin: '0 4px'}}>
                              arrow_right
                            </span>
                            <Typography>{need.requiredLevel}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={need.isEssential ? "Critical" : "Important"} 
                            color={need.isEssential ? "error" : "warning"} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <List dense disablePadding>
                            {need.certifications.length > 0 ? (
                              need.certifications.map((cert, idx) => (
                                <ListItem key={idx} disablePadding>
                                  <ListItemText 
                                    primary={`Complete ${cert} certification`}
                                  />
                                </ListItem>
                              ))
                            ) : (
                              <ListItem disablePadding>
                                <ListItemText 
                                  primary="On-the-job training recommended"
                                />
                              </ListItem>
                            )}
                            <ListItem disablePadding>
                              <ListItemText 
                                primary="Shadowing opportunities"
                                secondary="Learn from experienced colleagues"
                              />
                            </ListItem>
                          </List>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Development Timeline
              </Typography>
              <TextField
                label="Development Notes"
                multiline
                rows={4}
                fullWidth
                placeholder="Enter development plan notes, timeline, and recommendations..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="contained" color="primary">
              Save Development Plan
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default TrainingNeeds; 