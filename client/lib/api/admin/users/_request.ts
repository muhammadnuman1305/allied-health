import api from "../../axios";
import { UserFormData } from "./_model";
const BASE_URL = "/api/user";

export const getAll$ = async () => {
    return api.get(`${BASE_URL}`);

}

export const getSummary$ = async () => {
    return api.get(`${BASE_URL}/summary`);
}

export const getById$ = async (id: string) => {
    return api.get(`${BASE_URL}/${id}`);
}

export const create$ = async (payload: UserFormData) => {
    return api.post(`${BASE_URL}`, payload);
}

export const update$ = async (payload: UserFormData) => {
    return api.put(`${BASE_URL}`, payload);
}

export const toggleHide$ = async (id: string) => {
    return api.delete(`${BASE_URL}/${id}`);
}