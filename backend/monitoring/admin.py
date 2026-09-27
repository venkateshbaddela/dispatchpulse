from django.contrib import admin
from .models import Service, HealthCheckLog
# Register your models here.

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'target_url', 'status', 'organization', 'last_checked_at')
    list_filetr = ('status', 'organization')
    search_fields = ('name', 'target_url')

@admin.register(HealthCheckLog)
class HealthCheckLogAdmin(admin.ModelAdmin):
    list_display = ('service', 'status_code', "latency_ms", 'is_success', 'checked_at')
    list_filter = ('is_success', 'status_code')
    search_fields = ('service_name', 'error_message')
    readonly_fields = ('checked_at',)
