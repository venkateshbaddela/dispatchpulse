from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import Organization, User
from incidents.models import Incident
from monitoring.models import Service


class TeamAndOnCallManagementTests(APITestCase):
    def setUp(self):
        # Create Organizations
        self.org_a = Organization.objects.create(name="Acme Corp", slug="acme-corp", api_key="acme-key-1")
        self.org_b = Organization.objects.create(name="Beta LLC", slug="beta-llc", api_key="beta-key-2")

        # Create Admin in Org A
        self.admin_user = User.objects.create_user(
            email="admin@acme.com",
            username="admin@acme.com",
            password="secretpassword123",
            role=User.Role.ADMIN,
            is_on_call=False,
            organization=self.org_a,
        )
        self.admin_token = Token.objects.create(user=self.admin_user)

        # Create Responder in Org A
        self.responder_user = User.objects.create_user(
            email="responder@acme.com",
            username="responder@acme.com",
            password="secretpassword123",
            role=User.Role.RESPONDER,
            is_on_call=True,
            organization=self.org_a,
        )
        self.responder_token = Token.objects.create(user=self.responder_user)

        # Create User in Org B
        self.org_b_user = User.objects.create_user(
            email="user@beta.com",
            username="user@beta.com",
            password="secretpassword123",
            role=User.Role.RESPONDER,
            organization=self.org_b,
        )

        # Create a test Service and Incidents for active load count testing
        self.service = Service.objects.create(
            organization=self.org_a,
            name="Auth Service",
            target_url="https://auth.acme.com/health",
        )

    def test_list_organization_users_tenant_isolated_and_sorted(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.admin_token.key}")
        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        emails = [u["email"] for u in response.data]
        self.assertIn("admin@acme.com", emails)
        self.assertIn("responder@acme.com", emails)
        self.assertNotIn("user@beta.com", emails)

        # Verify on-call responders appear first
        self.assertEqual(response.data[0]["email"], "responder@acme.com")
        self.assertTrue(response.data[0]["is_on_call"])

    def test_active_incidents_count_computation(self):
        # 1 active, 1 acknowledged (active), 1 resolved
        Incident.objects.create(
            organization=self.org_a,
            service=self.service,
            title="Active Incident 1",
            status=Incident.Status.TRIGGERED,
            assigned_to=self.responder_user,
        )
        Incident.objects.create(
            organization=self.org_a,
            service=self.service,
            title="Active Incident 2",
            status=Incident.Status.ACKNOWLEDGED,
            assigned_to=self.responder_user,
        )
        Incident.objects.create(
            organization=self.org_a,
            service=self.service,
            title="Resolved Incident",
            status=Incident.Status.RESOLVED,
            assigned_to=self.responder_user,
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.admin_token.key}")
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        resp_data = next(u for u in response.data if u["email"] == "responder@acme.com")
        self.assertEqual(resp_data["active_incidents_count"], 2)

    def test_admin_can_invite_member(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.admin_token.key}")
        payload = {
            "email": "newbie@acme.com",
            "password": "newbiepassword123",
            "role": "RESPONDER",
            "first_name": "New",
            "last_name": "Teammate",
        }
        response = self.client.post("/api/users/", payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], "newbie@acme.com")

        new_user = User.objects.get(email="newbie@acme.com")
        self.assertEqual(new_user.organization, self.org_a)
        self.assertEqual(new_user.role, User.Role.RESPONDER)
        self.assertTrue(new_user.check_password("newbiepassword123"))

    def test_non_admin_cannot_invite_member(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.responder_token.key}")
        payload = {
            "email": "hacker@acme.com",
            "password": "hackerpassword123",
            "role": "ADMIN",
        }
        response = self.client.post("/api/users/", payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(User.objects.filter(email="hacker@acme.com").exists())

    def test_admin_can_update_member_role(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.admin_token.key}")
        response = self.client.patch(
            f"/api/users/{self.responder_user.id}/",
            {"role": "ADMIN"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.responder_user.refresh_from_db()
        self.assertEqual(self.responder_user.role, User.Role.ADMIN)

    def test_non_admin_cannot_update_member_role(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.responder_token.key}")
        response = self.client.patch(
            f"/api/users/{self.responder_user.id}/",
            {"role": "ADMIN"},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_responder_can_toggle_own_on_call(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.responder_token.key}")
        self.assertTrue(self.responder_user.is_on_call)

        response = self.client.post(f"/api/users/{self.responder_user.id}/toggle-on-call/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_on_call"])

        self.responder_user.refresh_from_db()
        self.assertFalse(self.responder_user.is_on_call)

    def test_admin_can_toggle_other_member_on_call(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.admin_token.key}")
        response = self.client.post(f"/api/users/{self.responder_user.id}/toggle-on-call/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.responder_user.refresh_from_db()
        self.assertFalse(self.responder_user.is_on_call)

    def test_responder_cannot_toggle_other_member_on_call(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.responder_token.key}")
        response = self.client.post(f"/api/users/{self.admin_user.id}/toggle-on-call/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
