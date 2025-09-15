import { Referral, ReferralFormData, ReferralSummary } from "./_model";


// Mock data for development
const MOCK_REFERRALS: Referral[] = [
  {
    id: "ref-001",
    patientId: "1",
    patientName: "John Smith",
    patientUmrn: "MRN001234",
    patientAge: 75,
    patientGender: "M",
    ward: "Geriatrics",
    bedNumber: "G12",
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
    id: "ref-002",
    patientId: "2",
    patientName: "Mary Johnson",
    patientUmrn: "MRN001235",
    patientAge: 68,
    patientGender: "F",
    ward: "Stroke",
    bedNumber: "S08",
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
    id: "ref-003",
    patientId: "3",
    patientName: "Robert Davis",
    patientUmrn: "MRN001236",
    patientAge: 82,
    patientGender: "M",
    ward: "Orthopaedic",
    bedNumber: "O15",
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
    id: "ref-004",
    patientId: "4",
    patientName: "Elizabeth Wilson",
    patientUmrn: "MRN001237",
    patientAge: 79,
    patientGender: "F",
    ward: "Geriatrics",
    bedNumber: "G05",
    diagnosis: "Malnutrition and dehydration",
    referringTherapist: "Dr. James Taylor",
    referralDate: "2024-01-13",
    priority: "P3",
    interventions: ["Nutrition Screening", "Feeding Support"],
    status: "S",
    notes: "Nutrition goals achieved, ready for discharge",
    outcomeNotes: "Patient achieved target weight and improved nutritional status",
    completedDate: "2024-01-16",
    createdAt: "2024-01-13T08:45:00Z",
    updatedAt: "2024-01-16T16:20:00Z"
  },
  {
    id: "ref-005",
    patientId: "5",
    patientName: "William Anderson",
    patientUmrn: "MRN001238",
    patientAge: 71,
    patientGender: "M",
    ward: "Cardiology",
    bedNumber: "C22",
    diagnosis: "Myocardial infarction",
    referringTherapist: "Dr. Emma Thompson",
    referralDate: "2024-01-16",
    priority: "P1",
    interventions: ["Respiratory Physiotherapy", "Activities of Daily Living"],
    status: "A",
    notes: "Recent MI, requires cardiac rehabilitation",
    createdAt: "2024-01-16T13:20:00Z",
    updatedAt: "2024-01-16T13:20:00Z"
  },
  {
    id: "ref-006",
    patientId: "2",
    patientName: "Mary Johnson",
    patientUmrn: "MRN001235",
    patientAge: 68,
    patientGender: "F",
    ward: "Stroke",
    bedNumber: "S08",
    diagnosis: "Acute stroke - left hemisphere",
    referringTherapist: "Dr. Patricia Lee",
    referralDate: "2024-01-17",
    priority: "P1",
    interventions: ["Swallowing Assessment", "Voice Therapy"],
    status: "A",
    notes: "Additional speech therapy referral for swallowing difficulties",
    communicationChallenges: "Dysphagia concerns, requires assessment",
    createdAt: "2024-01-17T10:00:00Z",
    updatedAt: "2024-01-17T10:00:00Z"
  }
];

const MOCK_SUMMARY: ReferralSummary = {
  totalReferrals: 45,
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
  statusBreakdown: {
    active: 32,
    completed: 13,
    pending: 5,
    cancelled: 3
  },
  pendingOutcomes: 32,
  completedReferrals: 13
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getAll$ = async (): Promise<{ data: Referral[] }> => {
  await delay(500);
  return { data: MOCK_REFERRALS };
};

export const getById$ = async (id: string): Promise<{ data: Referral }> => {
  await delay(300);
  const referral = MOCK_REFERRALS.find(r => r.id === id);
  if (!referral) {
    throw new Error("Referral not found");
  }
  return { data: referral };
};

export const getSummary$ = async (): Promise<{ data: ReferralSummary }> => {
  await delay(200);
  return { data: MOCK_SUMMARY };
};

export const create$ = async (referral: ReferralFormData): Promise<{ data: Referral }> => {
  await delay(800);
  
  // Find patient info (in real app, this would come from the patient ID)
  const existingReferral = MOCK_REFERRALS.find(r => r.patientId === referral.patientId);
  const patientInfo = existingReferral ? {
    patientName: existingReferral.patientName,
    patientUmrn: existingReferral.patientUmrn,
    patientAge: existingReferral.patientAge,
    patientGender: existingReferral.patientGender,
    ward: existingReferral.ward,
    bedNumber: existingReferral.bedNumber,
    diagnosis: existingReferral.diagnosis,
  } : {
    patientName: "Unknown Patient",
    patientUmrn: "Unknown",
    patientAge: 0,
    patientGender: "M" as const,
    ward: "General",
    bedNumber: "Unknown",
    diagnosis: "Unknown",
  };

  const newReferral: Referral = {
    ...referral,
    ...patientInfo,
    id: `ref-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  MOCK_REFERRALS.push(newReferral);
  return { data: newReferral };
};

export const update$ = async (referral: ReferralFormData): Promise<{ data: Referral }> => {
  await delay(800);
  const index = MOCK_REFERRALS.findIndex(r => r.id === referral.id);
  if (index === -1) {
    throw new Error("Referral not found");
  }
  
  const updatedReferral: any = {
    ...MOCK_REFERRALS[index],
    ...referral,
    updatedAt: new Date().toISOString()
  };
  
  MOCK_REFERRALS[index] = updatedReferral;
  return { data: updatedReferral };
};

export const toggleActive$ = async (id: string): Promise<{ data: Referral }> => {
  await delay(500);
  const referral = MOCK_REFERRALS.find(r => r.id === id);
  if (!referral) {
    throw new Error("Referral not found");
  }
  
  // Toggle between active and cancelled status
  referral.status = referral.status === "X" ? "A" : "X";
  referral.updatedAt = new Date().toISOString();
  
  return { data: referral };
};

export const completeReferral$ = async (id: string, outcomeNotes: string): Promise<{ data: Referral }> => {
  await delay(500);
  const referral = MOCK_REFERRALS.find(r => r.id === id);
  if (!referral) {
    throw new Error("Referral not found");
  }
  
  referral.status = "S";
  referral.outcomeNotes = outcomeNotes;
  referral.completedDate = new Date().toISOString().split("T")[0];
  referral.updatedAt = new Date().toISOString();
  
  return { data: referral };
};



