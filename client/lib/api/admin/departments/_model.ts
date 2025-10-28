// Department data models

export interface Department {
  id: string;
  name: string;
  code: string;
  purpose: string;
  description: string;
  headAHP: string; // User ID of the head AHP
  headAHPName?: string; // Display name for the head AHP
  status: "A" | "X"; // A=Active, X=Inactive
  hidden: boolean; // Whether the department is hidden
  defaultTaskPriority: TaskPriority;
  coverageWards: string[]; // Array of ward IDs
  coverageWardNames?: string[]; // Display names for coverage wards
  activeAHPs: number; // Count of active AHPs
  activeAHAs: number; // Count of active AHAs
  activeAssistants: number; // Count of active assistants (API field)
  openTasks: number; // Count of open tasks
  overdueTasks: number; // Count of overdue tasks
  incomingReferralsToday: number; // Count of incoming referrals today
  contactNumber: string;
  email: string;
  operatingFrom: string; // Operating start time (e.g., "08:00")
  operatingTo: string; // Operating end time (e.g., "18:00")
  notes?: string;
  createdAt: string;
  lastUpdated: string;
}

export interface DepartmentFormData {
  id?: string | null;
  name: string;
  code: string;
  purpose: string;
  description: string;
  deptHeadId: string;
  defaultTaskPriority: number; // Changed to number for backend
  contactNumber: string;
  email: string;
  operatingFrom: string;
  operatingTo: string;
}

export interface DepartmentSummary {
  totalDepartments: number;
  activeDepartments: number;
  openTasks: number;
  overdueTasks: number;
  incomingReferrals: number;
}

export interface DepartmentHead {
  id: string;
  name: string;
}

// Service Line types (renamed from DisciplineType for clarity)
export type ServiceLineType = "Physiotherapy" | "Occupational Therapy" | "Speech Therapy" | "Dietetics";

export const SERVICE_LINES: ServiceLineType[] = [
  "Physiotherapy",
  "Occupational Therapy", 
  "Speech Therapy",
  "Dietetics"
];

// Task priority levels
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export const TASK_PRIORITIES: TaskPriority[] = [
  "Low",
  "Medium",
  "High",
  "Urgent"
];

// Priority mapping to numeric IDs
export const PRIORITY_TO_ID: Record<TaskPriority, number> = {
  "Low": 1,
  "Medium": 2,
  "High": 3,
  "Urgent": 4
};

export const ID_TO_PRIORITY: Record<number, TaskPriority> = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Urgent"
};

// Service Line-specific interventions
export const INTERVENTIONS_BY_SERVICE_LINE: Record<ServiceLineType, string[]> = {
  "Physiotherapy": [
    "Mobilisation",
    "Strength exercises", 
    "Balance exercises",
    "Gait training",
    "Joint mobilization",
    "Manual therapy",
    "Exercise therapy",
    "Postural training",
    "Pain management",
    "Respiratory physiotherapy"
  ],
  "Occupational Therapy": [
    "Cognitive intervention",
    "Function retraining", 
    "Pressure care management",
    "Activities of daily living training",
    "Adaptive equipment assessment",
    "Home safety evaluation",
    "Workplace assessment",
    "Sensory integration",
    "Hand therapy",
    "Splinting"
  ],
  "Speech Therapy": [
    "Articulation therapy",
    "Swallowing therapy", 
    "Communication support",
    "Language therapy",
    "Voice therapy",
    "Fluency therapy",
    "Cognitive communication therapy",
    "Augmentative and alternative communication",
    "Hearing assessment",
    "Auditory processing therapy"
  ],
  "Dietetics": [
    "Nutrition screening",
    "Feeding support", 
    "Dietary education",
    "Meal planning",
    "Weight management",
    "Nutritional counseling",
    "Enteral nutrition support",
    "Food safety education",
    "Therapeutic diet planning",
    "Nutrition assessment"
  ]
};

// Helper function to get interventions for a specific service line
export const getInterventionsForServiceLine = (serviceLine: ServiceLineType): string[] => {
  return INTERVENTIONS_BY_SERVICE_LINE[serviceLine] || [];
};

// Status descriptions
export const STATUS_DESCRIPTIONS = {
  A: "Active - Department operational",
  X: "Inactive - Department not operational"
} as const;

// Helper function to get service line display name
export const getServiceLineDisplayName = (serviceLine: ServiceLineType): string => {
  const displayNames = {
    "Physiotherapy": "Physiotherapy",
    "Occupational Therapy": "Occupational Therapy",
    "Speech Therapy": "Speech Pathology", 
    "Dietetics": "Dietitians"
  };
  return displayNames[serviceLine] || serviceLine;
};

// Helper function to get department name from service line
export const getDepartmentName = (serviceLine: ServiceLineType): string => {
  return `${getServiceLineDisplayName(serviceLine)} Department`;
};