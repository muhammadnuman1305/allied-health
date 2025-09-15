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


