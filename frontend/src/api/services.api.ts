import { apiClient } from "./client";
import type { Service, KPISummary, HealthCheckLog, PublicStatusData, CreateServicePayload, UpdateServicePayload, BatchPingResult } from "../types/service";

export const servicesApi = {
    getServices: async (): Promise<Service[]> => {
        const response = await apiClient.get<Service[]>('/services/');
        return response.data;
    },

    getDashboardKpis: async (): Promise<KPISummary> => {
        const response = await apiClient.get<KPISummary>('/dashboard/kpis/');
        return response.data;
    },

    createService: async (data: CreateServicePayload): Promise<Service> => {
        const response = await apiClient.post<Service>('/services/', data);
        return response.data
    },

    updateService: async (serviceId: string, data: UpdateServicePayload): Promise<Service> => {
        const response = await apiClient.patch<Service>(`/services/${serviceId}/`, data);
        return response.data
    },
    
    deleteService: async (serviceId: string): Promise<void> => {
    await apiClient.delete(`/services/${serviceId}/`);
    },

    pingService: async (serviceId: string): Promise<HealthCheckLog> => {
        const response = await apiClient.post<HealthCheckLog>(`/services/${serviceId}/ping/`);
        return response.data
    },

    pingAllServices: async (): Promise<BatchPingResult> => {
    const response = await apiClient.post<BatchPingResult>('/services/ping-all/');  
    return response.data;
    },

    getPublicStatus: async (slug:string): Promise<PublicStatusData> => {
        const response = await apiClient.get<PublicStatusData>(`/status/${slug}/`)
        return response.data
    }
}