import uuid
from django.conf import settings
from django.db import models

# Create your models here.

class Incident(models.Model):
    class Severity(models.TextChoices):
        P1 = "P1", "P1 - Critical"
        P2 = "P2", "P2 - High"
        P3 = "P3", "P3 - Moderate"
        P4 = "P4", "P4 - Low"

    class Status(models.TextChoices):
        TRIGGERED = "TRIGGERED", "Triggered"
        ACKNOWLEDGED = "ACKNOWLEDGED", "Acknowledged"
        RESOLVED = "RESOLVED", "Resolved"

    class ErrorType(models.TextChoices):
        DATABASE = "DATABASE", "Database"
        API_TIMEOUT = "API_TIMEOUT", "API Timeout"
        AUTH_SECURITY = "AUTH_SECURITY", "Auth / Security"
        SERVER_CRASH = "SERVER_CRASH", "Server Crash"
        PERFORMANCE = "PERFORMANCE", "Performance"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        related_name="incidents"
    )
    service = models.ForeignKey(
        "monitoring.Service",
        on_delete=models.PROTECT,
        related_name="incidents",
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_incidents",
    )
    title = models.CharField(max_length=255)
    error_type = models.CharField(
        max_length=30, 
        choices=ErrorType.choices, 
        default=ErrorType.SERVER_CRASH,
    )
    severity = models.CharField(
        max_length=2,
        choices=Severity.choices,
        default=Severity.P3,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TRIGGERED,
    )
    raw_logs = models.TextField(
        blank=True,
        default="",
        help_text="Stack trace or raw failure output",
    )
    ai_summary = models.JSONField(
        default=dict,
        blank=True,
        help_text="Structured root-cause diagnosis from AI triage",
    )
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.severity}] {self.title} ({self.status})"




class IncidentLog(models.Model):
    class EventType(models.TextChoices):
        TRIGGERED = "TRIGGERED", "Triggered"
        ACKNOWLEDGED = "ACKNOWLEDGED", "Acknowledged"
        RESOLVED = "RESOLVED", "Resolved"
        COMMENT = "COMMENT", "Comment"
        AI_TRIAGE = "AI_TRIAGE", "AI Triage"

    id = models.BigAutoField(primary_key=True)
    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name="logs",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="incident_logs",
    )
    event_type = models.CharField(
        max_length=20,
        choices=EventType.choices,
    )
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.event_type} on {self.incident.title} at {self.created_at}"


class AlertRule(models.Model):
    id = models.BigAutoField(primary_key=True)
    service = models.ForeignKey(
        "monitoring.Service",
        on_delete=models.CASCADE,
        related_name="alert_rules",
    )
    consecutive_failures = models.PositiveSmallIntegerField(default=3)
    timeout_ms = models.PositiveIntegerField(default=5000)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Rule for {self.service.name}: {self.consecutive_failures} fails / {self.timeout_ms}ms"