export type ServiceStatus = 'OPERATIONAL' | 'DEGRADED' | 'MAJOR_OUTAGE';

export interface HealthCheckLog {
  id: number;
  service: string;
  status_code: number | null;
  latency_ms: number | null;
  is_success: boolean;
  error_message: string;
  checked_at: string;
}

export interface Service {
  id: string;
  organization: string;
  name: string;
  target_url: string;
  status: ServiceStatus;
  check_interval_sec: number;
  last_checked_at: string | null;
  created_at: string;
  latest_check?: HealthCheckLog | null;
}

export interface KPISummary {
  total_services: number;
  active_incidents: number;
  system_status: ServiceStatus | string;
  avg_latency_ms: number;
  p1_incidents: number;
}

export interface PublicStatusServiceItem {
  name: string;
  status: ServiceStatus;
  last_checked_at: string | null;
}

export type PublicStatusService = PublicStatusServiceItem;

export interface PublicStatusData {
  organization: string;
  slug: string;
  overall_status: ServiceStatus;
  status?: ServiceStatus;
  services: PublicStatusServiceItem[];
}

export interface CreateServicePayload {
  name: string;
  target_url: string;
  check_interval_sec: number;
}

export interface UpdateServicePayload {
  name?: string;
  target_url?: string;
  check_interval_sec?: number
}

export interface BatchPingResult {
  total: number;
  success: number;
  failed: number;
}