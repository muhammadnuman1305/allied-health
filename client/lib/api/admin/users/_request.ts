import api from "../../axios";
import { UserFormData } from "./_model";
import { getUser } from "@/lib/auth-utils";

var accessToken = getUser()?.accessToken;
api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

export const getAll$ = async () => {
    return api.get("/api/user");
}

export const getSummary$ = async () => {
    return api.get("/api/user/summary");
}

export const getById$ = async (id: string) => {
    return api.get(`/api/user/${id}`);
}

export const create$ = async (payload: UserFormData) => {
    return api.post("/api/user", payload);
}

export const update$ = async (payload: UserFormData) => {
    return api.put(`/api/user`, payload);
}

export const toggleHide$ = async (id: string) => {
    return api.delete(`/api/user/${id}`);
}
