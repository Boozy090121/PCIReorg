import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  transitions: {},
  loading: false,
  error: null
};

const transitionPlanSlice = createSlice({
  name: 'transitionPlan',
  initialState,
  reducers: {
    setTransitions: (state, action) => {
      const { factory, transitions } = action.payload;
      state.transitions[factory] = transitions;
    },
    addTransition: (state, action) => {
      const { factory, transition } = action.payload;
      if (!state.transitions[factory]) {
        state.transitions[factory] = [];
      }
      state.transitions[factory].push(transition);
    },
    updateTransition: (state, action) => {
      const { factory, transition } = action.payload;
      const index = state.transitions[factory].findIndex(t => t.id === transition.id);
      if (index !== -1) {
        state.transitions[factory][index] = transition;
      }
    },
    deleteTransition: (state, action) => {
      const { factory, transitionId } = action.payload;
      state.transitions[factory] = state.transitions[factory].filter(t => t.id !== transitionId);
    },
    updateTransitionProgress: (state, action) => {
      const { factory, transitionId, progress } = action.payload;
      const transition = state.transitions[factory].find(t => t.id === transitionId);
      if (transition) {
        transition.progress = progress;
        // Update status based on progress
        if (progress === 100) {
          transition.status = 'Completed';
        } else if (progress > 0) {
          transition.status = 'In Progress';
        }
      }
    },
    updateTransitionStatus: (state, action) => {
      const { factory, transitionId, status } = action.payload;
      const transition = state.transitions[factory].find(t => t.id === transitionId);
      if (transition) {
        transition.status = status;
      }
    },
    addTransitionRisk: (state, action) => {
      const { factory, transitionId, risk } = action.payload;
      const transition = state.transitions[factory].find(t => t.id === transitionId);
      if (transition) {
        if (!transition.risks) {
          transition.risks = [];
        }
        transition.risks.push(risk);
      }
    },
    removeTransitionRisk: (state, action) => {
      const { factory, transitionId, riskIndex } = action.payload;
      const transition = state.transitions[factory].find(t => t.id === transitionId);
      if (transition && transition.risks) {
        transition.risks.splice(riskIndex, 1);
      }
    },
    addTransitionDependency: (state, action) => {
      const { factory, transitionId, dependency } = action.payload;
      const transition = state.transitions[factory].find(t => t.id === transitionId);
      if (transition) {
        if (!transition.dependencies) {
          transition.dependencies = [];
        }
        transition.dependencies.push(dependency);
      }
    },
    removeTransitionDependency: (state, action) => {
      const { factory, transitionId, dependencyIndex } = action.payload;
      const transition = state.transitions[factory].find(t => t.id === transitionId);
      if (transition && transition.dependencies) {
        transition.dependencies.splice(dependencyIndex, 1);
      }
    },
    addRequiredTraining: (state, action) => {
      const { factory, transitionId, training } = action.payload;
      const transition = state.transitions[factory].find(t => t.id === transitionId);
      if (transition) {
        if (!transition.trainingRequired) {
          transition.trainingRequired = [];
        }
        transition.trainingRequired.push(training);
      }
    },
    removeRequiredTraining: (state, action) => {
      const { factory, transitionId, trainingIndex } = action.payload;
      const transition = state.transitions[factory].find(t => t.id === transitionId);
      if (transition && transition.trainingRequired) {
        transition.trainingRequired.splice(trainingIndex, 1);
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
  setTransitions,
  addTransition,
  updateTransition,
  deleteTransition,
  updateTransitionProgress,
  updateTransitionStatus,
  addTransitionRisk,
  removeTransitionRisk,
  addTransitionDependency,
  removeTransitionDependency,
  addRequiredTraining,
  removeRequiredTraining,
  setLoading,
  setError
} = transitionPlanSlice.actions;

// Selectors
export const selectTransitionsByFactory = (state, factory) => 
  state.transitionPlan.transitions[factory] || [];

export const selectTransitionById = (state, factory, transitionId) => 
  state.transitionPlan.transitions[factory]?.find(t => t.id === transitionId);

export const selectTransitionsByStatus = (state, factory, status) =>
  state.transitionPlan.transitions[factory]?.filter(t => t.status.toLowerCase() === status.toLowerCase()) || [];

export const selectTransitionsByPriority = (state, factory, priority) =>
  state.transitionPlan.transitions[factory]?.filter(t => t.priority.toLowerCase() === priority.toLowerCase()) || [];

export const selectTransitionsByPersonnel = (state, factory, personnelId) =>
  state.transitionPlan.transitions[factory]?.filter(t => t.personnelId === personnelId) || [];

export const selectTransitionStats = (state, factory) => {
  const transitions = state.transitionPlan.transitions[factory] || [];
  const total = transitions.length;
  const completed = transitions.filter(t => t.status.toLowerCase() === 'completed').length;
  const inProgress = transitions.filter(t => t.status.toLowerCase() === 'in progress').length;
  const atRisk = transitions.filter(t => t.status.toLowerCase() === 'at risk').length;
  
  return {
    total,
    completed,
    inProgress,
    atRisk,
    completionRate: total ? Math.round((completed / total) * 100) : 0
  };
};

export default transitionPlanSlice.reducer; 