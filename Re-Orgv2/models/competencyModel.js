/**
 * Data models for the enhanced quality reorganization application
 * These models extend the existing data structures to support advanced features
 */

// Competency definition model
export const CompetencyModel = {
  // Core competency definition schema
  competencySchema: {
    id: '', // Unique identifier
    name: '', // Competency name
    description: '', // Detailed description
    category: '', // Technical, Leadership, Regulatory, etc.
    level: 1, // Proficiency level (1-5)
    requiredCertifications: [], // List of certifications
    evaluationCriteria: [], // How to evaluate this competency
    regulatoryReference: '', // Any standards or regulations this competency relates to
    keywords: [], // Search terms for finding this competency
  },
  
  // Mapping between roles and required competencies
  roleCompetencyMapping: {
    roleId: '', // Reference to a role
    requiredCompetencies: [
      {
        competencyId: '', // Reference to a competency
        minimumLevel: 1, // Minimum required level (1-5)
        isEssential: true, // Is this competency essential or nice-to-have
        weight: 10, // Importance of this competency in matching (1-10)
      }
    ],
    totalWeight: 0, // Sum of all weights
  },
  
  // Personnel competency profile
  personnelCompetencyProfile: {
    personnelId: '', // Reference to personnel
    acquiredCompetencies: [
      {
        competencyId: '', // Reference to a competency
        currentLevel: 1, // Current proficiency level (1-5)
        verificationMethod: '', // How this competency was verified
        verificationDate: '', // When this competency was verified
        expiryDate: '', // When verification expires (if applicable)
        attachments: [], // Certificates or other verification documents
        notes: '', // Additional notes
      }
    ],
    potentialCompetencies: [], // Competencies the person could develop
    developmentGoals: [], // Target competencies and levels for development
  }
};

// Quality Process Model
export const ProcessModel = {
  // Core process definition
  processSchema: {
    id: '', // Unique identifier
    name: '', // Process name
    description: '', // Detailed description
    category: '', // Type of process (e.g., QA, QC, Validation)
    regulatoryImpact: [], // Regulations impacted by this process
    keyPerformanceIndicators: [], // KPIs for this process
    standardOperatingProcedures: [], // SOPs related to this process
    requiredResources: {
      personnel: [], // Roles involved in this process
      equipment: [], // Equipment needed
      systems: [], // Systems needed
    },
    averageWorkload: {
      frequency: '', // How often the process occurs
      duration: 0, // Time required per occurrence
      effort: 0, // Person-hours required
    }
  },
  
  // Process ownership mapping
  processOwnership: {
    processId: '', // Reference to a process
    primaryOwner: '', // Role ID of primary owner
    secondaryOwners: [], // Role IDs of backup owners
    responsibleDepartment: '', // Department owning this process
    stakeholders: [], // Other roles with interest in this process
    changeHistory: [], // History of ownership changes
  }
};

// Gap Analysis Model
export const GapAnalysisModel = {
  // Organizational structure gap analysis
  structureGap: {
    roleId: '', // Reference to a role
    status: '', // 'Existing', 'New', 'Modified', 'Removed'
    currentState: {}, // Current role definition
    futureState: {}, // Future role definition
    impact: '', // High, Medium, Low
    gapReason: '', // Reason for the gap
    mitigationPlan: '', // How to address this gap
  },
  
  // Competency gap analysis
  competencyGap: {
    competencyId: '', // Reference to a competency
    status: '', // 'Sufficient', 'Deficit', 'Surplus'
    requiredCount: 0, // How many people with this competency are needed
    availableCount: 0, // How many people have this competency now
    deficit: 0, // Numerical gap
    recruitmentNeeded: false, // Whether recruitment is needed
    trainingNeeded: false, // Whether training is needed
    criticality: '', // Critical, Important, Nice-to-have
    mitigationPlan: '', // How to address this gap
  },
  
  // Personnel gap analysis
  personnelGap: {
    personnelId: '', // Reference to personnel
    proposedRoleId: '', // Role proposed for this person
    matchScore: 0, // 0-100 match score
    strengthAreas: [], // Competencies exceeding requirements
    gapAreas: [], // Competencies below requirements
    trainingNeeds: [], // Specific training needed
    timeToReadiness: '', // Estimated time until fully qualified
    developmentPlan: '', // Proposed development plan
  }
};

// Implementation Planning Model
export const ImplementationModel = {
  // Transition phase definition
  transitionPhase: {
    id: '', // Unique identifier
    name: '', // Phase name (e.g., "Phase 1 - Leadership Changes")
    description: '', // Detailed description
    startDate: '', // Planned start date
    endDate: '', // Planned end date
    predecessors: [], // Phases that must complete before this one
    keyMilestones: [], // Major milestones in this phase
    riskLevel: '', // Risk assessment for this phase
    contingencyPlan: '', // Backup plan if issues arise
  },
  
  // Transition tasks
  transitionTask: {
    id: '', // Unique identifier
    phaseId: '', // Which phase this task belongs to
    name: '', // Task name
    description: '', // Detailed description
    assignee: '', // Who is responsible
    startDate: '', // Planned start date
    dueDate: '', // Planned completion date
    status: '', // Not Started, In Progress, Completed, Delayed
    progress: 0, // Percentage complete
    dependencies: [], // Tasks that must complete before this one
    relatedPersonnel: [], // Personnel affected by this task
    relatedRoles: [], // Roles affected by this task
    notes: '', // Additional information
  },
  
  // Communication plan
  communicationItem: {
    id: '', // Unique identifier
    phaseId: '', // Which phase this communication belongs to
    audience: [], // Who should receive this communication
    channel: '', // How it should be communicated
    timing: '', // When it should be communicated
    message: '', // Content of communication
    sender: '', // Who sends the communication
    confirmationRequired: false, // Whether confirmation is needed
    status: '', // Draft, Sent, Confirmed
    attachments: [], // Additional documents
  }
};

// Workload Analysis Model
export const WorkloadAnalysisModel = {
  // Resource requirements
  resourceRequirement: {
    roleId: '', // Reference to a role
    processAllocations: [
      {
        processId: '', // Reference to a process
        timeAllocation: 0, // Percentage of time allocated
        hoursPerWeek: 0, // Estimated hours per week
      }
    ],
    totalAllocation: 0, // Sum of all allocations (should be ≤100%)
    additionalCapacity: 0, // Spare capacity percentage
    overallocationRisk: '', // Risk assessment if overallocated
  },
  
  // Workload distribution
  workloadDistribution: {
    departmentId: '', // Reference to a department
    currentHeadcount: 0, // Current number of personnel
    futureHeadcount: 0, // Planned future headcount
    currentWorkload: 0, // Current workload in hours per week
    futureWorkload: 0, // Projected future workload
    utilizationCurrent: 0, // Current utilization percentage
    utilizationFuture: 0, // Projected future utilization
    bottlenecks: [], // Identified bottleneck roles or processes
    recommendations: [], // Recommendations for balancing
  }
};

// Performance Prediction Model
export const PerformanceModel = {
  // KPI definition
  keyPerformanceIndicator: {
    id: '', // Unique identifier
    name: '', // KPI name
    description: '', // Detailed description
    category: '', // Category of KPI
    unit: '', // Unit of measure
    target: 0, // Target value
    currentValue: 0, // Current value
    calculationMethod: '', // How it's calculated
    dataSource: '', // Where data comes from
    reportingFrequency: '', // How often it's reported
    responsibleRole: '', // Who is responsible for this KPI
  },
  
  // Performance impact prediction
  performanceImpact: {
    kpiId: '', // Reference to a KPI
    currentValue: 0, // Current performance
    predictedValue: 0, // Predicted future performance
    impactPercentage: 0, // Percentage change
    confidenceLevel: '', // Confidence in prediction
    affectingFactors: [], // Factors influencing this prediction
    mitigationSuggestions: [], // Ways to improve prediction
  },
  
  // Benchmark comparison
  benchmarkComparison: {
    kpiId: '', // Reference to a KPI
    industryAverage: 0, // Industry average value
    topPerformer: 0, // Top performer value
    currentRanking: '', // Current ranking (e.g., "Top quartile")
    predictedRanking: '', // Predicted future ranking
    dataSource: '', // Source of benchmark data
    comparisonNotes: '', // Additional context for comparison
  }
};

// Succession Planning Model
export const SuccessionModel = {
  // Career path definition
  careerPath: {
    id: '', // Unique identifier
    name: '', // Path name (e.g., "Quality Management Track")
    description: '', // Detailed description
    roles: [], // Ordered list of roles in this path
    typicalTimeline: '', // Typical progression timeline
    requiredTransitions: [], // Required moves between roles
    developmentMilestones: [], // Key milestones to achieve
  },
  
  // Succession candidate
  successionCandidate: {
    personnelId: '', // Reference to personnel
    targetRoleId: '', // Target role for succession
    readinessLevel: '', // Ready Now, Ready 1-2 Years, Development Needed
    readinessScore: 0, // 0-100 readiness score
    gapAreas: [], // Areas needing development
    developmentPlan: '', // Plan to prepare for the role
    mentorId: '', // Assigned mentor
    notes: '', // Additional notes
  },
  
  // Critical role plan
  criticalRolePlan: {
    roleId: '', // Reference to a critical role
    status: '', // Succession status (At Risk, Covered, Partial)
    incumbentId: '', // Current role holder
    primarySuccessors: [], // Top succession candidates
    emergencySuccessor: '', // Person who can step in immediately if needed
    timeToFill: '', // Estimated time to fill role
    retentionRisk: '', // Risk of losing incumbent
    notes: '', // Additional context
  }
}; 