from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
        if status_param:
            statuses = [s.strip().upper() for s in status_param.split(',') if s.strip()] 
            queryset = queryset.filter(status__in=statuses)

        severity_param = self.request.query_params.get('severity')
        if severity_param:
            queryset = queryset.filter(severity=severity_param.upper())
        
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
        return AlertRule.objects.filter(service__organization=user.organization)

    