// Backend DTO (PascalCase from C#)
export interface GetDashboardDetailsDTO {
  TotalPatients: number;
  TotalDepartments: number;
  TotalSpecialties: number;
  TotalUsers: number;

  // Task summary
  AssignedTasks: number;
  InProgressTasks: number;
  CompletedTasks: number;
  OverdueTasks: number;
  HighPriorityTasks: number;
  MediumPriorityTasks: number;
  LowPriorityTasks: number;

  // Referral summary
  PendingReferrals: number;
  AcceptedReferrals: number;
  RejectedReferrals: number;
  TotalReferrals: number;
  IncomingReferrals: number;
  OutgoingReferrals: number;

  // Intervention outcome summary
  SeenOutcomes: number;
  AttemptedOutcomes: number;
  DeclinedOutcomes: number;
  UnseenOutcomes: number;
  HandoverOutcomes: number;
}

// Frontend model (camelCase)
export interface DashboardDetails {
  totalPatients: number;
  totalDepartments: number;
  totalSpecialties: number;
  totalUsers: number;

  // Task summary
  assignedTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
  mediumPriorityTasks: number;
  lowPriorityTasks: number;

  // Referral summary
  pendingReferrals: number;
  acceptedReferrals: number;
  rejectedReferrals: number;
  totalReferrals: number;
  incomingReferrals: number;
  outgoingReferrals: number;

  // Intervention outcome summary
  seenOutcomes: number;
  attemptedOutcomes: number;
  declinedOutcomes: number;
  unseenOutcomes: number;
  handoverOutcomes: number;
}

