// Task data models

export interface Task {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  taskType: string;
  title: string;
  clinicalInstructions: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string; // ISO date string
  dueTime: string; // HH:mm format
  assignedToDepartment?: string;
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
  
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
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
  clinicalInstructions: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  dueTime: string;
  assignedToDepartment?: string;
  subTasks: SubTask[];
  status: "Not Assigned" | "Assigned" | "In Progress" | "Completed";
  outcomeNotes?: string;
}

export interface TaskSummary {
  totalTasks: number;
  tasksToday: number;
  notAssigned: number;
  assigned: number;
  inProgress: number;
  completed: number;
  overdue: number;
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  departmentBreakdown: {
    physiotherapy: number;
    occupationalTherapy: number;
    speechTherapy: number;
    dietetics: number;
    unassigned: number;
  };
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

// Helper to check if task is overdue
export const isTaskOverdue = (task: Task): boolean => {
  if (task.status === "Completed") return false;
  
  const now = new Date();
  const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
  
  return dueDateTime < now;
};

