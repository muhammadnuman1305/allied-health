// AHA (Allied Health Assistant) data models

// Backend DTO from /api/aha/tasks
export interface GetAHAPatientDTO {
  id: number;
  fullName: string;
  mrn?: string; // Optional - may not come from API, will be generated on frontend
  age: number;
  gender: string; // "Male", "Female", "Other"
  phone: string;
  activeTasks: number;
  lastActivityDate: string; // DateTime ISO string
  hidden: boolean;
}

// Frontend patient interface for AHA patients
export interface AHAPatient {
  id: string;
  fullName: string;
  mrn: string;
  age: number;
  gender: string; // "Male", "Female", "Other"
  primaryPhone: string;
  activeTasks: number;
  lastActivityDate: string; // ISO timestamp
  hidden: boolean;
}

// Backend DTO from /api/aha-patient/{id}
export interface GetAHAPatientDetailsDTO {
  id: number;
  fullName: string;
  mrn?: string; // Optional - may not come from API, will be generated on frontend
  age: number;
  gender: string; // "Male", "Female", "Other"
  dateOfBirth: string; // DateOnly format: YYYY-MM-DD
  primaryPhone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  // Summary cards
  activeTasks: number;
  totalTasks: number;
  totalReferrals: number;
}

// Frontend patient details interface
export interface AHAPatientDetails {
  id: string;
  fullName: string;
  mrn: string;
  age: number;
  gender: string;
  dateOfBirth?: string;
  primaryPhone: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
  // Summary cards
  activeTasks: number;
  totalTasks: number;
  totalReferrals: number;
}

// Backend DTO from /api/aha-task
export interface GetTaskDTO {
  id: string; // Guid
  title: string;
  patientName: string;
  mrn?: string; // Optional - may not come from API, will be generated on frontend if patientId available
  patientId?: number; // Optional - may be needed for MRN generation
  departmentName: string;
  therapistName: string;
  totalInterventions: number;
  myInterventions: number;
  priority: number; // 1=Low, 2=Medium, 3=High
  status: number; // 1=Assigned, 2=InProgress, 3=Completed, 4=Overdue
  startDate: string | null; // DateOnly format: YYYY-MM-DD
  endDate: string | null; // DateOnly format: YYYY-MM-DD
}

// Frontend task interface
export interface AHATask {
  id: string;
  title: string;
  description: string;
  patientId: string;
  patientName: string;
  patientMrn?: string;
  startDate: string;
  endDate: string;
  priority: "High" | "Medium" | "Low";
  departmentName?: string;
  status: "Not Assigned" | "Assigned" | "In Progress" | "Completed" | "Overdue";
  assignedTo?: string;
  assignedToDepartment?: string;
  interventionCount: number;
  myInterventionCount: number;
}

// Backend DTO from /api/aha-task/{id}
export interface GetAHATaskDetailsDTO {
  id: string; // Guid
  patientId: number;
  patientName: string;
  departmentName: string;
  title: string;
  priority: number; // 1=Low, 2=Medium, 3=High
  startDate: string | null; // DateOnly format: YYYY-MM-DD
  endDate: string | null; // DateOnly format: YYYY-MM-DD
  diagnosis: string;
  goals: string;
  description: string;
  totalInterventions: number;
  lastUpdated: string | null; // DateTime
  interventions: TaskInterventionDTO[];
}

// Task intervention DTO
export interface TaskInterventionDTO {
  id: string;
  ahaId: string;
  start: string; // DateOnly format: YYYY-MM-DD
  end: string; // DateOnly format: YYYY-MM-DD
  wardId: string;
}

// Frontend task details interface
export interface AHATaskDetails {
  id: string;
  patientId: string;
  patientName: string;
  departmentName: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  startDate: string;
  endDate: string;
  diagnosis?: string;
  goals?: string;
  description: string;
  totalInterventions: number;
  lastUpdated?: string;
  interventions: TaskInterventionDTO[];
}

// Backend DTO from /api/aha-task/my-tasks
export interface GetMyTasksDTO {
  id: string; // Guid
  title: string;
  patientId: number;
  patientName: string;
  mrn?: string; // Optional - may not come from API, will be generated on frontend
  departmentId: string; // Guid
  departmentName: string;
  therapistName: string;
  priority: number; // 1=Low, 2=Medium, 3=High
  status: number; // 1=Assigned, 2=InProgress, 3=Completed, 4=Overdue
  startDate: string | null; // DateOnly format: YYYY-MM-DD
  endDate: string | null; // DateOnly format: YYYY-MM-DD
  interventions: AHATaskInterventionDTO[] | null;
}

// Backend DTO for task intervention from /api/aha-task/my-tasks
export interface AHATaskInterventionDTO {
  taskInvId: string; // Guid
  wardId: string; // Guid
  wardName: string;
  interventionId: string; // Guid
  interventionName: string;
  outcomeStatus: number; // 1=Seen, 2=Attempted, 3=Declined, 4=Unseen, 5=Handover
  outcome: string | null;
  outcomeDate: string | null; // DateOnly format: YYYY-MM-DD
  startDate: string; // DateOnly format: YYYY-MM-DD
  endDate: string; // DateOnly format: YYYY-MM-DD
}

