import { Department, DepartmentFormData, DepartmentSummary, DepartmentHead, SERVICE_LINES, INTERVENTIONS_BY_SERVICE_LINE, getDepartmentName, PRIORITY_TO_ID, ID_TO_PRIORITY } from "./_model";
import api from "../../axios";

// Get all departments
export const getAll$ = async (statusFilter: "All" | "Active" | "Hidden" = "All") => {
  try {
    let url = '/api/department';
    
    // Add OData filter based on status
    if (statusFilter === "Hidden") {
      url += '?$filter=hidden eq true';
    } else if (statusFilter === "Active") {
      url += '?$filter=hidden eq false or hidden eq null';
    }
    // For "All", no filter is applied
    
    const response = await api.get(url);
    
    // Convert numeric priority IDs back to strings for frontend
    const departments = response.data.map((dept: any) => ({
      ...dept,
      defaultTaskPriority: typeof dept.defaultTaskPriority === 'number' 
        ? ID_TO_PRIORITY[dept.defaultTaskPriority] || 'Medium'
        : dept.defaultTaskPriority
    }));
    
    return { data: departments };
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

// Get department by ID
export const getById$ = async (id: string) => {
  try {
    const response = await api.get(`/api/department/${id}`);
    
    // Convert numeric priority ID back to string for frontend
    const department = {
      ...response.data,
      defaultTaskPriority: typeof response.data.defaultTaskPriority === 'number' 
        ? ID_TO_PRIORITY[response.data.defaultTaskPriority] || 'Medium'
        : response.data.defaultTaskPriority
    };
    
    return { data: department };
  } catch (error) {
    console.error('Error fetching department:', error);
    throw error;
  }
};

// Create new department
export const create$ = async (data: DepartmentFormData) => {
  try {
    // Convert priority string to numeric ID for backend
    const backendData = {
      ...data,
      defaultTaskPriority: typeof data.defaultTaskPriority === 'string' 
        ? PRIORITY_TO_ID[data.defaultTaskPriority as keyof typeof PRIORITY_TO_ID]
        : data.defaultTaskPriority
    };
    
    const response = await api.post('/api/department', backendData);
    return { data: response.data };
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
};

// Update department
export const update$ = async (id: string, data: DepartmentFormData) => {
  try {
    // Convert priority string to numeric ID for backend
    const backendData = {
      ...data,
      defaultTaskPriority: typeof data.defaultTaskPriority === 'string' 
        ? PRIORITY_TO_ID[data.defaultTaskPriority as keyof typeof PRIORITY_TO_ID]
        : data.defaultTaskPriority
    };
    
    const response = await api.put('/api/department', backendData);
    return { data: response.data };
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

// Delete department
export const delete$ = async (id: string) => {
  try {
    const response = await api.delete(`/api/department/${id}`);
    return { data: response.data };
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};

// Toggle department status (hide/show) - uses DELETE endpoint
export const toggleActive$ = async (id: string) => {
  try {
    const response = await api.delete(`/api/department/${id}`);
    return { data: response.data };
  } catch (error) {
    console.error('Error toggling department status:', error);
    throw error;
  }
};

// Get department summary statistics
export const getSummary$ = async () => {
  try {
    const response = await api.get('/api/department/summary');
    return { data: response.data };
  } catch (error) {
    console.error('Error fetching department summary:', error);
    throw error;
  }
};

// Get available interventions for a service line
export const getInterventionsForServiceLine$ = async (serviceLine: string) => {
  try {
    const response = await api.get(`/api/department/interventions/${serviceLine}`);
    return { data: response.data };
  } catch (error) {
    console.error('Error fetching interventions:', error);
    // Fallback to static data if API fails
    const interventions = INTERVENTIONS_BY_SERVICE_LINE[serviceLine as keyof typeof INTERVENTIONS_BY_SERVICE_LINE] || [];
    return { data: interventions };
  }
};

// Get department heads for dropdown
export const getDepartmentHeads$ = async () => {
  try {
    const response = await api.get('/api/department/dept-heads');
    return { data: response.data };
  } catch (error) {
    console.error('Error fetching department heads:', error);
    throw error;
  }
};
