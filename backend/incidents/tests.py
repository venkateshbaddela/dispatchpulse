from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from rest_framework import status
from accounts.models import Organization, User
from monitoring.models import Service, HealthCheckLog
from incidents.models import Incident, AlertRule, IncidentLog


class IncidentFilterAndSearchTests(APITestCase):
    def setUp(self):
        # Create Org A and User A
        self.org_a = Organization.objects.create(name="Acme Corp", slug="acme-corp", api_key="acme-key-1")
        self.user_a = User.objects.create_user(
            email="sre@acme.com",
            username="sre@acme.com",
            password="secretpassword123",
            organization=self.org_a,
        )
        self.token_a = Token.objects.create(user=self.user_a)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token_a.key}")

        # Create Org B and User B
        self.org_b = Organization.objects.create(name="Beta LLC", slug="beta-llc", api_key="beta-key-2")
        self.user_b = User.objects.create_user(
            email="dev@beta.com",
            username="dev@beta.com",
            password="secretpassword123",
            organization=self.org_b,
        )

        # Create Services for Org A
        self.service_auth = Service.objects.create(
            organization=self.org_a,
            name="Auth Service",
            target_url="https://auth.acme.com/health",
        )
        self.service_payment = Service.objects.create(
            organization=self.org_a,
            name="Payment Gateway",
            target_url="https://payment.acme.com/health",
        )

        # Create Service for Org B
        self.service_org_b = Service.objects.create(
            organization=self.org_b,
            name="Secret Service B",
            target_url="https://secret.beta.com/health",
        )

        # Incidents for Org A
        self.inc_1 = Incident.objects.create(
            organization=self.org_a,
            service=self.service_auth,
            title="Redis Cache Eviction Surge",
            error_type=Incident.ErrorType.PERFORMANCE,
            severity=Incident.Severity.P1,
            status=Incident.Status.TRIGGERED,
            raw_logs="Redis OOM error during peak token invalidation",
        )
        self.inc_2 = Incident.objects.create(
            organization=self.org_a,
            service=self.service_payment,
            title="Stripe Webhook Timeout",
            error_type=Incident.ErrorType.API_TIMEOUT,
            severity=Incident.Severity.P2,
            status=Incident.Status.ACKNOWLEDGED,
            raw_logs="Gateway timeout: 504 Gateway Time-out after 10000ms",
        )
        self.inc_3 = Incident.objects.create(
            organization=self.org_a,
            service=self.service_auth,
            title="Postgres Connection Leak",
            error_type=Incident.ErrorType.DATABASE,
            severity=Incident.Severity.P3,
            status=Incident.Status.RESOLVED,
            raw_logs="FATAL_CONN_LIMIT reached on pgpool worker-04",
        )

        # Incident for Org B (multi-tenant check)
        self.inc_org_b = Incident.objects.create(
            organization=self.org_b,
            service=self.service_org_b,
            title="Beta Confidential Incident",
            error_type=Incident.ErrorType.SERVER_CRASH,
            severity=Incident.Severity.P1,
            status=Incident.Status.TRIGGERED,
            raw_logs="Crash in beta internal pipeline",
        )

    def test_list_all_incidents_for_org(self):
        url = "/api/incidents/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return all 3 incidents of Org A and 0 of Org B
        data = response.data
        self.assertEqual(len(data), 3)
        returned_ids = [item["id"] for item in data]
        self.assertNotIn(str(self.inc_org_b.id), returned_ids)

    def test_filter_by_status(self):
        # Filter single status
        response = self.client.get("/api/incidents/?status=TRIGGERED")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], str(self.inc_1.id))

        # Filter multiple statuses
        response = self.client.get("/api/incidents/?status=TRIGGERED,ACKNOWLEDGED")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        returned_ids = {item["id"] for item in response.data}
        self.assertEqual(returned_ids, {str(self.inc_1.id), str(self.inc_2.id)})

        # Status ALL
        response = self.client.get("/api/incidents/?status=ALL")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_filter_by_severity(self):
        # Filter P1
        response = self.client.get("/api/incidents/?severity=P1")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], str(self.inc_1.id))

        # Filter P2
        response = self.client.get("/api/incidents/?severity=P2")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], str(self.inc_2.id))

        # Severity ALL
        response = self.client.get("/api/incidents/?severity=ALL")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_filter_by_service_id_and_name(self):
        # Filter by service UUID via 'service'
        response = self.client.get(f"/api/incidents/?service={self.service_auth.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        returned_ids = {item["id"] for item in response.data}
        self.assertEqual(returned_ids, {str(self.inc_1.id), str(self.inc_3.id)})

        # Filter by service UUID via 'service_id'
        response = self.client.get(f"/api/incidents/?service_id={self.service_payment.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], str(self.inc_2.id))

        # Filter by service name
        response = self.client.get("/api/incidents/?service=Payment Gateway")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], str(self.inc_2.id))

    def test_case_insensitive_search(self):
        # Search in title (case-insensitive)
        response = self.client.get("/api/incidents/?search=redis")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], str(self.inc_1.id))

        # Search in raw_logs
        response = self.client.get("/api/incidents/?search=FATAL_CONN_LIMIT")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], str(self.inc_3.id))

        # Search in service name
        response = self.client.get("/api/incidents/?search=Payment")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], str(self.inc_2.id))

        # Combined search and filter
        response = self.client.get(f"/api/incidents/?service={self.service_auth.id}&severity=P1&search=redis")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], str(self.inc_1.id))

    def test_multi_tenant_isolation(self):
        # Switch to Org B user
        token_b = Token.objects.create(user=self.user_b)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token_b.key}")

        response = self.client.get("/api/incidents/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], str(self.inc_org_b.id))


class AlertRuleAPITests(APITestCase):
    def setUp(self):
        self.org_a = Organization.objects.create(name="Acme Corp", slug="acme-corp", api_key="acme-key-1")
        self.user_a = User.objects.create_user(
            email="sre@acme.com",
            username="sre@acme.com",
            password="secretpassword123",
            organization=self.org_a,
        )
        self.token_a = Token.objects.create(user=self.user_a)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token_a.key}")

        self.org_b = Organization.objects.create(name="Beta LLC", slug="beta-llc", api_key="beta-key-2")
        self.user_b = User.objects.create_user(
            email="dev@beta.com",
            username="dev@beta.com",
            password="secretpassword123",
            organization=self.org_b,
        )

        self.service_a = Service.objects.create(
            organization=self.org_a,
            name="Auth Service",
            target_url="https://auth.acme.com/health",
        )
        self.rule_a = AlertRule.objects.create(
            service=self.service_a,
            consecutive_failures=3,
            timeout_ms=5000,
            is_active=True,
        )

        self.service_b = Service.objects.create(
            organization=self.org_b,
            name="Secret Service B",
            target_url="https://secret.beta.com/health",
        )
        self.rule_b = AlertRule.objects.create(
            service=self.service_b,
            consecutive_failures=5,
            timeout_ms=3000,
            is_active=True,
        )

    def test_list_and_filter_alert_rules(self):
        # List rules - should only return Org A's rule
        response = self.client.get("/api/alert-rules/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.rule_a.id)
        self.assertEqual(response.data[0]["service_name"], "Auth Service")

        # Filter by service ID
        response = self.client.get(f"/api/alert-rules/?service={self.service_a.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_patch_alert_rule(self):
        response = self.client.patch(
            f"/api/alert-rules/{self.rule_a.id}/",
            {"consecutive_failures": 5, "timeout_ms": 10000, "is_active": False},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.rule_a.refresh_from_db()
        self.assertEqual(self.rule_a.consecutive_failures, 5)
        self.assertEqual(self.rule_a.timeout_ms, 10000)
        self.assertFalse(self.rule_a.is_active)

    def test_tenant_cannot_modify_other_org_rule(self):
        # Attempt to patch rule_b belonging to Org B
        response = self.client.patch(
            f"/api/alert-rules/{self.rule_b.id}/",
            {"consecutive_failures": 2},
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_service_creation_auto_provisions_default_alert_rule(self):
        response = self.client.post(
            "/api/services/",
            {"name": "Billing API", "target_url": "https://billing.acme.com/health", "check_interval_sec": 30},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_service_id = response.data["id"]
        # Verify alert_rule embedded in response
        self.assertIsNotNone(response.data.get("alert_rule"))
        self.assertEqual(response.data["alert_rule"]["consecutive_failures"], 3)
        self.assertEqual(response.data["alert_rule"]["timeout_ms"], 5000)
        self.assertTrue(response.data["alert_rule"]["is_active"])

        # Verify AlertRule exists in database
        rule = AlertRule.objects.filter(service_id=new_service_id).first()
        self.assertIsNotNone(rule)
        self.assertEqual(rule.consecutive_failures, 3)


class OutageSimulatorAPITests(APITestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Acme Corp", slug="acme-corp", api_key="acme-sim-key")
        self.user = User.objects.create_user(
            email="sre@acme.com",
            username="sre@acme.com",
            password="secretpassword123",
            organization=self.org,
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

        self.service = Service.objects.create(
            organization=self.org,
            name="Payment Gateway",
            target_url="https://payment.acme.com/health",
            status=Service.ServiceStatus.OPERATIONAL,
        )

        # Other org
        self.other_org = Organization.objects.create(name="Other Corp", slug="other-corp", api_key="other-key")
        self.other_service = Service.objects.create(
            organization=self.other_org,
            name="Rival Service",
            target_url="https://rival.com/health",
        )

    def test_simulate_crash_requires_service_id(self):
        response = self.client.post("/api/simulator/crash/", {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("service_id", response.data)

    def test_simulate_crash_cross_tenant_forbidden(self):
        response = self.client.post("/api/simulator/crash/", {"service_id": str(self.other_service.id)})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_simulate_server_crash_success(self):
        response = self.client.post(
            "/api/simulator/crash/",
            {"service_id": str(self.service.id), "scenario": "SERVER_CRASH"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.data
        self.assertEqual(data["service_name"], "Payment Gateway")
        self.assertEqual(data["service_status"], "MAJOR_OUTAGE")

        # Verify service status was updated in DB
        self.service.refresh_from_db()
        self.assertEqual(self.service.status, Service.ServiceStatus.MAJOR_OUTAGE)

        # Verify failing HealthCheckLog was created
        log = HealthCheckLog.objects.filter(service=self.service).first()
        self.assertIsNotNone(log)
        self.assertFalse(log.is_success)
        self.assertEqual(log.status_code, 500)

        # Verify P1 Incident created
        incident_data = data["incident"]
        self.assertEqual(incident_data["severity"], "P1")
        self.assertEqual(incident_data["status"], "TRIGGERED")
        self.assertEqual(incident_data["error_type"], "SERVER_CRASH")
        self.assertIn("Unhandled runtime panic", incident_data["title"])
        self.assertIn("SIGSEGV", incident_data["raw_logs"])

        # Verify IncidentLog created
        inc_obj = Incident.objects.get(id=incident_data["id"])
        inc_log = inc_obj.logs.first()
        self.assertIsNotNone(inc_log)
        self.assertEqual(inc_log.actor, self.user)
        self.assertIn("Outage Simulator", inc_log.note)

    def test_simulate_database_pool_exhaustion(self):
        response = self.client.post(
            "/api/simulator/crash/",
            {"service_id": str(self.service.id), "scenario": "DATABASE"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["incident"]["error_type"], "DATABASE")
        self.assertIn("Database connection pool exhausted", response.data["incident"]["title"])
        self.assertIn("FATAL: remaining connection slots", response.data["incident"]["raw_logs"])

    def test_simulate_gateway_timeout(self):
        response = self.client.post(
            "/api/simulator/crash/",
            {"service_id": str(self.service.id), "scenario": "API_TIMEOUT"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["incident"]["error_type"], "API_TIMEOUT")
        self.assertIn("HTTP 504", response.data["incident"]["title"])

    def test_triage_deduplicates_repeated_identical_logs(self):
        incident = Incident.objects.create(
            organization=self.org,
            service=self.service,
            title="Gateway 504 Timeout",
            error_type=Incident.ErrorType.API_TIMEOUT,
            severity=Incident.Severity.P2,
            status=Incident.Status.TRIGGERED,
            raw_logs="HTTP 504 Gateway Timeout after 10000ms",
        )
        # Call triage 3 times in succession
        self.client.post(f"/api/incidents/{incident.id}/triage/")
        self.client.post(f"/api/incidents/{incident.id}/triage/")
        self.client.post(f"/api/incidents/{incident.id}/triage/")

        # Should only have 1 AI_TRIAGE log, not 3
        triage_logs = incident.logs.filter(event_type=IncidentLog.EventType.AI_TRIAGE)
        self.assertEqual(triage_logs.count(), 1)
