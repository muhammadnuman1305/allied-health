import { Patient, PatientFormData, PatientSummary } from "./_model";

// Mock data for development
const MOCK_PATIENTS: Patient[] = [
  {
    id: "1",
    umrn: "MRN001234",
    firstName: "John",
    lastName: "Smith",
    age: 75,
    gender: "M",
    ward: "Geriatrics",
    bedNumber: "G12",
    admissionDate: "2024-01-15",
    diagnosis: "Dementia with mobility issues",
    referringTherapist: "Dr. Sarah Wilson",
    referralDate: "2024-01-16",
    priority: "P2",
    interventions: ["Mobilisation", "Cognitive Assessment"],
    status: "A",
    notes: "Patient requires assistance with daily activities",
    dementiaNotes: "Moderate dementia, responsive to familiar faces",
    createdAt: "2024-01-16T09:00:00Z",
    updatedAt: "2024-01-16T09:00:00Z"
  },
  {
    id: "2",
    umrn: "MRN001235",
    firstName: "Mary",
    lastName: "Johnson",
    age: 68,
    gender: "F",
    ward: "Stroke",
    bedNumber: "S08",
    admissionDate: "2024-01-14",
    diagnosis: "Acute stroke - left hemisphere",
    referringTherapist: "Dr. Michael Brown",
    referralDate: "2024-01-15",
    priority: "P1",
    interventions: ["Articulation Therapy", "Function Retraining"],
    status: "A",
    notes: "High priority - significant communication difficulties",
    limbWeakness: "Right side weakness, moderate severity",
    communicationChallenges: "Expressive aphasia, understands well",
    createdAt: "2024-01-15T14:30:00Z",
    updatedAt: "2024-01-15T14:30:00Z"
  },
  {
    id: "3",
    umrn: "MRN001236",
    firstName: "Robert",
    lastName: "Davis",
    age: 82,
    gender: "M",
    ward: "Orthopaedic",
    bedNumber: "O15",
    admissionDate: "2024-01-13",
    diagnosis: "Hip fracture post-surgery",
    referringTherapist: "Dr. Lisa Chen",
    referralDate: "2024-01-14",
    priority: "P2",
    interventions: ["Mobilisation", "Strength Training"],
    status: "A",
    notes: "Post-operative day 3, cleared for mobilisation",
    weightBearingTolerance: "Partial weight bearing - 50%",
    createdAt: "2024-01-14T11:15:00Z",
    updatedAt: "2024-01-14T11:15:00Z"
  },
  {
    id: "4",
    umrn: "MRN001237",
    firstName: "Elizabeth",
    lastName: "Wilson",
    age: 79,
    gender: "F",
    ward: "Geriatrics",
    bedNumber: "G05",
    admissionDate: "2024-01-12",
    diagnosis: "Malnutrition and dehydration",
    referringTherapist: "Dr. James Taylor",
    referralDate: "2024-01-13",
    priority: "P3",
    interventions: ["Nutrition Screening", "Feeding Support"],
    status: "S",
    notes: "Nutrition goals achieved, ready for discharge",
    createdAt: "2024-01-13T08:45:00Z",
    updatedAt: "2024-01-16T16:20:00Z"
  },
  {
    id: "5",
    umrn: "MRN001238",
    firstName: "William",
    lastName: "Anderson",
    age: 71,
    gender: "M",
    ward: "Cardiology",
    bedNumber: "C22",
    admissionDate: "2024-01-16",
    diagnosis: "Myocardial infarction",
    referringTherapist: "Dr. Emma Thompson",
    referralDate: "2024-01-16",
    priority: "P1",
    interventions: ["Respiratory Physiotherapy", "Activities of Daily Living"],
    status: "A",
    notes: "Recent MI, requires cardiac rehabilitation",
    createdAt: "2024-01-16T13:20:00Z",
    updatedAt: "2024-01-16T13:20:00Z"
  }
];

const MOCK_SUMMARY: PatientSummary = {
  totalPatients: 45,
  referralsToday: 8,
  priorityBreakdown: {
    P1: 12,
    P2: 18,
    P3: 15
  },
  disciplineBreakdown: {
    physiotherapy: 25,
    occupationalTherapy: 18,
    speechTherapy: 12,
    dietetics: 8
  },
  pendingOutcomes: 32,
  completedReferrals: 13
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getAll$ = async (): Promise<{ data: Patient[] }> => {
  await delay(500);
  return { data: MOCK_PATIENTS };
};

export const getById$ = async (id: string): Promise<{ data: Patient }> => {
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
    ...patient,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  MOCK_PATIENTS.push(newPatient);
  return { data: newPatient };
};

export const update$ = async (patient: PatientFormData): Promise<{ data: Patient }> => {
  await delay(800);
  const index = MOCK_PATIENTS.findIndex(p => p.id === patient.id);
  if (index === -1) {
    throw new Error("Patient not found");
  }
  
  const updatedPatient: Patient = {
    ...MOCK_PATIENTS[index],
    ...patient,
    updatedAt: new Date().toISOString()
  };
  
  MOCK_PATIENTS[index] = updatedPatient;
  return { data: updatedPatient };
};

export const toggleActive$ = async (id: string): Promise<{ data: Patient }> => {
  await delay(500);
  const patient = MOCK_PATIENTS.find(p => p.id === id);
  if (!patient) {
    throw new Error("Patient not found");
  }
  
  // Toggle between active and cancelled status
  patient.status = patient.status === "X" ? "A" : "X";
  patient.updatedAt = new Date().toISOString();
  
  return { data: patient };
};