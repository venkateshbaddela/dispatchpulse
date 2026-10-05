from datetime import timedelta
from django.db.models import Avg
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Organization
from incidents.models import Incident
from .engine import probe_single_service, probe_all_services_concurrently
from .models import HealthCheckLog, Service
from .serializers import HealthCheckLogSerializer, ServiceSerializer


# Create your views here.
class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.organization:
            return Service.objects.none()
        return Service.objects.filter(
            organization=self.request.user.organization
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

    @action(detail=True, methods=['post'], url_path='ping')
    def ping(self, request, pk=None):
        """Perform an immediate on-demand health check for a single service."""
        service = self.get_object()
        log = probe_single_service(service)
        return Response(HealthCheckLogSerializer(log).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='ping-all')
    def ping_all(self, request):
        """Perform an immediate concurrent health check across all tenant services."""

        org = request.user.organization
        if not org:
            return Response(
                {"detail": "No organization found for current user."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        results = probe_all_services_concurrently(organization=org)
        return Response(
            {
                "total": results["total"],
                "success": results["success"],
                "failed": results["failed"],
            },
            status=status.HTTP_200_OK
        )


class DashboardKPIView(APIView):
    """Aggregated operational metrics for the top Bento summary row."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = request.user.organization
        if not org:
            return Response(
                {
                    'system_status': 'OPERATIONAL',
                    'active_incidents': 0,
                    'p1_incidents': 0,
                    'avg_latency_ms': 0,
                    'total_services': 0,   
                },
                status=status.HTTP_200_OK,
            )
        services = Service.objects.filter(organization=org)
        total_services = services.count()

        # Compute overall system status
        if services.filter(status=Service.ServiceStatus.MAJOR_OUTAGE).exists():
            system_status = 'MAJOR_OUTAGE'
        elif services.filter(status=Service.ServiceStatus.DEGRADED).exists():
            system_status = 'DEGRADED'
        else:
            system_status = 'OPERATIONAL'

        # Compute active incidents
        active_incidents_qs = Incident.objects.filter(
            organization=org,
            status__in=[Incident.Status.TRIGGERED, Incident.Status.ACKNOWLEDGED],
        )
        active_incidents_count = active_incidents_qs.count()
        p1_incidents_count = active_incidents_qs.filter(
            severity=Incident.Severity.P1
        ).count()

        # Compute 24 average ping latency for successful checks
        last_24h = timezone.now() - timedelta(hours=24)
        avg_latency = (
            HealthCheckLog.objects.filter(
                service__organization=org,
                checked_at__gte=last_24h,
                is_success=True,
            ).aggregate(Avg('latency_ms'))['latency_ms__avg']
            or 0
        )

        return Response(
            {
                'system_status': system_status,
                'active_incidents': active_incidents_count,
                'p1_incidents': p1_incidents_count,
                'avg_latency_ms': round(avg_latency, 1),
                'total_services': total_services,  
            },
            status=status.HTTP_200_OK
        )

class PublicStatusView(APIView):
    """Unauthenticated public status page for external consumers."""
    permission_classes = [AllowAny]

    def get(self, request, slug=None):
        org = get_object_or_404(Organization, slug=slug, is_active=True)
        services = Service.objects.filter(organization=org)

        if services.filter(status=Service.ServiceStatus.MAJOR_OUTAGE).exists():
            overall_status = 'MAJOR_OUTAGE'
        elif services.filter(status=Service.ServiceStatus.DEGRADED).exists():
            overall_status = 'DEGRADED'
        else:
            overall_status = 'OPERATIONAL'

        return Response(
            {
                'organization': org.name,
                'slug': org.slug,
                'overall_status': overall_status,
                'services': [
                    {
                        'name': s.name,
                        'status': s.status,
                        'last_checked_at': s.last_checked_at,
                    }
                    for s in services
                ],
            },
            status=status.HTTP_200_OK
        )

