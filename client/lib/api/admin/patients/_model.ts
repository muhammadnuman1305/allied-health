// Patient data models

// Master identity only - no episode/task context
export interface Patient {
  id: string;
  fullName: string;
  age: number;
  dateOfBirth?: string; // Optional but recommended
  gender: number; // 0 = Male, 1 = Female, 2 = Other
  primaryPhone?: string; // E.164 format
  email?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string; // E.164 format
  emergencyContactEmail?: string;
  // Computed fields
  activeTasks: number; // Count of tasks with status in [NotAssigned, Assigned, InProgress]
  hidden: boolean; // Whether the patient is hidden
  lastUpdated: string; // ISO timestamp
  createdAt: string;
  updatedAt: string;
}

export interface PatientFormData {
  id?: string | null;
  fullName: string;
  // mrn: string;
  dateOfBirth?: string;
  gender: number; // 0 = Male, 1 = Female, 2 = Other
  primaryPhone?: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
}

export interface PatientSummary {
  totalPatients: number;
  newPatients: number;
  activeTasks: number;
  completedTasks: number;
}

// Task-related interfaces (episode context lives here)
export interface PatientTask {
  id: string;
  taskName: string;
  status: "NotAssigned" | "Assigned" | "InProgress" | "Completed" | "Cancelled";
  assignedTo: string[]; // Array of AHP names
  dueDate: string;
  lastActivity: string;
  // Episode context
  admissionDate?: string;
  ward?: string;
  clinicalArea?: string;
  condition?: string;
  priority?: "P1" | "P2" | "P3";
}

export interface PatientReferral {
  id: string;
  fromDepartment: string;
  toDepartment: string;
  date: string;
  notes: string;
  status: "Pending" | "Accepted" | "Declined" | "Completed";
}

export interface PatientFeedback {
  id: string;
  date: string;
  taskName: string;
  ahp: string; // Allied Health Professional name
  type: "Positive" | "Concern" | "Neutral";
  commentPreview: string;
  fullComment: string;
}

// Gender options
export const GENDER_OPTIONS = [
  { value: 0, label: "Male" },
  { value: 1, label: "Female" },
  { value: 2, label: "Other" },
] as const;

// Helper functions to convert between gender number and label
export const getGenderLabel = (gender: number): string => {
  const option = GENDER_OPTIONS.find(opt => opt.value === gender);
  return option?.label || "Other";
};

export const getGenderValue = (label: string): number => {
  const option = GENDER_OPTIONS.find(opt => opt.label === label);
  return option?.value ?? 0;
};

// Task status options
export const TASK_STATUS_OPTIONS = [
  { value: "NotAssigned", label: "Not Assigned" },
  { value: "Assigned", label: "Assigned" },
  { value: "InProgress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" }
] as const;

// Referral status options
export const REFERRAL_STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Accepted", label: "Accepted" },
  { value: "Declined", label: "Declined" },
  { value: "Completed", label: "Completed" }
] as const;