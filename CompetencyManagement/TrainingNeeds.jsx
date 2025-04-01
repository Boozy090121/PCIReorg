import React, { useState, useEffect, useMemo } from 'react';
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
  Card,
  CardContent,
  Grid
} from '@mui/material';

const TrainingNeeds = () => {
  const currentFactory = useSelector(state => state.focusFactory.currentFactory);
  const roles = useSelector(state => state.roles.roles[currentFactory] || []);
  const personnel = useSelector(state => state.personnel.personnel[currentFactory] || []);
  const competencies = useSelector(state => state.competencies.competencies[currentFactory] || []);

  // Calculate required competencies for each role
  const roleCompetencies = useMemo(() => {
    return roles.reduce((acc, role) => {
      acc[role.id] = role.requiredCompetencies || [];
      return acc;
    }, {});
  }, [roles]);

  // Calculate existing competencies for each person
  const personnelCompetencies = useMemo(() => {
    return personnel.reduce((acc, person) => {
      acc[person.id] = person.competencies || [];
      return acc;
    }, {});
  }, [personnel]);

  // Calculate competency gaps for each person in their role
  const competencyGaps = useMemo(() => {
    return personnel.reduce((acc, person) => {
      const roleId = person.roleId;
      if (!roleId) return acc;

      const requiredCompetencies = roleCompetencies[roleId] || [];
      const existingCompetencies = personnelCompetencies[person.id] || [];

      const gaps = requiredCompetencies.filter(required => 
        !existingCompetencies.some(existing => 
          existing.id === required.id && existing.level >= required.level
        )
      );

      if (gaps.length > 0) {
        acc[person.id] = gaps;
      }

      return acc;
    }, {});
  }, [personnel, roleCompetencies, personnelCompetencies]);

  // Calculate training priorities based on gaps and role criticality
  const trainingPriorities = useMemo(() => {
    return Object.entries(competencyGaps).map(([personId, gaps]) => {
      const person = personnel.find(p => p.id === personId);
      const role = roles.find(r => r.id === person?.roleId);
      
      const priority = role?.criticality || 1;
      const gapSeverity = gaps.reduce((sum, gap) => {
        const required = roleCompetencies[role?.id]?.find(rc => rc.id === gap.id);
        const existing = personnelCompetencies[personId]?.find(pc => pc.id === gap.id);
        return sum + ((required?.level || 0) - (existing?.level || 0));
      }, 0);

      return {
        personId,
        person,
        role,
        gaps,
        priority: priority * gapSeverity
      };
    }).sort((a, b) => b.priority - a.priority);
  }, [competencyGaps, personnel, roles, roleCompetencies, personnelCompetencies]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Training Needs Analysis
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Typography>
                Total Personnel with Gaps: {Object.keys(competencyGaps).length}
              </Typography>
              <Typography>
                Total Training Priorities: {trainingPriorities.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Competency Gaps</TableCell>
                  <TableCell>Priority</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trainingPriorities.map(({ person, role, gaps, priority }) => (
                  <TableRow key={person.id}>
                    <TableCell>{person.name}</TableCell>
                    <TableCell>{role?.name || 'No Role'}</TableCell>
                    <TableCell>
                      {gaps.map(gap => {
                        const competency = competencies.find(c => c.id === gap.id);
                        return (
                          <Chip
                            key={gap.id}
                            label={competency?.name || 'Unknown'}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        );
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={priority.toFixed(1)}
                        color={priority > 5 ? 'error' : priority > 3 ? 'warning' : 'info'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrainingNeeds; 