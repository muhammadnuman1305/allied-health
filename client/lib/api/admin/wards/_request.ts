import { Ward, WardFormData, WardSummary, WARD_LOCATIONS } from "./_model";
import api from "../../axios";

// Get all wards
export const getAll$ = async (statusFilter: "All" | "Active" | "Hidden" = "All") => {
  let url = '/api/ward';
  
  // Add OData filter based on hidden field
  if (statusFilter === "Hidden") {
    url += '?$filter=hidden eq true';
  } else if (statusFilter === "Active") {
    url += '?$filter=hidden eq false or hidden eq null';
  }
  // For "All", no filter is applied
  
  const response = await api.get(url);
  return { data: response.data };
};

// Get ward by ID
export const getById$ = async (id: string) => {
  const response = await api.get(`/api/ward/${id}`);
  return { data: response.data };
};

// Create new ward
export const create$ = async (data: WardFormData) => {
  const response = await api.post("/api/ward", data);
  return { data: response.data };
};

// Update ward
export const update$ = async (id: string, data: WardFormData) => {
  const response = await api.put("/api/ward", { ...data, id });
  return { data: response.data };
};

// Delete ward
export const delete$ = async (id: string) => {
  const response = await api.delete(`/api/ward/${id}`);
  return { data: response.data };
};

// Toggle ward active status (Delete/Restore)
export const toggleActive$ = async (id: string, action: "delete" | "restore" = "delete") => {
  // Both delete and restore use the same DELETE endpoint
  const response = await api.delete(`/api/ward/${id}`);
  return { data: response.data };
};

// Get ward summary statistics
export const getSummary$ = async () => {
  const response = await api.get("/api/ward/summary");
  return { data: response.data };
};

// Get wards by department coverage
export const getByDepartment$ = async (departmentId: string) => {
  const response = await api.get(`/api/ward/by-department/${departmentId}`);
  return { data: response.data };
};

// Update ward coverage departments
export const updateCoverage$ = async (id: string, departmentIds: string[]) => {
  const response = await api.put(`/api/ward/${id}/coverage`, { departmentIds });
  return { data: response.data };
};

// Set default department for ward
export const setDefaultDepartment$ = async (id: string, departmentId: string) => {
  const response = await api.put(`/api/ward/${id}/default-department`, { departmentId });
  return { data: response.data };
};

// Get default department options
export const getDefaultDepartmentOptions$ = async () => {
  const response = await api.get("/api/ward/get-dept");
  return { data: response.data };
};