import { apiClient } from "./client";
import type { Incident } from "../types/incident";

export const incidentsApi = {
    getIncidents: async (params?:{status?: string; severity?:string}): Promise<Incident[]> => {
        const response = await apiClient.get<Incident[]>('/incidents/', {params});
        return response.data;
    },

    getIncidentById: async (incidentId: string): Promise<Incident> => {
        const response = await apiClient.get<Incident>(`/incidents/${incidentId}/`);
        return response.data;
    },

    acknowledgeIncident: async (incidentId: string, note?: string): Promise<Incident> => {
        const response = await apiClient.post<Incident>(`/incidents/${incidentId}/acknowledge/`, {note});
        return response.data;
    },

    resolveIncident: async (incidentId: string, note?: string): Promise<Incident> => {
        const response = await apiClient.post<Incident>(`/incidents/${incidentId}/resolve/`, {note});
        return response.data;
    },

    triageIncident: async(incidentId: string): Promise<Incident> => {
        const response = await apiClient.post<Incident>(`/incidents/${incidentId}/triage/`);
        return response.data
    }
};