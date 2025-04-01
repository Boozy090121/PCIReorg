import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  implementations: {},
  loading: false,
  error: null
};

const implementationTrackingSlice = createSlice({
  name: 'implementationTracking',
  initialState,
  reducers: {
    setImplementations: (state, action) => {
      const { factory, implementations } = action.payload;
      state.implementations[factory] = implementations;
    },
    addImplementation: (state, action) => {
      const { factory, implementation } = action.payload;
      if (!state.implementations[factory]) {
        state.implementations[factory] = [];
      }
      state.implementations[factory].push(implementation);
    },
    updateImplementation: (state, action) => {
      const { factory, implementationId, updates } = action.payload;
      const implementation = state.implementations[factory]?.find(
        imp => imp.id === implementationId
      );
      if (implementation) {
        Object.assign(implementation, updates);
      }
    },
    updateImplementationProgress: (state, action) => {
      const { factory, implementationId, progress } = action.payload;
      const implementation = state.implementations[factory]?.find(
        imp => imp.id === implementationId
      );
      if (implementation) {
        implementation.progress = progress;
        // Update status based on progress
        if (progress === 100) {
          implementation.status = 'Completed';
        } else if (progress > 0) {
          implementation.status = 'In Progress';
        }
      }
    },
    deleteImplementation: (state, action) => {
      const { factory, implementationId } = action.payload;
      if (state.implementations[factory]) {
        state.implementations[factory] = state.implementations[factory].filter(
          imp => imp.id !== implementationId
        );
      }
    },
    addMilestone: (state, action) => {
      const { factory, implementationId, milestone } = action.payload;
      const implementation = state.implementations[factory]?.find(
        imp => imp.id === implementationId
      );
      if (implementation) {
        if (!implementation.milestones) {
          implementation.milestones = [];
        }
        implementation.milestones.push(milestone);
      }
    },
    updateMilestone: (state, action) => {
      const { factory, implementationId, milestoneId, updates } = action.payload;
      const implementation = state.implementations[factory]?.find(
        imp => imp.id === implementationId
      );
      if (implementation) {
        const milestone = implementation.milestones?.find(m => m.id === milestoneId);
        if (milestone) {
          Object.assign(milestone, updates);
        }
      }
    },
    deleteMilestone: (state, action) => {
      const { factory, implementationId, milestoneId } = action.payload;
      const implementation = state.implementations[factory]?.find(
        imp => imp.id === implementationId
      );
      if (implementation && implementation.milestones) {
        implementation.milestones = implementation.milestones.filter(
          m => m.id !== milestoneId
        );
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

// Export actions
export const {
  setImplementations,
  addImplementation,
  updateImplementation,
  updateImplementationProgress,
  deleteImplementation,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  setLoading,
  setError
} = implementationTrackingSlice.actions;

// Selectors
export const selectImplementationsByFactory = (state, factory) =>
  state.implementationTracking.implementations[factory] || [];

export const selectImplementationById = (state, factory, implementationId) =>
  state.implementationTracking.implementations[factory]?.find(
    imp => imp.id === implementationId
  );

export const selectImplementationProgress = (state, factory) => {
  const implementations = state.implementationTracking.implementations[factory] || [];
  if (implementations.length === 0) return 0;
  
  const totalProgress = implementations.reduce(
    (sum, imp) => sum + (imp.progress || 0),
    0
  );
  return Math.round(totalProgress / implementations.length);
};

export default implementationTrackingSlice.reducer; 