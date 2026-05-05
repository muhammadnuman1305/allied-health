import { DashboardDetails, GetDashboardDetailsDTO } from "./_model";
import api from "../../axios";

const BASE_URL = "/api/dashboard";

/** Read a numeric field whether the API sent camelCase or PascalCase (C#) keys. */
const pickNumber = (
  raw: Record<string, unknown>,
  camel: keyof DashboardDetails,
  pascal: keyof GetDashboardDetailsDTO
): number => {
  const v = raw[camel as string] ?? raw[pascal as string];
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const mapToDashboardDetails = (payload: unknown): DashboardDetails => {
  const raw =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  return {
    totalPatients: pickNumber(raw, "totalPatients", "TotalPatients"),
    totalDepartments: pickNumber(raw, "totalDepartments", "TotalDepartments"),
    totalSpecialties: pickNumber(raw, "totalSpecialties", "TotalSpecialties"),
    totalUsers: pickNumber(raw, "totalUsers", "TotalUsers"),
    assignedTasks: pickNumber(raw, "assignedTasks", "AssignedTasks"),
    inProgressTasks: pickNumber(raw, "inProgressTasks", "InProgressTasks"),
    completedTasks: pickNumber(raw, "completedTasks", "CompletedTasks"),
    overdueTasks: pickNumber(raw, "overdueTasks", "OverdueTasks"),
    highPriorityTasks: pickNumber(raw, "highPriorityTasks", "HighPriorityTasks"),
    mediumPriorityTasks: pickNumber(raw, "mediumPriorityTasks", "MediumPriorityTasks"),
    lowPriorityTasks: pickNumber(raw, "lowPriorityTasks", "LowPriorityTasks"),
    pendingReferrals: pickNumber(raw, "pendingReferrals", "PendingReferrals"),
    acceptedReferrals: pickNumber(raw, "acceptedReferrals", "AcceptedReferrals"),
    rejectedReferrals: pickNumber(raw, "rejectedReferrals", "RejectedReferrals"),
    totalReferrals: pickNumber(raw, "totalReferrals", "TotalReferrals"),
    incomingReferrals: pickNumber(raw, "incomingReferrals", "IncomingReferrals"),
    outgoingReferrals: pickNumber(raw, "outgoingReferrals", "OutgoingReferrals"),
    seenOutcomes: pickNumber(raw, "seenOutcomes", "SeenOutcomes"),
    attemptedOutcomes: pickNumber(raw, "attemptedOutcomes", "AttemptedOutcomes"),
    declinedOutcomes: pickNumber(raw, "declinedOutcomes", "DeclinedOutcomes"),
    unseenOutcomes: pickNumber(raw, "unseenOutcomes", "UnseenOutcomes"),
    handoverOutcomes: pickNumber(raw, "handoverOutcomes", "HandoverOutcomes"),
  };
};

// Fetch dashboard details
export const getDashboardDetails$ = async (): Promise<{
  data: DashboardDetails;
}> => {
  const response = await api.get(BASE_URL);
  const data = mapToDashboardDetails(response.data);
  return { data };
};

