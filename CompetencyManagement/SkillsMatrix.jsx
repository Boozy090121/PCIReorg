import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Rating
} from '@mui/material';

const SkillsMatrix = () => {
  const currentFactory = useSelector(state => state.focusFactory.currentFactory);
  const roles = useSelector(state => state.roles.roles[currentFactory] || []);
  const personnel = useSelector(state => state.personnel.personnel[currentFactory] || []);
  const competencies = useSelector(state => state.competencies.competencies[currentFactory] || []);

  // Create lookup maps for faster access
  const competencyMap = useMemo(() => {
    return competencies.reduce((acc, comp) => {
      acc[comp.id] = comp;
      return acc;
    }, {});
  }, [competencies]);

  const roleMap = useMemo(() => {
    return roles.reduce((acc, role) => {
      acc[role.id] = role;
      return acc;
    }, {});
  }, [roles]);

  // Pre-calculate required competencies for each role
  const roleCompetencyRequirements = useMemo(() => {
    return roles.reduce((acc, role) => {
      acc[role.id] = (role.requiredCompetencies || []).reduce((reqMap, req) => {
        reqMap[req.id] = req.level;
        return reqMap;
      }, {});
      return acc;
    }, {});
  }, [roles]);

  // Calculate matrix data with optimized lookups
  const matrixData = useMemo(() => {
    return personnel.map(person => {
      const role = roleMap[person.roleId];
      const requiredCompetencies = roleCompetencyRequirements[person.roleId] || {};
      
      // Create a map of person's competencies for faster lookup
      const personCompetencyMap = (person.competencies || []).reduce((acc, comp) => {
        acc[comp.id] = comp.level;
        return acc;
      }, {});

      // Calculate gaps efficiently using maps
      const gaps = Object.entries(requiredCompetencies).reduce((acc, [compId, requiredLevel]) => {
        const currentLevel = personCompetencyMap[compId] || 0;
        if (currentLevel < requiredLevel) {
          acc[compId] = {
            required: requiredLevel,
            current: currentLevel,
            gap: requiredLevel - currentLevel
          };
        }
        return acc;
      }, {});

      return {
        person,
        role,
        competencyLevels: personCompetencyMap,
        gaps
      };
    });
  }, [personnel, roleMap, roleCompetencyRequirements]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Skills Matrix
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Role</TableCell>
              {competencies.map(comp => (
                <TableCell key={comp.id} align="center">
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {comp.name}
                  </Typography>
                </TableCell>
              ))}
              <TableCell>Gaps</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matrixData.map(({ person, role, competencyLevels, gaps }) => (
              <TableRow key={person.id}>
                <TableCell>{person.name}</TableCell>
                <TableCell>{role?.name || 'No Role'}</TableCell>
                {competencies.map(comp => {
                  const level = competencyLevels[comp.id] || 0;
                  const required = role ? (roleCompetencyRequirements[role.id]?.[comp.id] || 0) : 0;
                  const hasGap = level < required;

                  return (
                    <TableCell key={comp.id} align="center">
                      <Rating
                        value={level}
                        max={5}
                        readOnly
                        size="small"
                        sx={{
                          '& .MuiRating-icon': {
                            color: hasGap ? 'error.main' : 'success.main'
                          }
                        }}
                      />
                    </TableCell>
                  );
                })}
                <TableCell>
                  {Object.entries(gaps).map(([compId, { gap }]) => (
                    <Chip
                      key={compId}
                      label={`${competencyMap[compId]?.name}: ${gap}`}
                      color="error"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SkillsMatrix; 