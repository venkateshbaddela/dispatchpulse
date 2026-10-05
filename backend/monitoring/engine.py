import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.utils import timezone
import requests
from incidents.models import AlertRule, Incident, IncidentLog
from monitoring.models import HealthCheckLog, Service

def probe_single_service(service:Service) -> HealthCheckLog:
    """Probes a single service endpoint synchronously and records latency."""
    rule = AlertRule.objects.filter(service=service, is_active=True).first()
    timeout_seconds = (rule.timeout_ms / 1000.0) if rule else 5.0

    start_time = time.perf_counter()
    status_code = None
    is_success = False
    error_message = ""

    try:
        response = requests.get(
            service.target_url,
            timeout=timeout_seconds,
            headers={"User-Agent": "DispatchPulse-Pinger/1.0"}
        )
        status_code = response.status_code
        is_success = response.ok
        if not response.ok:
            error_message = f"HTTP {response.status_code}: {response.reason}"
    except requests.exceptions.Timeout:
        error_message = f"Connection timed out after {timeout_seconds}s"
    except requests.exceptions.ConnectionError:
        error_message = "Connection refused or DNS resolution failed"
    except requests.exceptions.RequestException as exc:
        error_message = str(exc)

    latency_ms = int((time.perf_counter() - start_time) * 1000)

    # Ingest Telemetry log
    log = HealthCheckLog.objects.create(
        service=service,
        status_code=status_code,
        latency_ms=latency_ms,
        is_success=is_success,
        error_message=error_message,
        checked_at=timezone.now(),
    )

    # Update service last checked timestamp
    service.last_checked_at = log.checked_at
    service.save(update_fields=["last_checked_at"])

    # Evaluate thresold state transition
    evaluate_alert_rules(service, rule)
    return log

def evaluate_alert_rules(service: Service, rule: AlertRule | None) -> Incident | None:
    """Evaluates recent telemetry logs against alert rules to transition between OPERATIONAL, DEGRADED, and MAJOR_OUTAGE."""

    if not rule or not rule.is_active:
        return None

    # Fetch recent logs up to the alert rule failure threshold
    window_size = max(rule.consecutive_failures, 3)
    recent_logs = list(
        HealthCheckLog.objects.filter(service=service).order_by("-checked_at")[:window_size]
    )

    if not recent_logs:
        return None

    latest_log = recent_logs[0]
    outage_window = recent_logs[: rule.consecutive_failures]
    has_full_outage_window = len(outage_window) >= rule.consecutive_failures

    # 1. Check for complete blackout streak (e.g. 3 consecutive failures in a row)
    all_failed = has_full_outage_window and all(not log.is_success for log in outage_window)

    # 2. Check for intermittent drops or high latency (Degraded threshold)
    any_failed = any(not log.is_success for log in recent_logs)
    is_high_latency = bool(latest_log.latency_ms and latest_log.latency_ms >= 1000)

    # Check if an unresolved incident already exists for this service
    active_incident = Incident.objects.filter(
        service=service,
        status__in=[Incident.Status.TRIGGERED, Incident.Status.ACKNOWLEDGED],
    ).first()

    # Case A: MAJOR_OUTAGE (Consecutive failures reached the alert threshold)
    if all_failed:
        if service.status != Service.ServiceStatus.MAJOR_OUTAGE:
            service.status = Service.ServiceStatus.MAJOR_OUTAGE
            service.save(update_fields=["status"])

        # If no active incident exists, trip a new P1 Incident
        if not active_incident:
            new_incident = Incident.objects.create(
                organization=service.organization,
                service=service,
                title=f"Outage detected: {service.name} failing health checks",
                error_type=Incident.ErrorType.SERVER_CRASH,
                severity=Incident.Severity.P1,
                status=Incident.Status.TRIGGERED,
                raw_logs=latest_log.error_message or f"{rule.consecutive_failures} consecutive health checks failed.",
            )
            IncidentLog.objects.create(
                incident=new_incident,
                actor=None,
                event_type=IncidentLog.EventType.TRIGGERED,
                note=f"Tripped automatically: {rule.consecutive_failures} consecutive failures recorded.",
            )
            return new_incident

    # Case B: DEGRADED (Intermittent failure drops OR high latency >= 1000ms)
    elif any_failed or is_high_latency:
        if service.status != Service.ServiceStatus.DEGRADED:
            service.status = Service.ServiceStatus.DEGRADED
            service.save(update_fields=["status"])

    # Case C: OPERATIONAL (All recent checks succeeded and latency is healthy)
    else:
        if service.status != Service.ServiceStatus.OPERATIONAL:
            service.status = Service.ServiceStatus.OPERATIONAL
            service.save(update_fields=["status"])

    return None

def probe_all_services_concurrently(organization=None, max_workers: int = 10) -> dict:
    """Dispatches health checks for all registered services concurrently."""
    qs = Service.objects.all()
    if organization is not None:
        qs = qs.filter(organization=organization)

    services = list(qs)
    if not services:
        return {"total": 0, "success":0, "failed": 0, "logs": []}

    results = {"total": len(services), "success":0, "failed": 0, "logs": []}

    # Parallelize network I/O across worker threads
    with ThreadPoolExecutor(max_workers=min(max_workers, len(services))) as executor:
        future_to_service = {
            executor.submit(probe_single_service, service):service
            for service in services
        }

        for future in as_completed(future_to_service):
            service = future_to_service[future]
            try:
                log = future.result()
                results["logs"].append(log)
                if log.is_success:
                    results["success"] += 1
                else:
                    results["failed"] += 1
            except Exception as exc:
                # Fallback safety in case of unexpected unhandled thread exceptions
                results["logs"].append({
                    "service_id": str(service.id),
                    "error": str(exc),
                })

    return results