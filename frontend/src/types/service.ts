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
  system_status: string;
  avg_latency_ms: number;
  p1_incidents: number;
}