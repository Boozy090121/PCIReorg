// Factory templates for organization structures
export const factoryTemplates = {
  ADD: {
    current: {
      nodes: [
        { id: 'add-ceo', title: 'Chief Executive Officer', x: 400, y: 50, roles: [], personnel: [] },
        { id: 'add-cqo', title: 'Chief Quality Officer', x: 400, y: 150, roles: [], personnel: [] },
        { id: 'add-qad', title: 'Quality Assurance Director', x: 250, y: 250, roles: [], personnel: [] },
        { id: 'add-qcd', title: 'Quality Control Director', x: 550, y: 250, roles: [], personnel: [] },
        { id: 'add-qam', title: 'QA Manager', x: 150, y: 350, roles: [], personnel: [] },
        { id: 'add-qcm', title: 'QC Manager', x: 650, y: 350, roles: [], personnel: [] }
      ],
      connections: [
        { id: 'add-conn-1', sourceId: 'add-ceo', targetId: 'add-cqo' },
        { id: 'add-conn-2', sourceId: 'add-cqo', targetId: 'add-qad' },
        { id: 'add-conn-3', sourceId: 'add-cqo', targetId: 'add-qcd' },
        { id: 'add-conn-4', sourceId: 'add-qad', targetId: 'add-qam' },
        { id: 'add-conn-5', sourceId: 'add-qcd', targetId: 'add-qcm' }
      ]
    },
    future: {
      nodes: [],
      connections: []
    }
  },
  BBV: {
    current: {
      nodes: [
        { id: 'bbv-ceo', title: 'Chief Executive Officer', x: 400, y: 50, roles: [], personnel: [] },
        { id: 'bbv-cqo', title: 'Chief Quality Officer', x: 400, y: 150, roles: [], personnel: [] },
        { id: 'bbv-qad', title: 'Quality Assurance Director', x: 250, y: 250, roles: [], personnel: [] },
        { id: 'bbv-qcd', title: 'Quality Control Director', x: 550, y: 250, roles: [], personnel: [] },
        { id: 'bbv-qam', title: 'QA Manager', x: 150, y: 350, roles: [], personnel: [] },
        { id: 'bbv-qcm', title: 'QC Manager', x: 650, y: 350, roles: [], personnel: [] }
      ],
      connections: [
        { id: 'bbv-conn-1', sourceId: 'bbv-ceo', targetId: 'bbv-cqo' },
        { id: 'bbv-conn-2', sourceId: 'bbv-cqo', targetId: 'bbv-qad' },
        { id: 'bbv-conn-3', sourceId: 'bbv-cqo', targetId: 'bbv-qcd' },
        { id: 'bbv-conn-4', sourceId: 'bbv-qad', targetId: 'bbv-qam' },
        { id: 'bbv-conn-5', sourceId: 'bbv-qcd', targetId: 'bbv-qcm' }
      ]
    },
    future: {
      nodes: [],
      connections: []
    }
  },
  SYN: {
    current: {
      nodes: [
        { id: 'syn-ceo', title: 'Chief Executive Officer', x: 400, y: 50, roles: [], personnel: [] },
        { id: 'syn-cqo', title: 'Chief Quality Officer', x: 400, y: 150, roles: [], personnel: [] },
        { id: 'syn-qad', title: 'Quality Assurance Director', x: 250, y: 250, roles: [], personnel: [] },
        { id: 'syn-qcd', title: 'Quality Control Director', x: 550, y: 250, roles: [], personnel: [] },
        { id: 'syn-qam', title: 'QA Manager', x: 150, y: 350, roles: [], personnel: [] },
        { id: 'syn-qcm', title: 'QC Manager', x: 650, y: 350, roles: [], personnel: [] }
      ],
      connections: [
        { id: 'syn-conn-1', sourceId: 'syn-ceo', targetId: 'syn-cqo' },
        { id: 'syn-conn-2', sourceId: 'syn-cqo', targetId: 'syn-qad' },
        { id: 'syn-conn-3', sourceId: 'syn-cqo', targetId: 'syn-qcd' },
        { id: 'syn-conn-4', sourceId: 'syn-qad', targetId: 'syn-qam' },
        { id: 'syn-conn-5', sourceId: 'syn-qcd', targetId: 'syn-qcm' }
      ]
    },
    future: {
      nodes: [],
      connections: []
    }
  }
};

export default factoryTemplates;
