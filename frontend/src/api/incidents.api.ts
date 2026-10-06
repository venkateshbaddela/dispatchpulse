import { apiClient } from "./client";
import type {
  AlertRule,
  Incident,
  SimulateCrashPayload,
  SimulateCrashResponse,
  UpdateAlertRulePayload,
} from "../types/incident";

export interface GetIncidentsParams {
  status?: string;
  severity?: string;
  service?: string;
  service_id?: string;
  search?: string;
}

export const incidentsApi = {
  getIncidents: async (params?: GetIncidentsParams): Promise<Incident[]> => {
    const response = await apiClient.get<Incident[]>('/incidents/', { params });
    return response.data;
  },

  getIncidentById: async (incidentId: string): Promise<Incident> => {
    const response = await apiClient.get<Incident>(`/incidents/${incidentId}/`);
    return response.data;
  },

  acknowledgeIncident: async (incidentId: string, note?: string): Promise<Incident> => {
    const response = await apiClient.post<Incident>(`/incidents/${incidentId}/acknowledge/`, { note });
    return response.data;
  },

  resolveIncident: async (incidentId: string, note?: string): Promise<Incident> => {
    const response = await apiClient.post<Incident>(`/incidents/${incidentId}/resolve/`, { note });
    return response.data;
  },

  triageIncident: async (incidentId: string): Promise<Incident> => {
    const response = await apiClient.post<Incident>(`/incidents/${incidentId}/triage/`);
    return response.data;
  },

  assignIncident: async (incidentId: string, assignToId: number | null): Promise<Incident> => {
    const response = await apiClient.post<Incident>(`/incidents/${incidentId}/assign/`, {assigned_to: assignToId,})
    return response.data
  },

  getAlertRules: async (serviceId?: string): Promise<AlertRule[]> => {
    const params = serviceId ? { service: serviceId } : undefined;
    const response = await apiClient.get<AlertRule[]>('/alert-rules/', { params });
    return response.data;
  },

  updateAlertRule: async (ruleId: number, data: UpdateAlertRulePayload): Promise<AlertRule> => {
    const response = await apiClient.patch<AlertRule>(`/alert-rules/${ruleId}/`, data);
    return response.data;
  },

  simulateCrash: async (payload: SimulateCrashPayload): Promise<SimulateCrashResponse> => {
    const response = await apiClient.post<SimulateCrashResponse>('/simulator/crash/', payload);
    return response.data;
  },
};