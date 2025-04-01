// src/features/focusFactorySlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentFactory: 'ADD',
  factories: ['ADD', 'BBV', 'SYN']
};

export const focusFactorySlice = createSlice({
  name: 'focusFactory',
  initialState,
  reducers: {
    setCurrentFactory: (state, action) => {
      state.currentFactory = action.payload;
    }
  }
});

export const { setCurrentFactory } = focusFactorySlice.actions;

export const selectCurrentFactory = (state) => state.focusFactory.currentFactory;
export const selectFactories = (state) => state.focusFactory.factories;

export default focusFactorySlice.reducer;

// src/features/phaseSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPhase: 'current',
  phases: ['current', 'future']
};

export const phaseSlice = createSlice({
  name: 'phase',
  initialState,
  reducers: {
    setCurrentPhase: (state, action) => {
      state.currentPhase = action.payload;
    },
    copyPhase: (state, action) => {
      // This will be implemented in orgChartSlice to copy data from one phase to another
      return state;
    }
  }
});

export const { setCurrentPhase, copyPhase } = phaseSlice.actions;

export const selectCurrentPhase = (state) => state.phase.currentPhase;
export const selectPhases = (state) => state.phase.phases;

export default phaseSlice.reducer;

// src/features/roleSlice.js
import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  roles: {
    ADD: [],
    BBV: [],
    SYN: []
  }
};

export const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    addRole: (state, action) => {
      const { factory, role } = action.payload;
      role.id = nanoid();
      state.roles[factory].push(role);
    },
    updateRole: (state, action) => {
      const { factory, role } = action.payload;
      const index = state.roles[factory].findIndex(r => r.id === role.id);
      if (index !== -1) {
        state.roles[factory][index] = role;
      }
    },
    deleteRole: (state, action) => {
      const { factory, roleId } = action.payload;
      state.roles[factory] = state.roles[factory].filter(role => role.id !== roleId);
    }
  }
});

export const { addRole, updateRole, deleteRole } = roleSlice.actions;

export const selectRolesByFactory = (state, factory) => state.roles.roles[factory];

export default roleSlice.reducer;

// src/features/personnelSlice.js
import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  personnel: {
    ADD: [],
    BBV: [],
    SYN: []
  }
};

export const personnelSlice = createSlice({
  name: 'personnel',
  initialState,
  reducers: {
    addPersonnel: (state, action) => {
      const { factory, person } = action.payload;
      person.id = nanoid();
      state.personnel[factory].push(person);
    },
    updatePersonnel: (state, action) => {
      const { factory, person } = action.payload;
      const index = state.personnel[factory].findIndex(p => p.id === person.id);
      if (index !== -1) {
        state.personnel[factory][index] = person;
      }
    },
    deletePersonnel: (state, action) => {
      const { factory, personId } = action.payload;
      state.personnel[factory] = state.personnel[factory].filter(person => person.id !== personId);
    }
  }
});

export const { addPersonnel, updatePersonnel, deletePersonnel } = personnelSlice.actions;

export const selectPersonnelByFactory = (state, factory) => state.personnel.personnel[factory];

export default personnelSlice.reducer;

// src/features/orgChartSlice.js
import { createSlice, nanoid } from '@reduxjs/toolkit';

const createEmptyOrgChart = () => ({
  nodes: [],
  connections: []
});

const initialState = {
  orgCharts: {
    current: {
      ADD: createEmptyOrgChart(),
      BBV: createEmptyOrgChart(),
      SYN: createEmptyOrgChart()
    },
    future: {
      ADD: createEmptyOrgChart(),
      BBV: createEmptyOrgChart(),
      SYN: createEmptyOrgChart()
    }
  }
};

export const orgChartSlice = createSlice({
  name: 'orgChart',
  initialState,
  reducers: {
    addNode: (state, action) => {
      const { phase, factory, node } = action.payload;
      node.id = nanoid();
      state.orgCharts[phase][factory].nodes.push(node);
    },
    updateNode: (state, action) => {
      const { phase, factory, node } = action.payload;
      const index = state.orgCharts[phase][factory].nodes.findIndex(n => n.id === node.id);
      if (index !== -1) {
        state.orgCharts[phase][factory].nodes[index] = node;
      }
    },
    deleteNode: (state, action) => {
      const { phase, factory, nodeId } = action.payload;
      state.orgCharts[phase][factory].nodes = state.orgCharts[phase][factory].nodes.filter(node => node.id !== nodeId);
      // Also remove any connections that include this node
      state.orgCharts[phase][factory].connections = state.orgCharts[phase][factory].connections.filter(
        conn => conn.sourceId !== nodeId && conn.targetId !== nodeId
      );
    },
    addConnection: (state, action) => {
      const { phase, factory, connection } = action.payload;
      connection.id = nanoid();
      state.orgCharts[phase][factory].connections.push(connection);
    },
    updateConnection: (state, action) => {
      const { phase, factory, connection } = action.payload;
      const index = state.orgCharts[phase][factory].connections.findIndex(c => c.id === connection.id);
      if (index !== -1) {
        state.orgCharts[phase][factory].connections[index] = connection;
      }
    },
    deleteConnection: (state, action) => {
      const { phase, factory, connectionId } = action.payload;
      state.orgCharts[phase][factory].connections = state.orgCharts[phase][factory].connections.filter(
        conn => conn.id !== connectionId
      );
    },
    copyOrgChart: (state, action) => {
      const { sourcePhase, targetPhase, factory } = action.payload;
      state.orgCharts[targetPhase][factory] = JSON.parse(JSON.stringify(state.orgCharts[sourcePhase][factory]));
    }
  }
});

export const {
  addNode,
  updateNode,
  deleteNode,
  addConnection,
  updateConnection,
  deleteConnection,
  copyOrgChart
} = orgChartSlice.actions;

export const selectOrgChart = (state, phase, factory) => state.orgChart.orgCharts[phase][factory];

export default orgChartSlice.reducer;

// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import focusFactoryReducer from '../features/focusFactorySlice';
import phaseReducer from '../features/phaseSlice';
import roleReducer from '../features/roleSlice';
import personnelReducer from '../features/personnelSlice';
import orgChartReducer from '../features/orgChartSlice';

export const store = configureStore({
  reducer: {
    focusFactory: focusFactoryReducer,
    phase: phaseReducer,
    roles: roleReducer,
    personnel: personnelReducer,
    orgChart: orgChartReducer
  }
});
