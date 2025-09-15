// Ward data models

export interface Ward {
  id: string;
  name: string;
  description: string;
  capacity: number;
  currentOccupancy: number;
  wardType: "General Medical" | "Surgical" | "ICU" | "Emergency" | "Specialized";
  department: string;
  location: string; // Building/Floor
  contactNumber: string;
  wardManager: string;
  status: "A" | "M" | "C" | "X"; // A=Active, M=Maintenance, C=Closed, X=Inactive
  specializations: string[];
  equipment: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WardFormData {
  id?: string | null;
  name: string;
  description: string;
  capacity: number;
  currentOccupancy: number;
  wardType: "General Medical" | "Surgical" | "ICU" | "Emergency" | "Specialized";
  department: string;
  location: string;
  contactNumber: string;
  wardManager: string;
  status: "A" | "M" | "C" | "X";
  specializations: string[];
  equipment: string[];
  notes?: string;
}

export interface WardSummary {
  totalWards: number;
  activeWards: number;
  totalCapacity: number;
  totalOccupancy: number;
  occupancyRate: number;
  wardTypeBreakdown: {
    generalMedical: number;
    surgical: number;
    icu: number;
    emergency: number;
    specialized: number;
  };
  statusBreakdown: {
    active: number;
    maintenance: number;
    closed: number;
    inactive: number;
  };
  wardsInMaintenance: number;
  availableBeds: number;
}

// Ward types
export const WARD_TYPES = [
  "General Medical",
  "Surgical", 
  "ICU",
  "Emergency",
  "Specialized"
] as const;

// Departments
export const DEPARTMENTS = [
  "Internal Medicine",
  "Surgery",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Geriatrics",
  "Emergency Medicine",
  "Critical Care",
  "Rehabilitation",
  "Psychiatry",
  "Oncology"
] as const;

// Common specializations
export const SPECIALIZATIONS = [
  "Geriatrics",
  "Stroke Care",
  "Orthopaedic",
  "Cardiology",
  "Respiratory",
  "Rehabilitation",
  "Palliative Care",
  "Dementia Care",
  "Post-Surgical",
  "Trauma",
  "Intensive Care"
] as const;

// Common equipment
export const EQUIPMENT = [
  "Cardiac Monitors",
  "Ventilators",
  "Defibrillators",
  "IV Pumps",
  "Patient Lifts",
  "Wheelchairs",
  "Walking Aids",
  "Oxygen Supply",
  "Suction Equipment",
  "Blood Pressure Monitors",
  "Pulse Oximeters",
  "Feeding Pumps",
  "Dialysis Equipment",
  "X-Ray Equipment"
] as const;

// Status descriptions
export const STATUS_DESCRIPTIONS = {
  A: "Active - Ward operational",
  M: "Maintenance - Under maintenance",
  C: "Closed - Temporarily closed",
  X: "Inactive - Not in use"
} as const;

// Occupancy level variants for UI
export const getOccupancyVariant = (occupancyRate: number) => {
  if (occupancyRate >= 90) return "destructive"; // Red - Critical
  if (occupancyRate >= 80) return "secondary"; // Yellow - High
  if (occupancyRate >= 60) return "default"; // Blue - Moderate
  return "outline"; // Gray - Low
};

export const getOccupancyLabel = (occupancyRate: number) => {
  if (occupancyRate >= 90) return "Critical";
  if (occupancyRate >= 80) return "High";
  if (occupancyRate >= 60) return "Moderate";
  return "Low";
};
