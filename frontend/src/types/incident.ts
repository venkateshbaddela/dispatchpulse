import type { User } from './auth';

export type IncidentSeverity = 'P1' | 'P2' | 'P3' | 'P4';
export type IncidentStatus = 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED';
export type IncidentErrorType = 'DATABASE' | 'API_TIMEOUT' | 'AUTH_SECURITY' | 'SERVER_CRASH' | 'PERFORMANCE';
export type IncidentEventType = 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED' | 'COMMENT' | 'AI_TRIAGE';

export interface AISummary {
  root_cause?: string;
  recommended_fix?: string;
  confidence?: number;
}

export interface IncidentLog {
  id: number;
  incident: string;
  actor: User | null;
  event_type: IncidentEventType;
  note: string;
  created_at: string;
}

export interface Incident {
  id: string;
  organization: string;
  service: string;
  service_name?: string;
  assigned_to: User | null;
  title: string;
  error_type: IncidentErrorType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  raw_logs: string;
  ai_summary: AISummary;
  acknowledged_at: string | null;
  resolved_at: string | null;
  created_at: string;
  logs?: IncidentLog[];
}

export interface AlertRule {
  id: number;
  service: string;
  service_name?: string;
  consecutive_failures: number;
  timeout_ms: number;
  is_active: boolean;
  created_at: string;
}

export interface UpdateAlertRulePayload {
  consecutive_failures?: number;
  timeout_ms?: number;
  is_active?: boolean;
}

export type OutageScenario = 'SERVER_CRASH' | 'DATABASE' | 'API_TIMEOUT' | 'AUTH_SECURITY' | 'PERFORMANCE';

export interface SimulateCrashPayload {
  service_id: string;
  scenario?: OutageScenario;
  custom_logs?: string;
}

export interface SimulateCrashResponse {
  message: string;
  service_id: string;
  service_name: string;
  service_status: string;
  incident: Incident;
}