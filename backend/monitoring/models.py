import uuid
from django.db import models

# Create your models here.



class Service(models.Model):
    class ServiceStatus(models.TextChoices):
        OPERATIONAL = 'OPERATIONAL', 'Operational',
        DEGRADED = 'DEGRADED', 'Degraded',
        MAJOR_OUTAGE = 'MAJOR_OUTAGE', 'Major Outage'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'accounts.Organization',
        on_delete=models.CASCADE,
        related_name='services'
    )
    name = models.CharField(max_length=120)
    target_url = models.URLField(
        help_text="Live URL to health check, e.g. https://httpbin.org/status/200"
    )
    status = models.CharField(
        max_length=20,
        choices=ServiceStatus.choices,
        default=ServiceStatus.OPERATIONAL
    )
    check_interval_sec = models.PositiveIntegerField(default=60)
    last_checked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.status})"

class HealthCheckLog(models.Model):
    id = models.BigAutoField(primary_key=True)
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name='health_logs'
    )
    status_code = models.PositiveSmallIntegerField(null=True, blank=True)
    latency_ms = models.PositiveIntegerField(null=True, blank=True)
    is_success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True, default='')
    checked_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-checked_at']

    def __str__(self):
        return f"{self.service.name} - {self.status_code} ({self.latency_ms}ms) at {self.checked_at}"