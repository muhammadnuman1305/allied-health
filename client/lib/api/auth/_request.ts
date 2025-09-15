import api from "../axios";
import { LoginPayload } from "./_model";


export const login$ = async (payload: LoginPayload) => {
    return api.post("/auth/login", payload);
}
