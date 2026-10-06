from rest_framework import serializers
from .models import Incident, IncidentLog, AlertRule
from accounts.serializers import UserSerializer

class IncidentLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source='actor.email', read_only=True)
    actor = UserSerializer(read_only=True)
    class Meta:
        model = IncidentLog
        fields = [
            'id',
            'incident',
            'actor',
            'actor_email',
            'event_type',
            'note',
            'created_at',
        ]
        read_only_fields = fields

class AlertRuleSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)

    class Meta:
        model = AlertRule
        fields = [
            'id',
            'service',
            'service_name',
            'consecutive_failures',
            'timeout_ms',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

class IncidentSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    assigned_to_email = serializers.EmailField(source='assigned_to.email', read_only=True)
    logs = IncidentLogSerializer(many=True, read_only=True)
    assigned_to = UserSerializer(read_only=True)
    
    class Meta:
        model = Incident
        fields = [
            'id',
            'organization',
            'service',
            'service_name',
            'assigned_to',
            'assigned_to_email',
            'title',
            'error_type',
            'severity',
            'status',
            'raw_logs',
            'ai_summary',
            'acknowledged_at',
            'resolved_at',
            'created_at',
            'logs',
        ]
        read_only_fields = [
            'id',
            'organization',
            'status',
            'ai_summary',
            'acknowledged_at',
            'resolved_at',
            'created_at',
            'logs',
        ]