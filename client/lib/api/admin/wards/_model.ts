// Ward data models

export interface Ward {
  id: string;
  name: string;
  code: string;
  location: string;
  bedCount: number;
  defaultDepartment: string; // Department ID
  defaultDepartmentName?: string; // Display name for default department
  description?: string;
  coverageDepartments: string[]; // Array of department IDs
  coverageDepartmentNames?: string[]; // Display names for coverage departments
  currentPatients: number; // Count of current patients
  openTasks: number; // Count of open tasks
  overdueTasks: number; // Count of overdue tasks
  status: "A" | "X"; // A=Active, X=Inactive
  hidden: boolean; // Whether the ward is hidden
  notes?: string;
  createdAt: string;
  lastUpdated: string;
}

export interface WardFormData {
  id?: string | null;
  name: string;
  code: string;
  location: string;
  bedCount: number;
  description?: string;
  defaultDepartment: string;
  coverageDepartments: string[];
  status?: "A" | "X";
  notes?: string;
}

export interface WardSummary {
  totalWards: number;
  activeWards: number;
  totalBeds: number;
  occupiedBeds: number;
  totalOpenTasks: number;
  totalOverdueTasks: number;
}

// Ward location types
export type WardLocationType = "Ground Floor" | "First Floor" | "Second Floor" | "Third Floor" | "ICU" | "Emergency" | "Surgery" | "Rehabilitation" | "Other";

export const WARD_LOCATIONS: readonly WardLocationType[] = [
  "Ground Floor",
  "First Floor", 
  "Second Floor",
  "Third Floor",
  "ICU",
  "Emergency",
  "Surgery",
  "Rehabilitation",
  "Other"
] as const;

// Status descriptions
export const WARD_STATUS_DESCRIPTIONS = {
  A: "Active - Ward operational",
  X: "Inactive - Ward not operational"
} as const;

// Department option interface
export interface DepartmentOption {
  id: string;
  name: string;
  code: string;
  purpose: string;
}

// Helper function to get ward location display name
export const getWardLocationDisplayName = (location: WardLocationType): string => {
  return location;
};