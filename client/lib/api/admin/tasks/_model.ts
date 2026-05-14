// Task data models

export interface Task {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn?: string; // Optional, may not come from backend
  title: string;
  clinicalInstructions?: string; // Optional, mapped from description
  priority: "Critical" | "High" | "Medium" | "Low";
  dueDate?: string; // ISO date string - kept for backward compatibility
  dueTime?: string; // HH:mm format - kept for backward compatibility
  startDate?: string; // ISO date string (DateOnly from backend)
  endDate?: string; // ISO date string (DateOnly from backend)
  departmentId?: string;
  departmentName?: string;
  assignedToDepartment?: string; // Alias for departmentName
  assignedTo?: string;
  assignedToStaff?: string;
  assignedToStaffName?: string;
  subTasks?: SubTask[];
  status: "Not Assigned" | "Assigned" | "In Progress" | "Completed" | "Overdue";

  // Optional referral linkage
  linkedReferral?: boolean;
  referralFromDepartment?: string;
  referralToDepartment?: string;
  
  // Feedback fields
  feedbackType?: string;
  feedbackNotes?: string;
  
  // Outcome when completed
  outcomeNotes?: string;
  completedDate?: string;
  completedBy?: string;
  
  description?: string; // From backend
  diagnosis?: string;
  goals?: string;
  lastUpdated?: string; // DateTime from backend
  hidden?: boolean;

  createdAt?: string;
  updatedAt?: string; // Alias for lastUpdated
  createdBy?: string;
  createdByName?: string;
  createdById?: string;

  // New fields
  severity?: number; // ETaskSeverity: 1=Low, 2=Medium, 3=High, 4=Critical
  requiredRepetitions?: number;
  completedRepetitions?: number;
  lastReviewDate?: string; // DateOnly YYYY-MM-DD
  taskType?: string;
}

// Backend GetTaskDTO interface
export interface GetTaskDTO {
  id: string;
  title: string;
  patientId: number;
  patientName?: number | string;
  departmentId: string;
  departmentName?: string;
  priority: number; // 1=Low, 2=Medium, 3=High
  severity?: number; // 1=Low, 2=Medium, 3=High, 4=Critical
  requiredRepetitions?: number;
  completedRepetitions?: number;
  lastReviewDate?: string; // DateOnly YYYY-MM-DD
  taskType?: string;
  startDate?: string; // DateOnly format: YYYY-MM-DD
  endDate?: string; // DateOnly format: YYYY-MM-DD
  assignedTo?: string;
  description?: string;
  diagnosis?: string;
  goals?: string;
  lastUpdated?: string; // DateTime
  hidden: boolean;
  status?: number; // ETaskStatus enum: 1=Assigned, 2=InProgress, 3=Completed, 4=Overdue
  createdByName?: string;
  createdById?: string;
  interventions?: Array<{
    id: string;
    ahaId: string;
    wardId: string;
    start: string;
    end: string;
    components?: SelectedComponentInput[];
  }>;
}

export interface TaskViewLog {
  ahaUserId: string;
  ahaName: string;
  viewedAt: string; // ISO datetime
}

/** A single component value selected by a clinician for a task intervention */
export interface SelectedComponentInput {
  componentType: string; // e.g. "Technique"
  value: string;         // e.g. "Hoist transfer"
}

export interface SubTask {
  id: string;
  name: string;
  assignedToStaff?: string;
}

export interface TaskFormData {
  id?: string | null;
  patientId: string;
  taskType: string;
  title: string;
  diagnosis?: string;
  goals?: string;
  clinicalInstructions: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  severity?: number; // 1=Low, 2=Medium, 3=High, 4=Critical
  requiredRepetitions?: number;
  lastReviewDate?: string; // DateOnly YYYY-MM-DD
  dueDate: string;
  dueTime: string;
  startDate?: string; // For backend DTO
  endDate?: string; // For backend DTO
  assignedToDepartment?: string;
  subTasks: SubTask[];
  status: "Not Assigned" | "Assigned" | "In Progress" | "Completed" | "Overdue";
  outcomeNotes?: string;
  refId?: string | null; // Optional referral ID if task is created from a referral
  // For form submission with interventions
  interventions?: string[];
  interventionAssignments?: Record<string, string>;
  interventionSchedules?: Record<string, { startDate: string; endDate: string }>;
  interventionWardAssignments?: Record<string, string>;
  interventionOrder?: Record<string, number>;
  /** Clinician-selected component values per intervention. Key = interventionId. Zero entries is valid. */
  interventionComponents?: Record<string, SelectedComponentInput[]>;
}

// Backend DTO interfaces
export interface AddUpdateTaskDTO {
  id?: string | null;
  patientId: number;
  departmentId: string;
  title: string;
  priority: number;
  severity: number;
  requiredRepetitions: number;
  lastReviewDate?: string | null; // DateOnly YYYY-MM-DD
  taskType?: string | null;
  startDate: string; // DateOnly format: YYYY-MM-DD
  endDate: string; // DateOnly format: YYYY-MM-DD
  description?: string | null;
  diagnosis?: string | null;
  goals?: string | null;
  interventions: TaskInterventionDTO[];
  refId?: string | null; // Optional referral ID if task is created from a referral
}

export interface AutoAssignInterventionItem {
  id: string;
  startDate?: string; // DateOnly YYYY-MM-DD — intervention-specific dates if already set
  endDate?: string;
}

export interface AutoAssignRequestDTO {
  interventions: AutoAssignInterventionItem[];
  taskStartDate: string; // DateOnly YYYY-MM-DD — task-level fallback
  taskEndDate: string;
  departmentId?: string;
}

export interface AutoAssignResultDTO {
  interventionId: string;
  interventionName: string;
  suggestedAhaId?: string;
  suggestedAhaName?: string;
  suggestedWardId?: string;
  suggestedWardName?: string;
  currentDaySlots: number;
  canAssign: boolean;
}

export interface TaskInterventionDTO {
  id: string;
  ahaId: string;
  start: string; // DateOnly format: YYYY-MM-DD
  end: string; // DateOnly format: YYYY-MM-DD
  wardId: string;
  /** Component values selected by the clinician. Zero entries is valid. */
  components?: SelectedComponentInput[];
}

export interface DeptTaskSummary {
  name: string;
  count: number;
}

export interface TaskSummary {
  totalTasks: number;
  overdueTasks: number;
  activeTasks: number;
  completedTasks: number;
  criticalPriority: number;
  highPriority: number;
  midPriority: number;
  lowPriority: number;
  deptWiseSummary: DeptTaskSummary[];
}

// Common task types (predefined options with ability to add custom)
export const TASK_TYPES = [
  "Assessment",
  "Treatment Session",
  "Progress Review",
  "Discharge Planning",
  "Equipment Assessment",
  "Home Visit",
  "Family Education",
  "Documentation",
  "Follow-up",
  "Consultation"
] as const;

// Feedback types (predefined options)
export const FEEDBACK_TYPES = [
  "Completed as prescribed",
  "Partially completed",
  "Patient declined",
  "Patient unavailable",
  "Needs review",
  "Equipment required",
  "Additional support needed",
  "Ready for discharge",
  "Requires escalation"
] as const;

// Priority badge variants
export const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case "Critical":
      return "destructive";
    case "High":
      return "destructive";
    case "Medium":
      return "default";
    case "Low":
      return "secondary";
    default:
      return "outline";
  }
};

// Status badge variants
export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "Completed":
      return "default"; // Success - green
    case "In Progress":
      return "default"; // Blue
    case "Assigned":
      return "secondary"; // Light blue
    case "Overdue":
      return "destructive"; // Red - urgent
    case "Not Assigned":
      return "outline"; // Gray
    default:
      return "outline";
  }
};

// Helper to convert priority number to string
export const priorityNumberToString = (priority: number): "Critical" | "High" | "Medium" | "Low" => {
  switch (priority) {
    case 1:
      return "Low";
    case 2:
      return "Medium";
    case 3:
      return "High";
    case 4:
      return "Critical";
    default:
      return "Medium";
  }
};

// Helper to convert status number to display string
export const statusNumberToString = (
  status: number | undefined
): "Not Assigned" | "Assigned" | "In Progress" | "Completed" | "Overdue" => {
  if (status === undefined || status === null) {
    return "Not Assigned";
  }
  switch (status) {
    case 1:
      return "Assigned";
    case 2:
      return "In Progress";
    case 3:
      return "Completed";
    case 4:
      return "Overdue";
    default:
      return "Not Assigned";
  }
};

// Helper to convert priority string to number (for backwards compatibility)
export const priorityStringToNumber = (priority: "Critical" | "High" | "Medium" | "Low" | "Urgent"): number => {
  switch (priority) {
    case "Low":
      return 1;
    case "Medium":
      return 2;
    case "High":
      return 3;
    case "Critical":
    case "Urgent":
      return 4;
    default:
      return 2; // Default to Medium
  }
};

// Severity helpers
export const SEVERITY_OPTIONS = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
  { value: 4, label: "Critical" },
] as const;

export const severityNumberToString = (severity: number | undefined): string => {
  switch (severity) {
    case 1: return "Low";
    case 2: return "Medium";
    case 3: return "High";
    case 4: return "Critical";
    default: return "Low";
  }
};

export const getSeverityBadgeVariant = (severity: number | undefined) => {
  switch (severity) {
    case 4: return "destructive";
    case 3: return "destructive";
    case 2: return "default";
    default: return "secondary";
  }
};

// Helper to check if task is overdue
export const isTaskOverdue = (task: Task): boolean => {
  if (task.status === "Completed") return false;
  
  const now = new Date();
  
  // Use endDate if available, otherwise fall back to dueDate
  const endDateTime = task.endDate 
    ? new Date(task.endDate) 
    : (task.dueDate && task.dueTime ? new Date(`${task.dueDate}T${task.dueTime}`) : null);
  
  if (!endDateTime) return false;
  
  return endDateTime < now;
};

