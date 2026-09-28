from django.contrib import admin
from .models import Incident, IncidentLog, AlertRule
# Register your models here.

class IncidentLogInline(admin.TabularInline):
    model = IncidentLog
    extra = 1
    readonly_fields = ("created_at",)
    fields = ("event_type", "actor", "note", "created_at")

@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "severity",
        "status",
        "service",
        "organization",
        "assigned_to",
        "created_at",
    )
    list_filter = ("status", "severity", "error_type", "organization")
    search_fields = ("title", "raw_logs", "service__name")
    readonly_fields = ("id", "created_at", "acknowledged_at", "resolved_at")
    inlines = [IncidentLogInline]
    fieldsets = (
        ("Core Information", {
            "fields": ("id", "organization", "service", "title", "assigned_to")
        }),
        ("Classification", {
            "fields": ("severity", "status", "error_type")
        }),
        ("Diagnostics & AI", {
            "fields": ("raw_logs", "ai_summary")
        }),
        ("Timestamps", {
            "fields": ("created_at", "acknowledged_at", "resolved_at")
        }),
    )

@admin.register(IncidentLog)
class IncidentLogAdmin(admin.ModelAdmin):
    list_display = ("incident", "event_type", "actor", "created_at")
    list_filter = ("event_type", "created_at")
    search_fields = ("incident__title", "note")
    readonly_fields = ("created_at",)


@admin.register(AlertRule)
class AlertRuleAdmin(admin.ModelAdmin):
    list_display = ("service", "consecutive_failures", "timeout_ms", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("service__name",)