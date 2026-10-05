from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from rest_framework import status
from accounts.models import Organization, User
from monitoring.models import Service
from incidents.models import Incident


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
