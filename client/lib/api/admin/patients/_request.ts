import { Patient, PatientFormData, PatientSummary, PatientTask, PatientReferral, PatientFeedback, getGenderValue } from "./_model";
import api from "../../axios";

const BASE_URL = "/api/patient";

// Helper to convert string IDs to numbers for backend API
const toIntId = (id: string | undefined | null): number | undefined => {
  if (!id) return undefined;
  const numId = parseInt(id, 10);
  return isNaN(numId) ? undefined : numId;
};

// Helper to convert numeric ID to string for frontend
const toStringId = (id: number | string): string => {
  if (typeof id === 'number') return id.toString();
  return id;
};

// Helper to convert gender string/number to number
const convertGenderToNumber = (gender: any): number => {
  if (typeof gender === 'number') {
    return gender;
  }
  if (typeof gender === 'string') {
    return getGenderValue(gender);
  }
  return 0; // Default to Male
};

export const getAll$ = async (hiddenFilter?: "All" | "Hidden" | "Active"): Promise<{ data: Patient[] }> => {
  let url = BASE_URL;
  
  // Add OData filter for hidden status
  if (hiddenFilter && hiddenFilter !== "All") {
    const filterValue = hiddenFilter === "Hidden" ? "true" : "false";
    url = `${BASE_URL}?$filter=hidden eq ${filterValue}`;
  }
  
  const response = await api.get<Patient[]>(url);
  // Convert backend data to ensure IDs are strings and gender is number
  const data = response.data.map(patient => ({
    ...patient,
    id: toStringId(patient.id),
    gender: convertGenderToNumber(patient.gender)
  }));
  return { data };
};

export const getById$ = async (id: string): Promise<{ data: Patient }> => {
  const response = await api.get<Patient>(`${BASE_URL}/${id}`);
  // Convert ID to string and ensure gender is number
  return { 
    data: {
      ...response.data,
      id: toStringId(response.data.id),
      gender: convertGenderToNumber(response.data.gender)
    }
  };
};

export const getSummary$ = async (): Promise<{ data: PatientSummary }> => {
  const response = await api.get<PatientSummary>(`${BASE_URL}/summary`);
  return response;
};

export const create$ = async (patient: PatientFormData): Promise<{ data: Patient }> => {
  // Convert string ID to number for backend
  const payload: any = {
    ...patient,
    id: patient.id ? parseInt(patient.id, 10) : undefined
  };
  
  const response = await api.post<Patient>(BASE_URL, payload);
  // Convert ID to string for frontend
  return { 
    data: {
      ...response.data,
      id: toStringId(response.data.id)
    }
  };
};

export const update$ = async (patient: PatientFormData): Promise<{ data: Patient }> => {
  if (!patient.id) {
    throw new Error("Patient ID is required for update");
  }
  
  // Convert string ID to number for backend
  const payload: any = {
    ...patient,
    id: parseInt(patient.id, 10)
  };
  
  const response = await api.put<Patient>(BASE_URL, payload);
  // Convert ID to string for frontend
  return { 
    data: {
      ...response.data,
      id: toStringId(response.data.id)
    }
  };
};

export const delete$ = async (id: string): Promise<{ data: { success: boolean } }> => {
  await api.delete(`${BASE_URL}/${id}`);
  return { data: { success: true } };
};

export const toggleActive$ = async (id: string): Promise<{ data: { success: boolean } }> => {
  await api.delete(`${BASE_URL}/${id}`);
  return { data: { success: true } };
};

// Get patient tasks
// TODO: Replace with actual API endpoint when available
export const getPatientTasks$ = async (patientId: string): Promise<{ data: PatientTask[] }> => {
  // Mock task data for now - replace with: api.get(`/api/patient/${patientId}/tasks`)
  const mockTasks: PatientTask[] = [
    {
      id: "1",
      taskName: "Initial Assessment - Physiotherapy",
      status: "InProgress",
      assignedTo: ["Dr. Sarah Wilson", "John Doe PT"],
      dueDate: "2024-10-25",
      lastActivity: "2024-10-18T14:30:00Z"
    },
    {
      id: "2",
      taskName: "Occupational Therapy Consultation",
      status: "Assigned",
      assignedTo: ["Jane Smith OT"],
      dueDate: "2024-10-22",
      lastActivity: "2024-10-17T10:15:00Z"
    },
    {
      id: "3",
      taskName: "Nutrition Assessment",
      status: "Completed",
      assignedTo: ["Dr. Emma Thompson"],
      dueDate: "2024-10-15",
      lastActivity: "2024-10-15T16:45:00Z"
    }
  ];
  return { data: mockTasks };
};

// Get patient referrals
// TODO: Replace with actual API endpoint when available
export const getPatientReferrals$ = async (patientId: string): Promise<{ data: PatientReferral[] }> => {
  // Mock referral data for now - replace with: api.get(`/api/patient/${patientId}/referrals`)
  const mockReferrals: PatientReferral[] = [
    {
      id: "1",
      fromDepartment: "Emergency",
      toDepartment: "Physiotherapy",
      date: "2024-10-15T09:00:00Z",
      notes: "Patient requires immediate mobilization assessment",
      status: "Accepted"
    },
    {
      id: "2",
      fromDepartment: "Physiotherapy",
      toDepartment: "Occupational Therapy",
      date: "2024-10-16T14:30:00Z",
      notes: "ADL assessment needed for discharge planning",
      status: "Pending"
    }
  ];
  return { data: mockReferrals };
};

// Get patient feedback
// TODO: Replace with actual API endpoint when available
export const getPatientFeedback$ = async (patientId: string): Promise<{ data: PatientFeedback[] }> => {
  // Mock feedback data for now - replace with: api.get(`/api/patient/${patientId}/feedback`)
  const mockFeedback: PatientFeedback[] = [
    {
      id: "1",
      date: "2024-10-17T11:30:00Z",
      taskName: "Initial Assessment - Physiotherapy",
      ahp: "Dr. Sarah Wilson",
      type: "Positive",
      commentPreview: "Patient showed excellent cooperation during assessment. Good progress with mobility exercises...",
      fullComment: "Patient showed excellent cooperation during assessment. Good progress with mobility exercises. Continue with current treatment plan."
    },
    {
      id: "2",
      date: "2024-10-16T15:20:00Z",
      taskName: "Nutrition Assessment",
      ahp: "Dr. Emma Thompson",
      type: "Concern",
      commentPreview: "Patient showing signs of inadequate nutritional intake. Recommend dietary supplements...",
      fullComment: "Patient showing signs of inadequate nutritional intake. Recommend dietary supplements and close monitoring."
    }
  ];
  return { data: mockFeedback };
};