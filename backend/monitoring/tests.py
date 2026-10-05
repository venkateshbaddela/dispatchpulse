from unittest.mock import patch, MagicMock
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from monitoring.ssrf import validate_public_url
from monitoring.engine import probe_ephemeral_url


class SSRFValidationTests(TestCase):
    def test_blocks_disallowed_schemes(self):
        is_safe, error, _ = validate_public_url("file:///etc/passwd")
        self.assertFalse(is_safe)
        self.assertIn("Unsupported scheme", error)

        is_safe, error, _ = validate_public_url("ftp://example.com/file.zip")
        self.assertFalse(is_safe)
        self.assertIn("Unsupported scheme", error)

    def test_blocks_loopback_addresses(self):
        is_safe, error, _ = validate_public_url("http://127.0.0.1:8000")
        self.assertFalse(is_safe)
        self.assertIn("Security Warning", error)

        is_safe, error, _ = validate_public_url("http://localhost:8000")
        self.assertFalse(is_safe)
        self.assertIn("Security Warning", error)

    def test_blocks_cloud_metadata_link_local(self):
        is_safe, error, _ = validate_public_url("http://169.254.169.254/latest/meta-data/")
        self.assertFalse(is_safe)
        self.assertIn("Security Warning", error)

    def test_blocks_private_rfc1918_networks(self):
        is_safe, error, _ = validate_public_url("http://10.0.0.1")
        self.assertFalse(is_safe)
        self.assertIn("Security Warning", error)

        is_safe, error, _ = validate_public_url("http://192.168.1.1")
        self.assertFalse(is_safe)
        self.assertIn("Security Warning", error)

    def test_empty_or_invalid_url(self):
        is_safe, error, _ = validate_public_url("")
        self.assertFalse(is_safe)

        is_safe, error, _ = validate_public_url("not a domain")
        self.assertFalse(is_safe)


class PublicProbeAPITests(APITestCase):
    def test_probe_empty_url_returns_400(self):
        response = self.client.post("/api/public/probe/", {"url": ""})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_probe_ssrf_attempt_returns_400(self):
        response = self.client.post("/api/public/probe/", {"url": "http://127.0.0.1:8000/admin/"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Security Warning", response.data.get("error", ""))

    def test_probe_cloud_metadata_returns_400(self):
        response = self.client.post("/api/public/probe/", {"url": "http://169.254.169.254/"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Security Warning", response.data.get("error", ""))

    @patch("monitoring.engine.requests.get")
    @patch("monitoring.ssrf.socket.getaddrinfo")
    def test_probe_valid_target_success(self, mock_dns, mock_get):
        mock_dns.return_value = [
            (2, 1, 6, "", ("93.184.216.34", 0))
        ]
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.reason = "OK"
        mock_resp.ok = True
        mock_get.return_value = mock_resp

        response = self.client.post("/api/public/probe/", {"url": "example.com"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertTrue(data["is_up"])
        self.assertEqual(data["status_code"], 200)
        self.assertEqual(data["resolved_ip"], "93.184.216.34")
        self.assertIsNone(data["error"])
        self.assertIsNotNone(data["latency_ms"])
