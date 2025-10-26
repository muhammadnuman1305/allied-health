import { Patient, PatientFormData, PatientSummary, PatientTask, PatientReferral, PatientFeedback } from "./_model";

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Mock data for development
const MOCK_PATIENTS: Patient[] = [
  {
    id: "1",
    fullName: "John Smith",
    mrn: "MRN001234",
    dateOfBirth: "1949-03-15",
    gender: "Male",
    primaryPhone: "+447700900123",
    emergencyContactName: "Sarah Smith",
    emergencyContactPhone: "+447700900456",
    activeTasks: 3,
    lastUpdated: "2024-10-18T14:30:00Z",
    createdAt: "2024-01-16T09:00:00Z",
    updatedAt: "2024-10-18T14:30:00Z"
  },
  {
    id: "2",
    fullName: "Mary Johnson",
    mrn: "MRN001235",
    dateOfBirth: "1956-07-22",
    gender: "Female",
    primaryPhone: "+447700900789",
    emergencyContactName: "Robert Johnson",
    emergencyContactPhone: "+447700900012",
    activeTasks: 5,
    lastUpdated: "2024-10-19T09:15:00Z",
    createdAt: "2024-01-15T14:30:00Z",
    updatedAt: "2024-10-19T09:15:00Z"
  },
  {
    id: "3",
    fullName: "Robert Davis",
    mrn: "MRN001236",
    dateOfBirth: "1942-11-08",
    gender: "Male",
    primaryPhone: "+447700900345",
    emergencyContactName: "Margaret Davis",
    emergencyContactPhone: "+447700900678",
    activeTasks: 2,
    lastUpdated: "2024-10-17T16:45:00Z",
    createdAt: "2024-01-14T11:15:00Z",
    updatedAt: "2024-10-17T16:45:00Z"
  },
  {
    id: "4",
    fullName: "Elizabeth Wilson",
    mrn: "MRN001237",
    dateOfBirth: "1945-05-30",
    gender: "Female",
    primaryPhone: "+447700900901",
    emergencyContactName: "James Wilson",
    emergencyContactPhone: "+447700900234",
    activeTasks: 0,
    lastUpdated: "2024-10-16T11:20:00Z",
    createdAt: "2024-01-13T08:45:00Z",
    updatedAt: "2024-10-16T11:20:00Z"
  },
  {
    id: "5",
    fullName: "William Anderson",
    mrn: "MRN001238",
    dateOfBirth: "1953-09-12",
    gender: "Male",
    primaryPhone: "+447700900567",
    emergencyContactName: "Linda Anderson",
    emergencyContactPhone: "+447700900890",
    activeTasks: 4,
    lastUpdated: "2024-10-19T10:00:00Z",
    createdAt: "2024-01-16T13:20:00Z",
    updatedAt: "2024-10-19T10:00:00Z"
  },
  {
    id: "6",
    fullName: "Patricia Brown",
    mrn: "MRN001239",
    dateOfBirth: "1960-12-03",
    gender: "Female",
    activeTasks: 1,
    lastUpdated: "2024-10-18T08:30:00Z",
    createdAt: "2024-02-10T10:00:00Z",
    updatedAt: "2024-10-18T08:30:00Z"
  }
];

const MOCK_SUMMARY: PatientSummary = {
  totalPatients: 6,
  newPatientsToday: 2,
  activeTasks: 15,
  completedTasks: 42
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getAll$ = async (): Promise<{ data: Patient[] }> => {
  await delay(500);
  return { data: MOCK_PATIENTS };
};

export const getById$ = async (id: any): Promise<{ data: Patient }> => {
  await delay(300);
  const patient = MOCK_PATIENTS.find(p => p.id === id);
  if (!patient) {
    throw new Error("Patient not found");
  }
  return { data: patient };
};

export const getSummary$ = async (): Promise<{ data: PatientSummary }> => {
  await delay(200);
  return { data: MOCK_SUMMARY };
};

export const create$ = async (patient: PatientFormData): Promise<{ data: Patient }> => {
  await delay(800);
  const newPatient: Patient = {
    id: Math.random().toString(36).substr(2, 9),
    fullName: patient.fullName,
    mrn: patient.mrn,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    primaryPhone: patient.primaryPhone,
    emergencyContactName: patient.emergencyContactName,
    emergencyContactPhone: patient.emergencyContactPhone,
    activeTasks: 0,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  MOCK_PATIENTS.push(newPatient);
  return { data: newPatient };
};

export const update$ = async (patient: PatientFormData): Promise<{ data: Patient }> => {
  await delay(800);
  if (!patient.id) {
    throw new Error("Patient ID is required for update");
  }
  
  const index = MOCK_PATIENTS.findIndex(p => p.id === patient.id);
  if (index === -1) {
    throw new Error("Patient not found");
  }
  
  const updatedPatient: Patient = {
    ...MOCK_PATIENTS[index],
    fullName: patient.fullName,
    mrn: patient.mrn,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    primaryPhone: patient.primaryPhone,
    emergencyContactName: patient.emergencyContactName,
    emergencyContactPhone: patient.emergencyContactPhone,
    updatedAt: new Date().toISOString()
  };
  
  MOCK_PATIENTS[index] = updatedPatient;
  return { data: updatedPatient };
};

export const delete$ = async (id: string): Promise<{ data: { success: boolean } }> => {
  await delay(500);
  const index = MOCK_PATIENTS.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error("Patient not found");
  }
  
  MOCK_PATIENTS.splice(index, 1);
  return { data: { success: true } };
};

export const toggleActive$ = async (id: string): Promise<{ data: { success: boolean } }> => {
  await delay(500);
  const patient = MOCK_PATIENTS.find(p => p.id === id);
  if (!patient) {
    throw new Error("Patient not found");
  }
  // In a real implementation, this might toggle an isActive flag
  // For now, we'll just return success
  return { data: { success: true } };
};

// Get patient tasks
export const getPatientTasks$ = async (patientId: string): Promise<{ data: PatientTask[] }> => {
  await delay(300);
  // Mock task data
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
export const getPatientReferrals$ = async (patientId: string): Promise<{ data: PatientReferral[] }> => {
  await delay(300);
  // Mock referral data
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
export const getPatientFeedback$ = async (patientId: string): Promise<{ data: PatientFeedback[] }> => {
  await delay(300);
  // Mock feedback data
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