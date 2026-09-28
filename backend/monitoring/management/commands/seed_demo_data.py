import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import Organization, User
from monitoring.models import Service, HealthCheckLog
from incidents.models import Incident, IncidentLog, AlertRule

class Command(BaseCommand):
    help = "Seeds initial demo data (Organization, User, Service, HealthCheckLog, Incident, IncidentLog, AlertRule)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete existing demo organization and recreate all data from scratch"
        )

    def handle(self, *args, **options):
        self.stdout.write("Starting demo data seeding...")

        if options["flush"]:
            self.stdout.write(self.style.WARNING("Flushing existing demo data..."))
            Organization.objects.filter(slug="acme").delete()

        # 1. Seed Organization
        org, _ = Organization.objects.get_or_create(
            slug="acme",
            defaults={
                "name": "Acme Corp",
                "api_key": "dp_live_acme_demo_key_9901",
                "is_active": True,
            },
        )    
        self.stdout.write(f"Organization: {org.name}")

        #2. Seed Users
        admin_user, _ = User.objects.get_or_create(
            email="admin@dispatchpulse.local",
            defaults={
                "username": "admin@dispatchpulse.local",
                "organization": org,
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "is_on_call": False,
            },
        )
        admin_user.set_password("password123")
        admin_user.save()

        # User - 2
        oncall_user, _ = User.objects.get_or_create(
            email="alex.chen@dispatchpulse.local",
            defaults={
                "username": "alex.chen@dispatchpulse.local",
                "organization": org,
                "role": User.Role.RESPONDER,
                "is_staff": False,
                "is_superuser": False,
                "is_on_call": True,
            },
        )
        oncall_user.set_password("password123")
        oncall_user.save()

        # 3. User - 3
        sarah_user, _ = User.objects.get_or_create(
            email="sarah.connor@dispatchpulse.local",
            defaults={
                "username": "sarah.connor@dispatchpulse.local",
                "organization": org,
                "role": User.Role.RESPONDER,
                "is_staff": False,
                "is_superuser": False,
                "is_on_call": False,
            },
        )
        sarah_user.set_password("password123")
        sarah_user.save()
        self.stdout.write("Users seeded (admin, alex.chen, sarah.connor)")

        # 3. Seed Services & Alert Rules
        services_data = [
            {
                "name": "Auth & Session Gateway",
                "target_url": "https://httpbin.org/status/200",
                "status": Service.ServiceStatus.OPERATIONAL,
                "check_interval_sec": 60,
            },
            {
                "name": "Payment & Billing Webhook",
                "target_url": "https://httpbin.org/status/504",
                "status": Service.ServiceStatus.DEGRADED,
                "check_interval_sec": 30,
            },
            {
                "name": "Core PostgreSQL Pool",
                "target_url": "https://httpbin.org/status/500",
                "status": Service.ServiceStatus.MAJOR_OUTAGE,
                "check_interval_sec": 15,
            },
            {
                "name": "Search & Analytics Cluster",
                "target_url": "https://httpbin.org/status/200",
                "status": Service.ServiceStatus.OPERATIONAL,
                "check_interval_sec": 60,
            },
        ]
        
        services_map = {}
        for s_data in services_data:
            service, _ = Service.objects.update_or_create(
                organization=org,
                name=s_data["name"],
                defaults={
                    "target_url": s_data["target_url"],
                    "status": s_data["status"],
                    "check_interval_sec": s_data["check_interval_sec"],
                    "last_checked_at": timezone.now(),
                }
            )
            services_map[service.name] = service
            AlertRule.objects.get_or_create(
                service=service,
                defaults={"consecutive_failures": 3, "timeout_ms": 5000, "is_active": True},
            )
        self.stdout.write("Services and AlertRules seeded.")

        #4. Seed Synthetic HealthCheckLogs
        now = timezone.now()
        logs_to_create = []
        for name, service in services_map.items():
            if not service.health_logs.exists():
                for i in range(30):
                    log_time = now-datetime.timedelta(minutes=(30-i) * 5)
                    if service.status == Service.ServiceStatus.OPERATIONAL:
                        status_code = 200
                        latency_ms = 45 + (i % 25)
                        is_success = True
                        error_msg = ""
                    elif service.status == Service.ServiceStatus.DEGRADED:
                        is_timeout = (i % 4 == 0)
                        status_code = 504 if is_timeout else 200
                        latency_ms = 3200 if is_timeout else 110
                        is_success = not is_timeout
                        error_msg = "Gateway Timeout upstream" if is_timeout else ""
                    else:  # MAJOR_OUTAGE
                        status_code = 500
                        latency_ms = 12
                        is_success = False
                        error_msg = "Connection pool exhausted (max_connections reached)"

                    logs_to_create.append(
                        HealthCheckLog(
                            service=service,
                            status_code=status_code,
                            latency_ms=latency_ms,
                            is_success=is_success,
                            error_message=error_msg,
                            checked_at=log_time,
                        )
                    )
        if logs_to_create:
            HealthCheckLog.objects.bulk_create(logs_to_create)
            self.stdout.write(f"Created {len(logs_to_create)} synthetic HealthCheckLog records.")


        # 5. Seed Incidents and Timelines
        core_db = services_map["Core PostgreSQL Pool"]
        inc1, inc1_created = Incident.objects.get_or_create(
            organization=org,
            service=core_db,
            title="Database Connection Pool Exhaustion",
            defaults={
                "error_type": Incident.ErrorType.DATABASE,
                "severity": Incident.Severity.P1,
                "status": Incident.Status.TRIGGERED,
                "assigned_to": oncall_user,
                "raw_logs": (
                    "psycopg.OperationalError: FATAL: remaining connection slots are reserved "
                    "for non-replication superuser connections"
                ),
                "ai_summary": {
                    "root_cause": "PostgreSQL max_connections limit exceeded due to unclosed backend connection pool leak.",
                    "recommended_fix": "Restart PgBouncer or scale connection pool size; terminate idle backend clients.",
                    "confidence": 0.94,
                },
            },
        )
        if inc1_created:
            IncidentLog.objects.create(
                incident=inc1,
                actor=None,
                event_type=IncidentLog.EventType.TRIGGERED,
                note="Alert rule breached: 3 consecutive 500 responses.",
            )

        payment_svc = services_map["Payment & Billing Webhook"]
        inc2, inc2_created = Incident.objects.get_or_create(
            organization=org,
            service=payment_svc,
            title="Stripe Webhook Gateway 504 Gateway Timeout",
            defaults={
                "error_type": Incident.ErrorType.API_TIMEOUT,
                "severity": Incident.Severity.P2,
                "status": Incident.Status.ACKNOWLEDGED,
                "assigned_to": oncall_user,
                "acknowledged_at": now - datetime.timedelta(minutes=20),
                "raw_logs": "HTTP 504 Gateway Timeout upstream billing.stripe.internal",
                "ai_summary": {
                    "root_cause": "Upstream Stripe webhook proxy experiencing latency above 3000ms SLA.",
                    "recommended_fix": "Enable webhook queue buffering and verify DNS resolution to billing gateway.",
                    "confidence": 0.88,
                },
            },
        )
        if inc2_created:
            IncidentLog.objects.create(
                incident=inc2,
                actor=None,
                event_type=IncidentLog.EventType.TRIGGERED,
                note="Intermittent 504 timeouts detected.",
            )
            IncidentLog.objects.create(
                incident=inc2,
                actor=oncall_user,
                event_type=IncidentLog.EventType.ACKNOWLEDGED,
                note="Investigating webhook timeouts with the payments team.",
            )

        auth_svc = services_map["Auth & Session Gateway"]
        inc3, inc3_created = Incident.objects.get_or_create(
            organization=org,
            service=auth_svc,
            title="Redis Token Cache Eviction Spike",
            defaults={
                "error_type": Incident.ErrorType.PERFORMANCE,
                "severity": Incident.Severity.P3,
                "status": Incident.Status.RESOLVED,
                "assigned_to": sarah_user,
                "acknowledged_at": now - datetime.timedelta(hours=2),
                "resolved_at": now - datetime.timedelta(minutes=30),
                "raw_logs": "OOM command not allowed when used memory > 'maxmemory'",
                "ai_summary": {
                    "root_cause": "Redis LRU eviction policy reached memory cap during token refresh cycle.",
                    "recommended_fix": "Increased Redis maxmemory allocation to 2GB and purged expired session keys.",
                    "confidence": 0.96,
                },
            },
        )
        if inc3_created:
            IncidentLog.objects.create(
                incident=inc3,
                actor=None,
                event_type=IncidentLog.EventType.TRIGGERED,
                note="Memory limit breached on token cache.",
            )
            IncidentLog.objects.create(
                incident=inc3,
                actor=sarah_user,
                event_type=IncidentLog.EventType.ACKNOWLEDGED,
                note="Purging stale tokens and adjusting cache limits.",
            )
            IncidentLog.objects.create(
                incident=inc3,
                actor=sarah_user,
                event_type=IncidentLog.EventType.RESOLVED,
                note="Cache memory stabilized at 42% capacity.",
            )

        self.stdout.write(self.style.SUCCESS("Demo data seeding completed successfully!"))