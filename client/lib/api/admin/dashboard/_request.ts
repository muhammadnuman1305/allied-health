import { DashboardDetails } from "./_model";
import api from "../../axios";

const BASE_URL = "/api/dashboard";

// Fetch dashboard details
export const getDashboardDetails$ = async (): Promise<{
  data: DashboardDetails;
}> => {
  try {
    // API returns camelCase JSON directly
    const response = await api.get<DashboardDetails>(BASE_URL);
    console.log("Raw API response:", response.data);
    
    // Ensure all values are numbers (handle potential string conversions)
    const data: DashboardDetails = {
      totalPatients: Number(response.data.totalPatients) || 0,
      totalDepartments: Number(response.data.totalDepartments) || 0,
      totalSpecialties: Number(response.data.totalSpecialties) || 0,
      totalUsers: Number(response.data.totalUsers) || 0,
      assignedTasks: Number(response.data.assignedTasks) || 0,
      inProgressTasks: Number(response.data.inProgressTasks) || 0,
      completedTasks: Number(response.data.completedTasks) || 0,
      overdueTasks: Number(response.data.overdueTasks) || 0,
      highPriorityTasks: Number(response.data.highPriorityTasks) || 0,
      mediumPriorityTasks: Number(response.data.mediumPriorityTasks) || 0,
      lowPriorityTasks: Number(response.data.lowPriorityTasks) || 0,
      pendingReferrals: Number(response.data.pendingReferrals) || 0,
      acceptedReferrals: Number(response.data.acceptedReferrals) || 0,
      rejectedReferrals: Number(response.data.rejectedReferrals) || 0,
      totalReferrals: Number(response.data.totalReferrals) || 0,
      incomingReferrals: Number(response.data.incomingReferrals) || 0,
      outgoingReferrals: Number(response.data.outgoingReferrals) || 0,
      seenOutcomes: Number(response.data.seenOutcomes) || 0,
      attemptedOutcomes: Number(response.data.attemptedOutcomes) || 0,
      declinedOutcomes: Number(response.data.declinedOutcomes) || 0,
      unseenOutcomes: Number(response.data.unseenOutcomes) || 0,
      handoverOutcomes: Number(response.data.handoverOutcomes) || 0,
    };
    
    console.log("Processed dashboard data:", data);
    return { data };
  } catch (error) {
    console.error("Error fetching dashboard details:", error);
    throw error;
  }
};

