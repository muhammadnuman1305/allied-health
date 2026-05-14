export interface VacationRequest {
  id: string;
  ahaUserId: string;
  ahaName: string;
  startDate: string; // DateOnly YYYY-MM-DD
  endDate: string;   // DateOnly YYYY-MM-DD
  reason: string;
  status: number;    // 1=Pending, 2=Approved, 3=Rejected
  submittedDate: string; // ISO datetime
  reviewedById?: string;
  reviewedByName?: string;
  reviewedDate?: string;
  rejectionReason?: string;
}

export interface CreateVacationRequestDTO {
  startDate: string; // DateOnly YYYY-MM-DD
  endDate: string;   // DateOnly YYYY-MM-DD
  reason: string;
}

export interface ReviewVacationRequestDTO {
  id: string;
  approve: boolean;
  rejectionReason?: string;
}

export const vacationStatusLabel = (status: number): string => {
  switch (status) {
    case 1: return "Pending";
    case 2: return "Approved";
    case 3: return "Rejected";
    default: return "Unknown";
  }
};

export const vacationStatusVariant = (status: number): "pending" | "approved" | "rejected" => {
  switch (status) {
    case 2: return "approved";
    case 3: return "rejected";
    default: return "pending";
  }
};
