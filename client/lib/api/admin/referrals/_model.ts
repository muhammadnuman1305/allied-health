// Referral data models

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  patientUmrn: string;
  patientAge: number;
  patientGender: "M" | "F" | "Other";
  ward: string;
  bedNumber: string;
  diagnosis: string;
  referringTherapist: string;
  referralDate: string;
  priority: "P1" | "P2" | "P3";
  interventions: string[];
  status: "S" | "A" | "D" | "U" | "X"; // S=Success, A=Active, D=Discharged, U=Unavailable, X=Cancelled
  // Department workflow fields
  originDepartment: string; // Department that created the referral
  destinationDepartment: string; // Department the referral is sent to
  triageStatus: "pending" | "accepted" | "rejected" | "redirected"; // Triage status
  triageNotes?: string; // Notes from destination department
  triagedBy?: string; // AHP who triaged the referral
  triagedAt?: string; // When the referral was triaged
  redirectToDepartment?: string; // If redirected, which department
  // Original fields
  notes?: string;
  outcomeNotes?: string;
  completedDate?: string;
  // Ward-specific fields
  dementiaNotes?: string; // Geriatric
  limbWeakness?: string; // Stroke
  communicationChallenges?: string; // Stroke
  weightBearingTolerance?: string; // Orthopaedic
  createdAt: string;
  updatedAt: string;
}

export interface ReferralFormData {
  id?: string | null;
  patientId: string;
  referringTherapist: string;
  referralDate: string;
  priority: "P1" | "P2" | "P3";
  interventions: string[];
  status: "S" | "A" | "D" | "U" | "X";
  // Department workflow fields
  originDepartment: string;
  destinationDepartment: string;
  triageStatus?: "pending" | "accepted" | "rejected" | "redirected";
  triageNotes?: string;
  triagedBy?: string;
  triagedAt?: string;
  redirectToDepartment?: string;
  // Original fields
  notes?: string;
  outcomeNotes?: string;
  completedDate?: string;
  // Ward-specific fields
  dementiaNotes?: string;
  limbWeakness?: string;
  communicationChallenges?: string;
  weightBearingTolerance?: string;
}

export interface ReferralSummary {
  totalReferrals: number;
  referralsToday: number;
  priorityBreakdown: {
    P1: number;
    P2: number;
    P3: number;
  };
  disciplineBreakdown: {
    physiotherapy: number;
    occupationalTherapy: number;
    speechTherapy: number;
    dietetics: number;
  };
  statusBreakdown: {
    active: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  pendingOutcomes: number;
  completedReferrals: number;
  pendingTriage: number;
}

// Intervention options by discipline
export const INTERVENTIONS = {
  physiotherapy: [
    "Mobilisation",
    "Strength Training",
    "Balance Training",
    "Pain Management",
    "Respiratory Physiotherapy"
  ],
  occupationalTherapy: [
    "Cognitive Assessment",
    "Function Retraining",
    "Pressure Care",
    "Activities of Daily Living",
    "Home Assessment"
  ],
  speechTherapy: [
    "Articulation Therapy",
    "Swallowing Assessment",
    "Communication Aids",
    "Voice Therapy",
    "Language Therapy"
  ],
  dietetics: [
    "Nutrition Screening",
    "Feeding Support",
    "Nutrition Education",
    "Weight Management",
    "Dietary Planning"
  ]
} as const;

// Department options
export const DEPARTMENTS = [
  "Physiotherapy",
  "Occupational Therapy", 
  "Speech Therapy",
  "Dietetics",
  "Podiatry",
  "Psychology",
  "Social Work"
] as const;

// Ward options
export const WARDS = [
  "Geriatrics",
  "Stroke",
  "Orthopaedic",
  "Cardiology",
  "Respiratory",
  "General Medical",
  "Surgical",
  "ICU",
  "Emergency"
] as const;

// Status descriptions
export const STATUS_DESCRIPTIONS = {
  S: "Success - Outcome achieved",
  A: "Active - Treatment ongoing",
  D: "Discharged - Patient discharged",
  U: "Unavailable - Patient unavailable",
  X: "Cancelled - Referral cancelled"
} as const;

// Triage status descriptions
export const TRIAGE_STATUS_DESCRIPTIONS = {
  pending: "Pending - Awaiting triage decision",
  accepted: "Accepted - Referral accepted by destination department",
  rejected: "Rejected - Referral declined by destination department",
  redirected: "Redirected - Referral sent to different department"
} as const;


