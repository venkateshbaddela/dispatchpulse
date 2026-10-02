import { apiClient } from "./client";
import type { Incident } from "../types/incident";

export const incidentsApi = {
    list: async (statusFilter?: string): Promise<Incident[]> => {
        const params = statusFilter ? {status: statusFilter} : {};
        const response = await apiClient.get<Incident[]>('/incidents/', {params});
        return response.data;
    },

    getById: async (incidentId: string): Promise<Incident> => {
        const response = await apiClient.get<Incident>(`/incidents/${incidentId}/`);
        return response.data;
    },

    acknowledge: async (incidentId: string, note?: string): Promise<Incident> => {
        const response = await apiClient.post<Incident>(`/incidents/${incidentId}/acknowledge/`, {note});
        return response.data;
    },

    resolve: async (incidentId: string, note?: string): Promise<Incident> => {
        const response = await apiClient.post<Incident>(`/incidents/${incidentId}/resolve/`, {note});
        return response.data;
    },
};