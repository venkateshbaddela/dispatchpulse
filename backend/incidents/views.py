import uuid
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from monitoring.models import Service, HealthCheckLog
from .models import AlertRule, Incident, IncidentLog
from .serializers import AlertRuleSerializer, IncidentLogSerializer, IncidentSerializer
from .ai import analyze_incident
# Create your views here.

class IncidentViewSet(viewsets.ModelViewSet):
    serializer_class = IncidentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.organization:
            return Incident.objects.none()

        queryset = (
            Incident.objects.filter(organization=user.organization)
            .select_related('service', 'assigned_to')
            .prefetch_related('logs', 'logs__actor')
        )

        status_param = self.request.query_params.get('status')
        if status_param and status_param.strip().upper() != 'ALL':
            statuses = [s.strip().upper() for s in status_param.split(',') if s.strip()] 
            if statuses:
                queryset = queryset.filter(status__in=statuses)

        severity_param = self.request.query_params.get('severity')
        if severity_param and severity_param.strip().upper() != 'ALL':
            queryset = queryset.filter(severity=severity_param.strip().upper())

        service_param = self.request.query_params.get('service_id') or self.request.query_params.get('service')
        if service_param and service_param.strip().lower() != 'all':
            service_clean = service_param.strip()
            try:
                uuid.UUID(str(service_clean))
                queryset = queryset.filter(service_id=service_clean)
            except (ValueError, AttributeError):
                queryset = queryset.filter(service__name__iexact=service_clean)

        search_param = self.request.query_params.get('search')
        if search_param:
            query = search_param.strip()
            if query:
                queryset = queryset.filter(
                    Q(title__icontains=query) |
                    Q(raw_logs__icontains=query) |
                    Q(service__name__icontains=query) |
                    Q(error_type__icontains=query)
                )
        
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

    @action(detail=True, methods=['post'], url_path='acknowledge')
    def acknowledge(self, request, pk=None):
        """Transition incident from TRIGGERED to -> ACKNOWLEDGED."""
        incident = self.get_object()

        if incident.status != Incident.Status.TRIGGERED:
            return Response(
                {'detail': f"Cannot acknowledge incident with status '{incident.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        incident.status = Incident.Status.ACKNOWLEDGED
        incident.acknowledged_at = timezone.now()
        if not incident.assigned_to:
            incident.assigned_to = request.user
        incident.save()

        IncidentLog.objects.create(
            incident=incident,
            actor=request.user,
            event_type=IncidentLog.EventType.ACKNOWLEDGED,
            note=f"Incident acknowledged by {request.user.email}.",
        )

        return Response(IncidentSerializer(incident).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve(self, request, pk=None):
        """Transition incident from ACKNOWLEDGED (or TRIGGERED) -> RESOLVED."""
        incident = self.get_object()

        if incident.status == Incident.Status.RESOLVED:
            return Response(
                {'detail': "Incident is already resolved."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        incident.status = Incident.Status.RESOLVED
        incident.resolved_at = timezone.now()
        incident.save()

        note_text = request.data.get(
            'note', f"Incident marked resolved by '{request.user.email}'."
        )

        IncidentLog.objects.create(
            incident=incident,
            actor=request.user,
            event_type=IncidentLog.EventType.RESOLVED,
            note=note_text,
        )

        return Response(IncidentSerializer(incident).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path="triage")
    def triage(self, request, pk=None):
        """Run AI root-cause analysis on incident telemetry and update ai_summary. """    
        incident = self.get_object()

        diagnosis = analyze_incident(
            raw_logs=incident.raw_logs,
            error_type=incident.error_type,
            title=incident.title
        )

        incident.ai_summary = diagnosis
        incident.save(update_fields=['ai_summary'])

        confidence_pct = int(diagnosis.get('confidence', 0.0) * 100)
        IncidentLog.objects.create(
            incident=incident,
            actor=request.user,
            event_type=IncidentLog.EventType.AI_TRIAGE,
            note=f"AI Triage generated ({confidence_pct}% confidence): {diagnosis.get('root_cause', '')}",
        )

        return Response(IncidentSerializer(incident).data, status=status.HTTP_200_OK)

class AlertRuleViewset(viewsets.ModelViewSet):
    serializer_class = AlertRuleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.organization:
            return AlertRule.objects.none()
        queryset = AlertRule.objects.filter(service__organization=user.organization)
        service_param = self.request.query_params.get('service') or self.request.query_params.get('service_id')
        if service_param:
            queryset = queryset.filter(service_id=service_param)
        return queryset

    def perform_create(self, serializer):
        service = serializer.validated_data.get('service')
        if service.organization != self.request.user.organization:
            raise serializers.ValidationError({"service": "You cannot configure rules for another organization's service."})
        serializer.save()

    def perform_update(self, serializer):
        service = serializer.instance.service
        if service.organization != self.request.user.organization:
            raise serializers.ValidationError({"service": "You cannot modify rules for another organization's service."})
        serializer.save()


SIMULATION_SCENARIOS = {
    "SERVER_CRASH": {
        "title_template": "CRITICAL: Unhandled runtime panic in {service_name}",
        "error_type": Incident.ErrorType.SERVER_CRASH,
        "status_code": 500,
        "raw_logs": (
            "Traceback (most recent call last):\n"
            "  File \"/app/workers/request_handler.py\", line 142, in process_event\n"
            "    raise RuntimeError(\"SIGSEGV: Worker process 481 terminated unexpectedly. "
            "Memory limit exceeded (1024MB allocated, peak 1420MB)\")\n"
            "RuntimeError: SIGSEGV: Worker process 481 terminated unexpectedly."
        ),
    },
    "DATABASE": {
        "title_template": "FATAL: Database connection pool exhausted for {service_name}",
        "error_type": Incident.ErrorType.DATABASE,
        "status_code": 500,
        "raw_logs": (
            "django.db.utils.OperationalError: FATAL: remaining connection slots are reserved for non-replication superuser connections\n"
            "psycopg.OperationalError: connection to server at \"db.internal.acme.com\" (10.0.4.12), port 5432 failed: "
            "FATAL: too many connections for role \"dispatch_app\" (max_connections=100 exhausted)\n"
            "  File \"/app/db/pool.py\", line 88, in acquire_connection\n"
            "    raise PoolTimeoutError(\"Timed out waiting for connection from pool after 15000ms\")"
        ),
    },
    "API_TIMEOUT": {
        "title_template": "GATEWAY TIMEOUT: HTTP 504 on {service_name}",
        "error_type": Incident.ErrorType.API_TIMEOUT,
        "status_code": 504,
        "raw_logs": (
            "requests.exceptions.ConnectTimeout: HTTPSConnectionPool(host='api.gateway.internal', port=443): "
            "Max retries exceeded with url: /v1/checkout (Caused by ConnectTimeoutError: Request timed out after 10000ms)\n"
            "HTTP 504 Gateway Timeout emitted by upstream envoy-ingress-02 reverse proxy."
        ),
    },
    "AUTH_SECURITY": {
        "title_template": "SECURITY ALERT: JWT signature verification failure on {service_name}",
        "error_type": Incident.ErrorType.AUTH_SECURITY,
        "status_code": 401,
        "raw_logs": (
            "jwt.exceptions.InvalidSignatureError: Signature verification failed for token header kid=\"auth-key-2026-v2\". "
            "Upstream JWKS endpoint returned rotated public key mismatch.\n"
            "HTTP 401 Unauthorized: Signature verification rejected across all 3 redundant auth nodes."
        ),
    },
    "PERFORMANCE": {
        "title_template": "DEGRADED: High latency threshold exceeded on {service_name}",
        "error_type": Incident.ErrorType.PERFORMANCE,
        "status_code": 200,
        "raw_logs": (
            "Telemetry Alert: P99 latency exceeded 4850ms (threshold: 1000ms).\n"
            "Excessive I/O wait detected on disk volume vol-08912eb (queue depth > 64, read latency 89ms)."
        ),
    },
}


class OutageSimulatorView(APIView):
    """
    Simulates a service crash / outage for Chaos Engineering & AI Triage testing.
    Ingests failure telemetry, flips service status to MAJOR_OUTAGE, and trips a P1 Incident.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user.organization:
            return Response(
                {"detail": "User has no associated organization."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service_id = request.data.get("service_id")
        if not service_id:
            return Response(
                {"service_id": ["Target service_id is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            service = Service.objects.get(id=service_id, organization=user.organization)
        except (Service.DoesNotExist, ValueError):
            return Response(
                {"detail": "Service not found or does not belong to your organization."},
                status=status.HTTP_404_NOT_FOUND,
            )

        scenario_key = str(request.data.get("scenario", "SERVER_CRASH")).strip().upper()
        scenario = SIMULATION_SCENARIOS.get(scenario_key, SIMULATION_SCENARIOS["SERVER_CRASH"])

        custom_logs = request.data.get("custom_logs", "").strip()
        raw_logs = custom_logs if custom_logs else scenario["raw_logs"]

        now = timezone.now()

        # 1. Ingest failing HealthCheckLog
        HealthCheckLog.objects.create(
            service=service,
            status_code=scenario["status_code"],
            latency_ms=4500,
            is_success=False,
            error_message=f"Simulated {scenario_key}: {scenario['title_template'].format(service_name=service.name)}",
            checked_at=now,
        )

        # 2. Update service status to MAJOR_OUTAGE
        service.status = Service.ServiceStatus.MAJOR_OUTAGE
        service.last_checked_at = now
        service.save(update_fields=["status", "last_checked_at"])

        # 3. Create P1 Incident with TRIGGERED status
        title = scenario["title_template"].format(service_name=service.name)
        incident = Incident.objects.create(
            organization=user.organization,
            service=service,
            title=title,
            error_type=scenario["error_type"],
            severity=Incident.Severity.P1,
            status=Incident.Status.TRIGGERED,
            raw_logs=raw_logs,
        )

        # 4. Create IncidentLog entry
        IncidentLog.objects.create(
            incident=incident,
            actor=user,
            event_type=IncidentLog.EventType.TRIGGERED,
            note=f"Simulated outage ({scenario_key}) injected by {user.email} via Outage Simulator.",
        )

        return Response(
            {
                "message": f"Simulated outage '{scenario_key}' injected successfully on {service.name}.",
                "service_id": str(service.id),
                "service_name": service.name,
                "service_status": service.status,
                "incident": IncidentSerializer(incident).data,
            },
            status=status.HTTP_201_CREATED,
        )

    