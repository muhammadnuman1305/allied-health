import { Specialty, SpecialtyFormData, SpecialtySummary, SpecialtyOption } from "./_model";
import api from "../../axios";

// Get all specialties
export const getAll$ = async (statusFilter: "All" | "Active" | "Hidden" = "All") => {
	 let url = "/api/specialty";
	 if (statusFilter === "Hidden") {
		 url += "?$filter=hidden eq true";
	 } else if (statusFilter === "Active") {
		 url += "?$filter=hidden eq false or hidden eq null";
	 }
	 const response = await api.get(url);
	 return { data: response.data as Specialty[] };
};

// Get specialty by ID
export const getById$ = async (id: string) => {
	 const response = await api.get(`/api/specialty/${id}`);
	 return { data: response.data as Specialty };
};

// Create new specialty
export const create$ = async (data: SpecialtyFormData) => {
	 const response = await api.post("/api/specialty", data);
	 return { data: response.data as Specialty };
};

// Update specialty
export const update$ = async (id: string, data: SpecialtyFormData) => {
	 const response = await api.put("/api/specialty", { ...data, id });
	 return { data: response.data as Specialty };
};

// Delete/Restore specialty
export const toggleActive$ = async (id: string) => {
	 const response = await api.delete(`/api/specialty/${id}`);
	 return { data: response.data };
};

// Summary
export const getSummary$ = async () => {
	 const response = await api.get("/api/specialty/summary");
	 return { data: response.data as SpecialtySummary };
};

// Options for selects
export const getOptions$ = async () => {
	 const response = await api.get("/api/specialty/options");
	 return { data: response.data as SpecialtyOption[] };
};


