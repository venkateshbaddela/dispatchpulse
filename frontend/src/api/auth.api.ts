import { apiClient } from "./client";
import type { AuthResponse, LoginCredentials, RegisterPayload, User, InviteMemberPayload, UpdateUserPayload } from "../types/auth";

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
                                                                                          
    // Team & Responder Management                                                              
    getUsers: async (): Promise<User[]> => {                                                    
        const response = await apiClient.get<User[]>('/users/');                                  
        return response.data;                                                                     
    },                                                                                          
                                                                                                
    toggleOnCall: async (userId: number): Promise<User> => {                                    
        const response = await apiClient.post<User>(`/users/${userId}/toggle-on-call/`);          
        return response.data;                                                                     
    },                                                                                          

    updateUser: async (userId: number, payload: UpdateUserPayload): Promise<User> => {          
        const response = await apiClient.patch<User>(`/users/${userId}/`, payload);
        return response.data;
    },

    inviteUser: async (payload: InviteMemberPayload): Promise<User> => {
        const response = await apiClient.post<User>('/users/', payload);
        return response.data;
    },
};