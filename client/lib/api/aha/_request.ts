import { GetAHAPatientDTO, AHAPatient, GetAHAPatientDetailsDTO, AHAPatientDetails, GetTaskDTO, AHATask, GetAHATaskDetailsDTO, AHATaskDetails, GetMyTasksDTO, AHATaskInterventionDTO } from "./_model";
import api from "../axios";

const BASE_URL = "/api/aha-patient";
const TASK_BASE_URL = "/api/aha-task";

// Helper to convert numeric ID to string for frontend
const toStringId = (id: number | string): string => {
  if (typeof id === 'number') return id.toString();
  return id;
};

// Helper to generate MRN from patient ID if not provided
const generateMRN = (patientId: number, mrn?: string): string => {
  // If MRN is provided and not empty, use it
  if (mrn && mrn.trim() !== "") {
    return mrn;
  }
  // Otherwise, generate MRN from patient ID (e.g., MRN000123)
  return `MRN${patientId.toString().padStart(6, "0")}`;
};

// Transform backend DTO to frontend model
const transformAHAPatient = (dto: GetAHAPatientDTO): AHAPatient => {
  return {
    id: toStringId(dto.id),
    fullName: dto.fullName,
    mrn: generateMRN(dto.id, dto.mrn),
    age: dto.age,
    gender: dto.gender,
    primaryPhone: dto.phone,
    activeTasks: dto.activeTasks,
    lastActivityDate: dto.lastActivityDate,
    hidden: dto.hidden,
  };
};

// Fetch all AHA patients
export const getAll$ = async (
  hiddenFilter?: "All" | "Hidden" | "Active",
  viewMode?: "mine" | "all"
): Promise<{ data: AHAPatient[] }> => {
  try {
    const params = new URLSearchParams();
    
    // Add viewMode parameter if provided
    if (viewMode) {
      params.append("viewMode", viewMode);
    }
    
    // Add OData filter for hidden status if needed
    if (hiddenFilter && hiddenFilter !== "All") {
      const filterValue = hiddenFilter === "Hidden" ? "true" : "false";
      params.append("$filter", `hidden eq ${filterValue}`);
    }
    
    // Build final URL with query parameters
    let url = BASE_URL;
    const queryString = params.toString();
    if (queryString) {
      url = `${BASE_URL}?${queryString}`;
    }
    
    const response = await api.get<GetAHAPatientDTO[]>(url);
    const data = response.data.map(transformAHAPatient);
    return { data };
  } catch (error) {
    console.error("Error fetching AHA patients:", error);
    throw error;
  }
};

// Transform backend details DTO to frontend model
const transformAHAPatientDetails = (dto: GetAHAPatientDetailsDTO): AHAPatientDetails => {
  return {
    id: toStringId(dto.id),
    fullName: dto.fullName,
    mrn: generateMRN(dto.id, dto.mrn),
    age: dto.age,
    gender: dto.gender,
    dateOfBirth: dto.dateOfBirth,
    primaryPhone: dto.primaryPhone,
    email: dto.email,
    emergencyContactName: dto.emergencyContactName,
    emergencyContactPhone: dto.emergencyContactPhone,
    emergencyContactEmail: dto.emergencyContactEmail,
    activeTasks: dto.activeTasks,
    totalTasks: dto.totalTasks,
    totalReferrals: dto.totalReferrals,
  };
};

// Fetch AHA patient by ID
export const getById$ = async (id: string): Promise<{ data: AHAPatientDetails }> => {
  try {
    const response = await api.get<GetAHAPatientDetailsDTO>(`${BASE_URL}/${id}`);
    const data = transformAHAPatientDetails(response.data);
    return { data };
  } catch (error) {
    console.error("Error fetching AHA patient details:", error);
    throw error;
  }
};

// Helper to convert status number to string
const statusNumberToString = (status: number): "Not Assigned" | "Assigned" | "In Progress" | "Completed" | "Overdue" => {
  switch (status) {
    case 1:
      return "Assigned";
    case 2:
      return "In Progress";
    case 3:
      return "Completed";
    case 4:
      return "Overdue";
    default:
      return "Not Assigned";
  }
};

// Helper to convert priority number to string
const priorityNumberToString = (priority: number): "High" | "Medium" | "Low" => {
  switch (priority) {
    case 1:
      return "Low";
    case 2:
      return "Medium";
    case 3:
      return "High";
    default:
      return "Medium"; // Default to Medium
  }
};

// Transform backend task DTO to frontend model
const transformAHATask = (dto: GetTaskDTO): AHATask => {
  // Generate MRN if patientId is available and MRN is not provided
  const patientMrn = dto.patientId 
    ? generateMRN(dto.patientId, dto.mrn)
    : (dto.mrn || undefined);
  
  return {
    id: toStringId(dto.id),
    title: dto.title,
    description: dto.title, // Using title as description fallback, can be enhanced later
    patientId: dto.patientId ? toStringId(dto.patientId) : "", // Use patientId if available
    patientName: dto.patientName,
    patientMrn,
    startDate: dto.startDate || new Date().toISOString().split('T')[0],
    endDate: dto.endDate || new Date().toISOString().split('T')[0],
    priority: priorityNumberToString(dto.priority),
    departmentName: dto.departmentName || undefined,
    status: statusNumberToString(dto.status),
    assignedTo: dto.therapistName || undefined,
    assignedToDepartment: dto.departmentName || undefined,
    interventionCount: dto.totalInterventions,
    myInterventionCount: dto.myInterventions,
  };
};

// Fetch all AHA tasks
export const getAllTasks$ = async (): Promise<{ data: AHATask[] }> => {
  try {
    const response = await api.get<GetTaskDTO[]>(TASK_BASE_URL);
    const data = response.data.map(transformAHATask);
    return { data };
  } catch (error) {
    console.error("Error fetching AHA tasks:", error);
    throw error;
  }
};

// Transform backend task details DTO to frontend model
const transformAHATaskDetails = (dto: GetAHATaskDetailsDTO): AHATaskDetails => {
  return {
    id: toStringId(dto.id),
    patientId: toStringId(dto.patientId),
    patientName: dto.patientName,
    departmentName: dto.departmentName,
    title: dto.title,
    priority: priorityNumberToString(dto.priority),
    startDate: dto.startDate || new Date().toISOString().split('T')[0],
    endDate: dto.endDate || new Date().toISOString().split('T')[0],
    diagnosis: dto.diagnosis || undefined,
    goals: dto.goals || undefined,
    description: dto.description || "",
    totalInterventions: dto.totalInterventions,
    lastUpdated: dto.lastUpdated || undefined,
    interventions: dto.interventions || [],
  };
};

// Fetch AHA task details by ID
export const getTaskDetailsById$ = async (id: string): Promise<{ data: AHATaskDetails }> => {
  try {
    const response = await api.get<GetAHATaskDetailsDTO>(`${TASK_BASE_URL}/${id}`);
    const data = transformAHATaskDetails(response.data);
    return { data };
  } catch (error) {
    console.error("Error fetching AHA task details:", error);
    throw error;
  }
};

// Helper to convert outcome status number to intervention status string
const outcomeStatusNumberToString = (outcomeStatus: number): "Seen" | "Attempted" | "Declined" | "Unseen" | "Handover" => {
  switch (outcomeStatus) {
    case 1:
      return "Seen";
    case 2:
      return "Attempted";
    case 3:
      return "Declined";
    case 4:
      return "Unseen";
    case 5:
      return "Handover";
    default:
      return "Unseen";
  }
};

// Transform backend intervention DTO to frontend model
const transformAHATaskIntervention = (dto: AHATaskInterventionDTO, taskId: string, userId: string, index: number): {
  id: string;
  interventionId: string;
  interventionName: string;
  assignedToUserId: string;
  assignedToUserName: string;
  status: "Seen" | "Attempted" | "Declined" | "Unseen" | "Handover";
  statusCode: "S" | "A" | "D" | "U" | "X";
  outcome?: string;
  outcomeDate?: string;
  startDate: string;
  endDate: string;
  wardId?: string;
  wardName?: string;
} => {
  const status = outcomeStatusNumberToString(dto.outcomeStatus);
  const statusCodeMap: Record<typeof status, "S" | "A" | "D" | "U" | "X"> = {
    "Seen": "S",
    "Attempted": "A",
    "Declined": "D",
    "Unseen": "U",
    "Handover": "X",
  };

  // Ensure unique ID even if taskInvId is empty GUID
  const uniqueId = dto.taskInvId && dto.taskInvId !== "00000000-0000-0000-0000-000000000000"
    ? dto.taskInvId
    : `${taskId}-intervention-${index}`;

  return {
    id: uniqueId,
    interventionId: dto.interventionId,
    interventionName: dto.interventionName,
    assignedToUserId: userId,
    assignedToUserName: "You",
    status,
    statusCode: statusCodeMap[status],
    outcome: dto.outcome || undefined,
    outcomeDate: dto.outcomeDate || undefined,
    startDate: dto.startDate,
    endDate: dto.endDate,
    wardId: dto.wardId,
    wardName: dto.wardName,
  };
};

// Transform backend my tasks DTO to frontend task model
const transformMyTask = (dto: GetMyTasksDTO, userId: string): {
  id: string;
  title: string;
  description: string;
  patientId: string;
  patientName: string;
  patientMrn?: string;
  startDate: string;
  endDate: string;
  priority: "High" | "Medium" | "Low";
  departmentName?: string;
  status: "Not Assigned" | "Assigned" | "In Progress" | "Completed" | "Overdue";
  interventions: ReturnType<typeof transformAHATaskIntervention>[];
} => {
  const today = new Date().toISOString().split("T")[0];
  
  // Generate MRN from patientId if not provided
  const patientMrn = generateMRN(dto.patientId, dto.mrn);
  
  return {
    id: dto.id,
    title: dto.title,
    description: dto.title, // Using title as description fallback
    patientId: toStringId(dto.patientId),
    patientName: dto.patientName,
    patientMrn,
    startDate: dto.startDate || today,
    endDate: dto.endDate || today,
    priority: priorityNumberToString(dto.priority),
    departmentName: dto.departmentName || undefined,
    status: statusNumberToString(dto.status),
    interventions: (dto.interventions || []).map((intervention, index) =>
      transformAHATaskIntervention(intervention, dto.id, userId, index)
    ),
  };
};

// Fetch my tasks
export const getMyTasks$ = async (userId: string): Promise<{ data: ReturnType<typeof transformMyTask>[] }> => {
  try {
    const response = await api.get<GetMyTasksDTO[]>(`${TASK_BASE_URL}/my-tasks`);
    const data = response.data.map((dto) => transformMyTask(dto, userId));
    return { data };
  } catch (error) {
    console.error("Error fetching my tasks:", error);
    throw error;
  }
};

// Fetch my tasks by date range (for calendar view)
// Uses OData filters similar to admin calendar
// Filters tasks that overlap with the month date range
export const getMyTasksByDateRange$ = async (
  userId: string,
  monthFirstDate: string, // YYYY-MM-DD format - first day of month
  monthLastDate: string // YYYY-MM-DD format - last day of month
): Promise<{ data: GetMyTasksDTO[] }> => {
  try {
    // OData filter: tasks that overlap with the date range
    // A task overlaps if: (startDate <= monthLastDate AND endDate >= monthFirstDate)
    // For nullable DateOnly types, check for null first and compare without quotes
    // OData DateOnly comparison: no quotes around date values
    // We want tasks where:
    // - startDate exists and is <= monthLastDate, OR startDate is null
    // - endDate exists and is >= monthFirstDate, OR endDate is null
    // - At least one date exists (not both null)
    const filter = `(startDate le ${monthLastDate} or startDate eq null) and (endDate ge ${monthFirstDate} or endDate eq null) and (startDate ne null or endDate ne null)`;
    const url = `${TASK_BASE_URL}/my-tasks?$filter=${encodeURIComponent(filter)}`;
    
    const response = await api.get<GetMyTasksDTO[]>(url);
    return { data: response.data };
  } catch (error) {
    console.error("Error fetching my tasks by date range:", error);
    throw error;
  }
};

