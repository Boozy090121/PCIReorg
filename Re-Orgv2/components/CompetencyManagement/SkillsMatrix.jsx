import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Rating,
  Chip,
  Button,
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
  Tooltip,
  Grid,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { updatePersonnelCompetency } from '../../features/competencySlice';

const SkillsMatrix = () => {
  const dispatch = useDispatch();
  const competencies = useSelector(state => state.competency.competencies);
  const roleCompetencies = useSelector(state => state.competency.roleCompetencies);
  const personnelCompetencies = useSelector(state => state.competency.personnelCompetencies);
  const currentFactory = useSelector(state => state.focusFactory.currentFactory);
  const roles = useSelector(state => state.roles.roles[currentFactory]);
  const personnel = useSelector(state => state.personnel.personnel[currentFactory]);
  
  const [selectedRole, setSelectedRole] = useState('');
  const [rolePersonnel, setRolePersonnel] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPersonnel, setCurrentPersonnel] = useState(null);
  
  useEffect(() => {
    if (selectedRole) {
      const assignedPersonnel = personnel.filter(p => p.role === selectedRole);
      setRolePersonnel(assignedPersonnel);
    } else {
      setRolePersonnel([]);
    }
  }, [selectedRole, personnel]);
  
  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };
  
  const handleEditPersonnelCompetencies = (person) => {
    setCurrentPersonnel(person);
    setDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentPersonnel(null);
  };
  
  const handleCompetencyLevelChange = (competencyId, newLevel) => {
    const existingProfile = personnelCompetencies.find(pc => pc.personnelId === currentPersonnel.id);
    
    let updatedProfile;
    if (existingProfile) {
      const existingCompIndex = existingProfile.acquiredCompetencies.findIndex(
        ac => ac.competencyId === competencyId
      );
      
      const updatedCompetencies = [...existingProfile.acquiredCompetencies];
      
      if (existingCompIndex >= 0) {
        updatedCompetencies[existingCompIndex] = {
          ...updatedCompetencies[existingCompIndex],
          currentLevel: newLevel
        };
      } else {
        updatedCompetencies.push({
          competencyId,
          currentLevel: newLevel,
          verificationMethod: 'Self-Assessment',
          verificationDate: new Date().toISOString().slice(0, 10),
          notes: ''
        });
      }
      
      updatedProfile = {
        ...existingProfile,
        acquiredCompetencies: updatedCompetencies
      };
    } else {
      updatedProfile = {
        personnelId: currentPersonnel.id,
        acquiredCompetencies: [{
          competencyId,
          currentLevel: newLevel,
          verificationMethod: 'Self-Assessment',
          verificationDate: new Date().toISOString().slice(0, 10),
          notes: ''
        }],
        potentialCompetencies: [],
        developmentGoals: []
      };
    }
    
    dispatch(updatePersonnelCompetency(updatedProfile));
  };
  
  const getPersonnelCompetencyLevel = (personnelId, competencyId) => {
    const profile = personnelCompetencies.find(pc => pc.personnelId === personnelId);
    if (!profile) return 0;
    
    const competency = profile.acquiredCompetencies.find(ac => ac.competencyId === competencyId);
    return competency ? competency.currentLevel : 0;
  };
  
  const getPersonnelMatchScore = (personnelId, roleId) => {
    const profile = personnelCompetencies.find(pc => pc.personnelId === personnelId);
    if (!profile) return 0;
    
    const roleMapping = roleCompetencies.find(rc => rc.roleId === roleId);
    if (!roleMapping) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    roleMapping.requiredCompetencies.forEach(rc => {
      const weight = rc.weight;
      totalWeight += weight;
      
      const personnelCompetency = profile.acquiredCompetencies.find(
        ac => ac.competencyId === rc.competencyId
      );
      
      if (personnelCompetency) {
        const level = personnelCompetency.currentLevel;
        const requiredLevel = rc.minimumLevel;
        
        if (level >= requiredLevel) {
          totalScore += weight;
        } else if (level > 0) {
          totalScore += (level / requiredLevel) * weight;
        }
      }
    });
    
    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
  };
  
  const getCompetencyGaps = (personnelId, roleId) => {
    const profile = personnelCompetencies.find(pc => pc.personnelId === personnelId);
    const roleMapping = roleCompetencies.find(rc => rc.roleId === roleId);
    
    if (!profile || !roleMapping) return [];
    
    const gaps = [];
    
    roleMapping.requiredCompetencies
      .sort((a, b) => (b.isEssential ? 1 : 0) - (a.isEssential ? 1 : 0))
      .forEach(rc => {
        const requiredLevel = rc.minimumLevel;
        const isEssential = rc.isEssential;
        
        const personnelCompetency = profile.acquiredCompetencies.find(
          ac => ac.competencyId === rc.competencyId
        );
        
        const actualLevel = personnelCompetency ? personnelCompetency.currentLevel : 0;
        
        if (actualLevel < requiredLevel) {
          const competency = competencies.find(c => c.id === rc.competencyId);
          gaps.push({
            competencyId: rc.competencyId,
            name: competency ? competency.name : 'Unknown',
            currentLevel: actualLevel,
            requiredLevel,
            gap: requiredLevel - actualLevel,
            isEssential
          });
        }
      });
    
    return gaps;
  };
  
  const findRoleById = (roleId) => {
    return roles.find(r => r.id === roleId);
  };
  
  const renderMatchStatus = (score) => {
    if (score >= 85) {
      return (
        <Tooltip title="Excellent Match">
          <Chip 
            icon={<span className="material-icons">check_circle</span>} 
            label={`${score}%`} 
            color="success" 
            size="small" 
          />
        </Tooltip>
      );
    } else if (score >= 70) {
      return (
        <Tooltip title="Good Match">
          <Chip 
            label={`${score}%`} 
            color="primary" 
            size="small" 
          />
        </Tooltip>
      );
    } else if (score >= 50) {
      return (
        <Tooltip title="Partial Match">
          <Chip 
            icon={<span className="material-icons">warning</span>} 
            label={`${score}%`} 
            color="warning" 
            size="small" 
          />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title="Poor Match">
          <Chip 
            icon={<span className="material-icons">error</span>} 
            label={`${score}%`} 
            color="error" 
            size="small" 
          />
        </Tooltip>
      );
    }
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Personnel Skills Matrix
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="role-select-label">Select Role to Analyze</InputLabel>
          <Select
            labelId="role-select-label"
            value={selectedRole}
            label="Select Role to Analyze"
            onChange={handleRoleChange}
          >
            <MenuItem value="">
              <em>All Roles</em>
            </MenuItem>
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      {selectedRole ? (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Required Competencies for: {findRoleById(selectedRole)?.title}
          </Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Competency</TableCell>
                  <TableCell>Required Level</TableCell>
                  <TableCell>Essential</TableCell>
                  <TableCell>Weight</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roleCompetencies
                  .find(rc => rc.roleId === selectedRole)?.requiredCompetencies
                  .map(rc => {
                    const comp = competencies.find(c => c.id === rc.competencyId);
                    return (
                      <TableRow key={rc.competencyId}>
                        <TableCell>
                          <Typography variant="body2">{comp?.name || 'Unknown'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {comp?.category}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Rating value={rc.minimumLevel} readOnly size="small" />
                        </TableCell>
                        <TableCell>
                          {rc.isEssential ? (
                            <Chip 
                              label="Essential" 
                              color="error" 
                              size="small" 
                              variant="outlined" 
                            />
                          ) : (
                            <Chip 
                              label="Desired" 
                              color="info" 
                              size="small" 
                              variant="outlined" 
                            />
                          )}
                        </TableCell>
                        <TableCell>{rc.weight}</TableCell>
                      </TableRow>
                    );
                  }) || (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          No competencies defined for this role.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                }
              </TableBody>
            </Table>
          </TableContainer>
          
          <Typography variant="subtitle1" gutterBottom>
            Personnel Assigned to this Role ({rolePersonnel.length})
          </Typography>
          
          <Grid container spacing={2}>
            {rolePersonnel.map(person => {
              const matchScore = getPersonnelMatchScore(person.id, selectedRole);
              const competencyGaps = getCompetencyGaps(person.id, selectedRole);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={person.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {person.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Match Score:
                        </Typography>
                        {renderMatchStatus(matchScore)}
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={matchScore} 
                          color={
                            matchScore >= 85 ? 'success' :
                            matchScore >= 70 ? 'primary' :
                            matchScore >= 50 ? 'warning' : 'error'
                          }
                        />
                      </Box>
                      
                      {competencyGaps.length > 0 && (
                        <>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                            Competency Gaps:
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            {competencyGaps.slice(0, 3).map(gap => (
                              <Box 
                                key={gap.competencyId} 
                                sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  mb: 0.5
                                }}
                              >
                                <Typography variant="caption" sx={{ flex: 1 }}>
                                  {gap.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Level {gap.currentLevel}/{gap.requiredLevel}
                                </Typography>
                              </Box>
                            ))}
                            {competencyGaps.length > 3 && (
                              <Typography variant="caption" color="text.secondary">
                                +{competencyGaps.length - 3} more gaps
                              </Typography>
                            )}
                          </Box>
                        </>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<span className="material-icons">edit</span>}
                        onClick={() => handleEditPersonnelCompetencies(person)}
                      >
                        Edit Skills
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<span className="material-icons">assignment_ind</span>}
                        disabled
                      >
                        Development Plan
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
            {rolePersonnel.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No personnel are currently assigned to this role.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
            <span className="material-icons" style={{ fontSize: 60, color: 'text.secondary', marginBottom: 16 }}>
              assignment
            </span>
            <Typography variant="h6" gutterBottom>
              Select a Role to Analyze
            </Typography>
            <Typography color="text.secondary">
              Choose a role from the dropdown above to see required competencies
              and analyze personnel skill matches.
            </Typography>
          </Paper>
        </Box>
      )}
      
      {/* Personnel Competency Edit Dialog */}
      {currentPersonnel && (
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Edit Skills for {currentPersonnel.name}
          </DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Current Role: {findRoleById(currentPersonnel.role)?.title || 'None'}
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Competency</TableCell>
                    <TableCell>Required Level</TableCell>
                    <TableCell>Current Level</TableCell>
                    <TableCell>Gap</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roleCompetencies
                    .find(rc => rc.roleId === currentPersonnel.role)
                    ?.requiredCompetencies.map(rc => {
                      const comp = competencies.find(c => c.id === rc.competencyId);
                      const currentLevel = getPersonnelCompetencyLevel(
                        currentPersonnel.id, 
                        rc.competencyId
                      );
                      const gap = Math.max(0, rc.minimumLevel - currentLevel);
                      
                      return (
                        <TableRow key={rc.competencyId}>
                          <TableCell>
                            <Typography variant="body2">{comp?.name || 'Unknown'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {comp?.category}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Rating value={rc.minimumLevel} readOnly size="small" />
                          </TableCell>
                          <TableCell>
                            <Rating 
                              value={currentLevel} 
                              onChange={(_, newValue) => {
                                handleCompetencyLevelChange(rc.competencyId, newValue);
                              }}
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            {gap > 0 ? (
                              <Chip 
                                label={`Gap: ${gap}`} 
                                color={rc.isEssential ? "error" : "warning"} 
                                size="small" 
                              />
                            ) : (
                              <Chip 
                                label="Met" 
                                color="success" 
                                size="small" 
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    }) || (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            No competencies defined for this person's role.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default SkillsMatrix; 