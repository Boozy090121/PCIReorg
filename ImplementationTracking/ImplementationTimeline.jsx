import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Chip
} from '@mui/material';
import {
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { selectCurrentFactory } from '../../features/focusFactorySlice';
import { selectImplementationsByFactory } from '../../features/implementationTrackingSlice';

const ImplementationTimeline = () => {
  const currentFactory = useSelector(selectCurrentFactory);
  const implementations = useSelector(state => 
    selectImplementationsByFactory(state, currentFactory)
  );
  
  // Combine all milestones from all implementations and sort by due date
  const allMilestones = implementations.reduce((acc, implementation) => {
    const implementationMilestones = (implementation.milestones || []).map(milestone => ({
      ...milestone,
      implementationTitle: implementation.title,
      implementationId: implementation.id
    }));
    return [...acc, ...implementationMilestones];
  }, []).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'primary';
      case 'At Risk':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'grey';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon />;
      case 'At Risk':
        return <ErrorIcon />;
      case 'In Progress':
        return <ScheduleIcon />;
      default:
        return <FlagIcon />;
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Implementation Timeline
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        {allMilestones.length > 0 ? (
          <Timeline position="alternate">
            {allMilestones.map((milestone) => (
              <TimelineItem key={milestone.id}>
                <TimelineOppositeContent color="text.secondary">
                  {new Date(milestone.dueDate).toLocaleDateString()}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={getStatusColor(milestone.status)}>
                    {getStatusIcon(milestone.status)}
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h6" component="h3">
                      {milestone.title}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Implementation: {milestone.implementationTitle}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                      {milestone.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={milestone.status}
                        color={getStatusColor(milestone.status)}
                        size="small"
                      />
                    </Box>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No milestones have been added yet.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ImplementationTimeline; 