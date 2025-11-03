import { Task, TaskFormData, TaskSummary, AddUpdateTaskDTO, TaskInterventionDTO, GetTaskDTO, priorityNumberToString, priorityStringToNumber } from "./_model";
import api from "../../axios";

// Types for specialties and interventions
export interface TaskSpecialty {
  id: string;
  name: string;
}

export interface TaskIntervention {
  id: string;
  specialtyId: string;
  name: string;
}

export interface AHAOption {
  id: string;
  name: string;
  specialties: string[];
}

export interface DeptOption {
  id: string;
  name: string;
}

export interface WardOption {
  id: string;
  name: string;
  departments: string[];
}

// Transform backend GetTaskDTO to frontend Task
const transformTaskFromBackend = (dto: GetTaskDTO): Task => {
  // Infer status: if assigned, default to "Assigned", otherwise "Not Assigned"
  // Note: Backend doesn't provide status, so we infer based on assignedTo
  let inferredStatus: Task["status"] = "Not Assigned";
  if (dto.assignedTo) {
    // If assigned but no clear indication of progress, default to "Assigned"
    // Completed status would need explicit backend support
    inferredStatus = "Assigned";
  }
  
  // Transform interventions if they exist
  const interventions: string[] = [];
  const interventionAssignments: Record<string, string> = {};
  const interventionSchedules: Record<string, { startDate: string; endDate: string }> = {};
  const interventionWardAssignments: Record<string, string> = {};

  if (dto.interventions && Array.isArray(dto.interventions)) {
    dto.interventions.forEach((intervention) => {
      interventions.push(intervention.id);
      interventionAssignments[intervention.id] = intervention.ahaId;
      interventionSchedules[intervention.id] = {
        startDate: intervention.start,
        endDate: intervention.end,
      };
      interventionWardAssignments[intervention.id] = intervention.wardId;
    });
  }

  return {
    id: dto.id,
    title: dto.title,
    patientId: dto.patientId.toString(),
    patientName: dto.patientName 
      ? (typeof dto.patientName === "string" ? dto.patientName : dto.patientName.toString())
      : `Patient ${dto.patientId}`, // Fallback if patientName not provided
    departmentId: dto.departmentId,
    departmentName: dto.departmentName || "",
    assignedToDepartment: dto.departmentName || "", // Alias
    priority: priorityNumberToString(dto.priority),
    startDate: dto.startDate,
    endDate: dto.endDate,
    assignedTo: dto.assignedTo,
    description: dto.description,
    diagnosis: dto.diagnosis || "",
    goals: dto.goals || "",
    clinicalInstructions: dto.description || "", // Map description to clinicalInstructions
    lastUpdated: dto.lastUpdated,
    updatedAt: dto.lastUpdated, // Alias
    hidden: dto.hidden,
    status: inferredStatus,
    // Add interventions data for form use
    interventions: interventions,
    interventionAssignments: interventionAssignments,
    interventionSchedules: interventionSchedules,
    interventionWardAssignments: interventionWardAssignments,
  } as Task & {
    interventions?: string[];
    interventionAssignments?: Record<string, string>;
    interventionSchedules?: Record<string, { startDate: string; endDate: string }>;
    interventionWardAssignments?: Record<string, string>;
  };
};

// Fetch all tasks
export const getAll$ = async (statusFilter: "All" | "Active" | "Hidden" = "All"): Promise<{ data: Task[] }> => {
  try {
    let url = "/api/task";
    
    // Add OData filter based on status
    if (statusFilter === "Hidden") {
      url += "?$filter=hidden eq true";
    } else if (statusFilter === "Active") {
      url += "?$filter=hidden eq false or hidden eq null";
    }
    // For "All", no filter is applied
    
    const response = await api.get(url);
    const dtos = response.data as GetTaskDTO[];
    const tasks = dtos.map(transformTaskFromBackend);
    return { data: tasks };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

// Fetch single task by ID
export const getById$ = async (id: string): Promise<{ data: Task }> => {
  try {
    const response = await api.get(`/api/task/${id}`);
    const dto = response.data as GetTaskDTO;
    return { data: transformTaskFromBackend(dto) };
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
};

export const getSummary$ = async (): Promise<{ data: TaskSummary }> => {
  try {
    // If summary endpoint exists, use it. Otherwise, calculate from getAll$
    const response = await api.get("/api/task/summary");
    return { data: response.data as TaskSummary };
  } catch (error) {
    // Fallback: calculate summary from all tasks
    console.warn("Summary endpoint not available, calculating from tasks:", error);
    const tasksResponse = await getAll$();
    const tasks = tasksResponse.data;
    const now = new Date();
    
    // Calculate department breakdown dynamically
    const deptMap = new Map<string, number>();
    tasks.forEach((task) => {
      const deptName = task.departmentName || task.assignedToDepartment || "Unassigned";
      deptMap.set(deptName, (deptMap.get(deptName) || 0) + 1);
    });
    
    const deptWiseSummary: Array<{ name: string; count: number }> = Array.from(deptMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
    
    const summary: TaskSummary = {
      totalTasks: tasks.length,
      overdueTasks: tasks.filter(t => {
        if (t.status === "Completed") return false;
        const endDateTime = t.endDate 
          ? new Date(t.endDate) 
          : (t.dueDate && t.dueTime ? new Date(`${t.dueDate}T${t.dueTime}`) : null);
        return endDateTime && endDateTime < now;
      }).length,
      activeTasks: tasks.filter(t => t.status === "Assigned" || t.status === "In Progress").length,
      completedTasks: tasks.filter(t => t.status === "Completed").length,
      highPriority: tasks.filter(t => t.priority === "High").length,
      midPriority: tasks.filter(t => t.priority === "Medium").length,
      lowPriority: tasks.filter(t => t.priority === "Low").length,
      deptWiseSummary,
    };
    return { data: summary };
  }
};

export const getByPatientId$ = async (patientId: string): Promise<{ data: Task[] }> => {
  try {
    const response = await api.get(`/api/task?patientId=${patientId}`);
    const dtos = response.data as GetTaskDTO[];
    const tasks = dtos.map(transformTaskFromBackend);
    return { data: tasks };
  } catch (error) {
    console.error("Error fetching patient tasks:", error);
    throw error;
  }
};

export const getOverdue$ = async (): Promise<{ data: Task[] }> => {
  try {
    const response = await api.get("/api/task?overdue=true");
    const dtos = response.data as GetTaskDTO[];
    const tasks = dtos.map(transformTaskFromBackend);
    return { data: tasks };
  } catch (error) {
    console.error("Error fetching overdue tasks:", error);
    throw error;
  }
};

// Helper function to convert priority string to number (use exported function from model)
const priorityToNumber = priorityStringToNumber;

// Transform frontend TaskFormData to backend AddUpdateTaskDTO
const transformToBackendDTO = (formData: TaskFormData): AddUpdateTaskDTO => {
  // Get start and end dates - prioritize startDate/endDate, fallback to dueDate
  const startDate = formData.startDate || formData.dueDate;
  const endDate = formData.endDate || formData.dueDate;

  // Transform interventions
  const interventions: TaskInterventionDTO[] = [];
  
  if (formData.interventions && formData.interventionAssignments && 
      formData.interventionSchedules && formData.interventionWardAssignments) {
    formData.interventions.forEach((interventionId) => {
      const ahaId = formData.interventionAssignments![interventionId];
      const schedule = formData.interventionSchedules![interventionId];
      const wardId = formData.interventionWardAssignments![interventionId];

      if (ahaId && schedule && schedule.startDate && schedule.endDate && wardId) {
        interventions.push({
          id: interventionId,
          ahaId: ahaId,
          start: schedule.startDate,
          end: schedule.endDate,
          wardId: wardId,
        });
      }
    });
  }

  // Ensure patientId is a valid number
  const patientIdNum = parseInt(formData.patientId, 10);
  if (isNaN(patientIdNum)) {
    throw new Error("Invalid patientId: must be a number");
  }

  // Ensure departmentId is provided
  if (!formData.assignedToDepartment) {
    throw new Error("DepartmentId is required");
  }

  // Ensure dates are in YYYY-MM-DD format
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    // Otherwise, parse and format
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }
    return date.toISOString().split("T")[0];
  };

  const dto: AddUpdateTaskDTO = {
    id: formData.id || null,
    patientId: patientIdNum,
    departmentId: formData.assignedToDepartment,
    title: formData.title,
    priority: priorityToNumber(formData.priority),
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    description: formData.clinicalInstructions || null,
    diagnosis: formData.diagnosis || null,
    goals: formData.goals || null,
    interventions: interventions,
    refId: formData.refId || null, // Include refId if task is created from a referral
  };

  return dto;
};

// Create new task
export const create$ = async (task: TaskFormData): Promise<{ data: Task }> => {
  try {
    const payload = transformToBackendDTO(task);
    const response = await api.post("/api/task", payload);
    return { data: response.data as Task };
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// Update task
export const update$ = async (task: TaskFormData): Promise<{ data: Task }> => {
  try {
    const payload = transformToBackendDTO(task);
    const response = await api.put("/api/task", payload);
    return { data: response.data as Task };
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

// Get referral details for task creation
export interface GetReferralTaskDetailsDTO {
  refId: string;
  patientId: number;
  departmentId: string;
  priority: number;
  diagnosis: string;
  goals: string;
  description: string;
  interventions: string[];
}

export const getReferralTaskDetails$ = async (refId: string): Promise<{ data: GetReferralTaskDetailsDTO }> => {
  try {
    const response = await api.get(`/api/task/referral-details?refId=${refId}`);
    // Check if response.data exists and has the expected structure
    if (!response.data) {
      throw new Error("No data received from API");
    }
    return { data: response.data as GetReferralTaskDetailsDTO };
  } catch (error) {
    console.error("Error fetching referral task details:", error);
    throw error;
  }
};

// Update task status (uses PUT endpoint with full task data)
export const updateStatus$ = async (id: string, status: Task["status"], outcomeNotes?: string): Promise<{ data: Task }> => {
  try {
    // First get the current task
    const currentTask = await getById$(id);
    const updatedTask: TaskFormData = {
      ...currentTask.data,
      status,
      ...(outcomeNotes && { outcomeNotes }),
      ...(status === "Completed" && {
        completedDate: new Date().toISOString().split("T")[0],
      })
    };
    
    // Update using PUT endpoint
    const response = await update$(updatedTask);
    return response;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
};

// Delete/restore task (same endpoint for both)
export const deleteTask$ = async (id: string): Promise<{ data: { success: boolean } }> => {
  try {
    const response = await api.delete(`/api/task/${id}`);
    return { data: response.data || { success: true } };
  } catch (error) {
    console.error("Error deleting/restoring task:", error);
    throw error;
  }
};

// Get specialties for tasks
export const getSpecialties$ = async (): Promise<{ data: TaskSpecialty[] }> => {
  try {
    const response = await api.get("/api/task/specialties");
    return { data: response.data as TaskSpecialty[] };
  } catch (error) {
    console.error("Error fetching task specialties:", error);
    throw error;
  }
};

// Get interventions for tasks
export const getInterventions$ = async (): Promise<{ data: TaskIntervention[] }> => {
  try {
    const response = await api.get("/api/task/interventions");
    return { data: response.data as TaskIntervention[] };
  } catch (error) {
    console.error("Error fetching task interventions:", error);
    throw error;
  }
};

// Get AHA options for tasks
export const getAHAOptions$ = async (): Promise<{ data: AHAOption[] }> => {
  try {
    const response = await api.get("/api/task/aha-options");
    return { data: response.data as AHAOption[] };
  } catch (error) {
    console.error("Error fetching AHA options:", error);
    throw error;
  }
};

// Get department options for tasks
export const getDeptOptions$ = async (): Promise<{ data: DeptOption[] }> => {
  try {
    const response = await api.get("/api/task/dept-options");
    return { data: response.data as DeptOption[] };
  } catch (error) {
    console.error("Error fetching department options:", error);
    throw error;
  }
};

// Get ward options for tasks
export const getWardOptions$ = async (): Promise<{ data: WardOption[] }> => {
  try {
    const response = await api.get("/api/task/ward-options");
    return { data: response.data as WardOption[] };
  } catch (error) {
    console.error("Error fetching ward options:", error);
    throw error;
  }
};

