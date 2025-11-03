import { Referral, ReferralFormData, ReferralSummary, ReferralAPIResponse } from "./_model";
import api from "../../axios";
import { getUser } from "@/lib/auth-utils";

const BASE_URL = "/api/referral";

// Helper to convert priority string (P1, P2, P3) to number (1, 2, 3)
const priorityToNumber = (priority: "P1" | "P2" | "P3"): number => {
  switch (priority) {
    case "P1":
      return 1;
    case "P2":
      return 2;
    case "P3":
      return 3;
    default:
      return 2; // Default to medium priority
  }
};

// Helper to convert priority number (1, 2, 3) to string (P1, P2, P3)
const priorityToString = (priority: number): "P1" | "P2" | "P3" => {
  switch (priority) {
    case 1:
      return "P1";
    case 2:
      return "P2";
    case 3:
      return "P3";
    default:
      return "P2";
  }
};

// Transform frontend ReferralFormData to backend AddUpdateReferralDTO
// Note: Using PascalCase to match C# DTO property names exactly
interface AddUpdateReferralDTO {
  Id?: string | null;
  PatientId: number;
  OriginDeptId: string;
  DestinationDeptId: string;
  TherapistId: string;
  Priority: number;
  Diagnosis: string;
  Goals: string;
  Description?: string | null;
  Interventions: string[];
}

const transformToBackendDTO = (formData: ReferralFormData, therapistId: string): AddUpdateReferralDTO => {
  // Convert patientId from string to number
  const patientIdNum = parseInt(formData.patientId, 10);
  if (isNaN(patientIdNum)) {
    throw new Error("Invalid patientId: must be a number");
  }

  // Validate required fields
  if (!formData.originDepartment) {
    throw new Error("Origin department is required");
  }
  if (!formData.destinationDepartment) {
    throw new Error("Destination department is required");
  }
  if (!formData.diagnosis) {
    throw new Error("Diagnosis is required");
  }
  if (!formData.goals) {
    throw new Error("Goals are required");
  }

  return {
    Id: formData.id || null,
    PatientId: patientIdNum,
    OriginDeptId: formData.originDepartment,
    DestinationDeptId: formData.destinationDepartment,
    TherapistId: therapistId,
    Priority: priorityToNumber(formData.priority),
    Diagnosis: formData.diagnosis || "",
    Goals: formData.goals || "",
    Description: formData.clinicalInstructions || null,
    Interventions: formData.interventions || [],
  };
};

// Helper to convert priority P1/P2/P3 to High/Medium/Low
// Note: P1 maps to 1 (Low), P2 maps to 2 (Medium), P3 maps to 3 (High)
const priorityToDisplayText = (priority: "P1" | "P2" | "P3"): "High" | "Medium" | "Low" => {
  switch (priority) {
    case "P1":
      return "Low";  // 1 -> Low
    case "P2":
      return "Medium";  // 2 -> Medium
    case "P3":
      return "High";  // 3 -> High
    default:
      return "Medium";
  }
};

// Transform API response to frontend format
const transformReferral = (apiReferral: ReferralAPIResponse): Referral => {
  const priorityStr = priorityToString(apiReferral.priority);
  return {
    id: apiReferral.id,
    type: apiReferral.type,
    patientId: apiReferral.patientId.toString(),
    patientName: apiReferral.patientName,
    referralDate: apiReferral.referralDate,
    priority: priorityStr,
    priorityNumber: apiReferral.priority,
    priorityDisplay: priorityToDisplayText(priorityStr),
    originDeptId: apiReferral.originDeptId,
    originDeptName: apiReferral.originDeptName,
    originDepartment: apiReferral.originDeptName,
    destinationDeptId: apiReferral.destinationDeptId,
    destinationDeptName: apiReferral.destinationDeptName,
    destinationDepartment: apiReferral.destinationDeptName,
    therapistId: apiReferral.therapistId,
    therapistName: apiReferral.therapistName,
    referringTherapist: apiReferral.therapistName,
    diagnosis: apiReferral.diagnosis || undefined,
    goals: apiReferral.goals || undefined,
    clinicalInstructions: apiReferral.description || undefined,
    lastUpdated: apiReferral.lastUpdated,
    updatedAt: apiReferral.lastUpdated,
    hidden: apiReferral.hidden,
  };
};

export const getAll$ = async (type?: "incoming" | "outgoing"): Promise<{ data: Referral[] }> => {
  let url = BASE_URL;
  
  // Add OData filter for type filtering
  if (type) {
    url += `?$filter=type eq '${type}'`;
  }
  
  const response = await api.get<ReferralAPIResponse[]>(url);
  return { data: response.data.map(transformReferral) };
};

export const getById$ = async (id: string): Promise<{ data: Referral }> => {
  const response = await api.get<ReferralAPIResponse>(`${BASE_URL}/${id}`);
  return { data: transformReferral(response.data) };
};

export const getSummary$ = async (): Promise<{ data: ReferralSummary }> => {
  const response = await api.get<ReferralSummary>(`${BASE_URL}/summary`);
  return { data: response.data };
};

export const create$ = async (referral: ReferralFormData): Promise<{ data: Referral }> => {
  const user = getUser();
  if (!user || !user.id) {
    throw new Error("User must be authenticated to create a referral");
  }

  try {
    const payload = transformToBackendDTO(referral, user.id);
    console.log("Sending referral payload:", JSON.stringify(payload, null, 2));
    const response = await api.post<Referral>(BASE_URL, payload);
    return { data: response.data };
  } catch (error: any) {
    console.error("Error creating referral:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    throw error;
  }
};

export const update$ = async (referral: ReferralFormData): Promise<{ data: Referral }> => {
  if (!referral.id) {
    throw new Error("Referral ID is required for update");
  }

  const user = getUser();
  if (!user || !user.id) {
    throw new Error("User must be authenticated to update a referral");
  }

  try {
    const payload = transformToBackendDTO(referral, user.id);
    console.log("Updating referral payload:", JSON.stringify(payload, null, 2));
    const response = await api.put<Referral>(BASE_URL, payload);
    return { data: response.data };
  } catch (error: any) {
    console.error("Error updating referral:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    throw error;
  }
};

export const toggleActive$ = async (id: string): Promise<{ data: Referral }> => {
  const response = await api.patch<Referral>(`${BASE_URL}/${id}/toggle-active`);
  return { data: response.data };
};

export const completeReferral$ = async (id: string, outcomeNotes: string): Promise<{ data: Referral }> => {
  const response = await api.post<Referral>(`${BASE_URL}/${id}/complete`, { outcomeNotes });
  return { data: response.data };
};


