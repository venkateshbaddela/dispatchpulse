import { apiClient } from "./client";
import type { AuthResponse, LoginCredentials, RegisterPayload, User } from "../types/auth";

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login/', credentials);
        return response.data
    },

    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register/', payload);
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get<User>('/auth/me/');
        return response.data;
    },

    logout: async (): Promise<void> => {
        try {
            await apiClient.post('/auth/logout/');
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user')
        }
    },
};