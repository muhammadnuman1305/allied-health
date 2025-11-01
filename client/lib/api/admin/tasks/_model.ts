// Task data models

export interface Task {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn?: string; // Optional, may not come from backend
  taskType?: string; // Optional, may not come from backend
  title: string;
  clinicalInstructions?: string; // Optional, mapped from description
  priority: "High" | "Medium" | "Low";
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
  status: "Not Assigned" | "Assigned" | "In Progress" | "Completed";
  
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
}

// Backend GetTaskDTO interface
export interface GetTaskDTO {
  id: string;
  title: string;
  patientId: number;
  patientName?: number | string; // Backend says int but likely string, may not always be present
  departmentId: string;
  departmentName?: string; // May not always be present
  priority: number; // 1=Low, 2=Medium, 3=High, 4=Urgent
  startDate?: string; // DateOnly format: YYYY-MM-DD
  endDate?: string; // DateOnly format: YYYY-MM-DD
  assignedTo?: string;
  description?: string;
  diagnosis?: string;
  goals?: string;
  lastUpdated?: string; // DateTime
  hidden: boolean;
  interventions?: Array<{
    id: string;
    ahaId: string;
    wardId: string;
    start: string;
    end: string;
  }>;
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
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  dueTime: string;
  startDate?: string; // For backend DTO
  endDate?: string; // For backend DTO
  assignedToDepartment?: string;
  subTasks: SubTask[];
  status: "Not Assigned" | "Assigned" | "In Progress" | "Completed";
  outcomeNotes?: string;
  // For form submission with interventions
  interventions?: string[];
  interventionAssignments?: Record<string, string>;
  interventionSchedules?: Record<string, { startDate: string; endDate: string }>;
  interventionWardAssignments?: Record<string, string>;
  interventionOrder?: Record<string, number>;
}

// Backend DTO interfaces
export interface AddUpdateTaskDTO {
  id?: string | null;
  patientId: number;
  departmentId: string;
  title: string;
  priority: number;
  startDate: string; // DateOnly format: YYYY-MM-DD
  endDate: string; // DateOnly format: YYYY-MM-DD
  description?: string | null;
  diagnosis?: string | null;
  goals?: string | null;
  interventions: TaskInterventionDTO[];
}

export interface TaskInterventionDTO {
  id: string;
  ahaId: string;
  start: string; // DateOnly format: YYYY-MM-DD
  end: string; // DateOnly format: YYYY-MM-DD
  wardId: string;
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
    case "Not Assigned":
      return "outline"; // Gray
    default:
      return "outline";
  }
};

// Helper to convert priority number to string
export const priorityNumberToString = (priority: number): "High" | "Medium" | "Low" => {
  switch (priority) {
    case 1:
      return "Low";
    case 2:
      return "Medium";
    case 3:
      return "High";
    case 4:
      return "High"; // Urgent mapped to High
    default:
      return "Medium";
  }
};

// Helper to convert priority string to number (for backwards compatibility)
export const priorityStringToNumber = (priority: "High" | "Medium" | "Low" | "Urgent"): number => {
  switch (priority) {
    case "Low":
      return 1;
    case "Medium":
      return 2;
    case "High":
      return 3;
    case "Urgent":
      return 4;
    default:
      return 2; // Default to Medium
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

