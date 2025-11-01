import { Intervention, InterventionFormData, InterventionSummary } from "./_model";
import api from "../../axios";

// Get all interventions
export const getAll$ = async (statusFilter: "All" | "Active" | "Hidden" = "All") => {
	 let url = "/api/intervention";
	 if (statusFilter === "Hidden") {
		 url += "?$filter=hidden eq true";
	 } else if (statusFilter === "Active") {
		 url += "?$filter=hidden eq false or hidden eq null";
	 }
	 const response = await api.get(url);
	 return { data: response.data as Intervention[] };
};

// Get intervention by ID
export const getById$ = async (id: string) => {
	 const response = await api.get(`/api/intervention/${id}`);
	 return { data: response.data as Intervention };
};

// Create new intervention
export const create$ = async (data: InterventionFormData) => {
	 const response = await api.post("/api/intervention", data);
	 return { data: response.data as Intervention };
};

// Update intervention
export const update$ = async (id: string, data: InterventionFormData) => {
	 const response = await api.put("/api/intervention", { ...data, id });
	 return { data: response.data as Intervention };
};

// Delete/Restore intervention
export const toggleActive$ = async (id: string) => {
	 const response = await api.delete(`/api/intervention/${id}`);
	 return { data: response.data };
};

// Summary
export const getSummary$ = async () => {
	 const response = await api.get("/api/intervention/summary");
	 return { data: response.data as InterventionSummary };
};

// Get specialty options for interventions
export const getSpecialtyOptions$ = async () => {
	 const response = await api.get("/api/intervention/specialties");
	 return { data: response.data };
};


