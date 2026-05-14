import api from "../../axios";
import { CreateVacationRequestDTO, ReviewVacationRequestDTO, VacationRequest } from "./_model";

const AHP_URL = "/api/vacation";
const AHA_URL = "/api/aha-vacation";

// AHP: get all vacation requests
export const getAllVacationRequests$ = async (): Promise<{ data: VacationRequest[] }> => {
  const response = await api.get<VacationRequest[]>(AHP_URL);
  return { data: response.data };
};

// AHP: approve or reject a request
export const reviewVacationRequest$ = async (payload: ReviewVacationRequestDTO): Promise<void> => {
  await api.put(`${AHP_URL}/review`, payload);
};

// AHA: get own vacation requests
export const getMyVacationRequests$ = async (): Promise<{ data: VacationRequest[] }> => {
  const response = await api.get<VacationRequest[]>(AHA_URL);
  return { data: response.data };
};

// AHA: submit a new vacation request
export const createVacationRequest$ = async (payload: CreateVacationRequestDTO): Promise<void> => {
  await api.post(AHA_URL, payload);
};
