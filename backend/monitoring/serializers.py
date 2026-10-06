from rest_framework import serializers
from .models import Service, HealthCheckLog

class HealthCheckLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthCheckLog
        fields = [
            'id',
            'service',
            'status_code',
            'latency_ms',
            'is_success',
            'error_message',
            'checked_at',
        ]
        read_only_fields = fields

class ServiceSerializer(serializers.ModelSerializer):
    latest_check = serializers.SerializerMethodField()
    alert_rule = serializers.SerializerMethodField()
    recent_checks = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id',
            'organization',
            'name',
            'target_url',
            'status',
            'check_interval_sec',
            'last_checked_at',
            'created_at',
            'latest_check',
            'alert_rule',
            'recent_checks',
        ]
        read_only_fields = [
            'id',
            'organization',
            'status',
            'last_checked_at',
            'created_at',
            'latest_check',
            'alert_rule',
            'recent_checks',
        ]

    def get_latest_check(self, obj):
        latest = obj.health_logs.order_by('-checked_at').first()
        if latest:
            return HealthCheckLogSerializer(latest).data
        return None

    def get_alert_rule(self, obj):
        rule = obj.alert_rules.filter(is_active=True).first() or obj.alert_rules.first()
        if rule:
            return {
                "id": rule.id,
                "consecutive_failures": rule.consecutive_failures,
                "timeout_ms": rule.timeout_ms,
                "is_active": rule.is_active,
            }
        return None

    def get_recent_checks(self, obj):
        logs = list(obj.health_logs.order_by('-checked_at')[:30])
        logs.reverse()
        return [
            {
                "id": log.id,
                "is_success": log.is_success,
                "status_code": log.status_code,
                "latency_ms": log.latency_ms,
                "checked_at": log.checked_at.isoformat(),
            }
            for log in logs
        ]