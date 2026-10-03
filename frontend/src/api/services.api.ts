import { apiClient } from "./client";
import type { Service, KPISummary, HealthCheckLog } from "../types/service";

export const servicesApi = {
    getServices: async (): Promise<Service[]> => {
        const response = await apiClient.get<Service[]>('/services/');
        return response.data;
    },

    getDashboardKpis: async (): Promise<KPISummary> => {
        const response = await apiClient.get<KPISummary>('/dashboard/kpis/');
        return response.data;
    },

    pingService: async (serviceId: string): Promise<HealthCheckLog> => {
        const response = await apiClient.post<HealthCheckLog>(`/services/${serviceId}/ping/`);
        return response.data
    }
}