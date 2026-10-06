
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from accounts.views import (
    CurrentUserView,
    LoginView,
    LogoutView,
    RegisterView, 
    UserViewSet,
)

from incidents.views import AlertRuleViewset, IncidentViewSet, OutageSimulatorView
from monitoring.views import DashboardKPIView, PublicProbeView, PublicStatusView, ServiceViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'incidents', IncidentViewSet, basename='incident')
router.register(r'alert-rules', AlertRuleViewset, basename='alert-rule')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path("admin/", admin.site.urls),
    # Dedicated Auth Endpoints
    path('api/auth/register/', RegisterView.as_view(), name='auth-register'),
    path('api/auth/login/', LoginView.as_view(), name='auth-login'),
    path('api/auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('api/auth/me/', CurrentUserView.as_view(), name='auth-me'),
    # Operationsl & KPI  Endpoints
    path('api/dashboard/kpis/', DashboardKPIView.as_view(), name='dashboard-kpis'),
    path('api/status/<slug:slug>/', PublicStatusView.as_view(), name='public-status'),
    path('api/public/probe/', PublicProbeView.as_view(), name='public-probe'),
    path('api/simulator/crash/', OutageSimulatorView.as_view(), name='simulator-crash'),
    # ViewsSet Router URLs
    path('api/', include(router.urls)),
]

