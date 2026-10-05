import ipaddress
import socket
from urllib.parse import urlparse

BLOCKED_SCHEMES = {"file", "ftp", "gopher", "data", "expect", "php", "glob"}

def validate_public_url(raw_url: str) -> tuple[bool, str, str | None]:
    """
    Validates that a target URL is safe to probe publicly.
    Guards against SSRF (Server-Side Request Forgery) by:
      1. Checking URL scheme (only http/https permitted).
      2. Resolving the hostname via DNS.
      3. Verifying that the resolved IP address is not private (RFC 1918),
         loopback (127.0.0.1), link-local (169.254.x.x cloud metadata),
         reserved, or multicast.

    Returns:
        tuple: (is_safe: bool, error_message: str, resolved_ip: str | None)
    """
    if not raw_url or not isinstance(raw_url, str):
        return False, "Target URL must be a non-empty string.", None

    url = raw_url.strip()
    if "://" in url:
        try:
            parsed = urlparse(url)
        except Exception as exc:
            return False, f"Malformed URL: {exc}", None
    else:
        try:
            parsed = urlparse("https://" + url)
            url = "https://" + url
        except Exception as exc:
            return False, f"Malformed URL: {exc}", None

    scheme = (parsed.scheme or "").lower()
    if scheme not in ("http", "https") or scheme in BLOCKED_SCHEMES:
        return False, f"Unsupported scheme '{scheme}'. Only HTTP and HTTPS are permitted.", None

    hostname = parsed.hostname
    if not hostname:
        return False, "Target URL is missing a valid hostname.", None

    # Resolve hostname via DNS
    try:
        addr_info = socket.getaddrinfo(hostname, None)
    except socket.gaierror:
        return False, f"DNS resolution failed for hostname '{hostname}'.", None
    except Exception as exc:
        return False, f"Unable to resolve hostname: {exc}", None

    if not addr_info:
        return False, f"No IP addresses resolved for hostname '{hostname}'.", None

    resolved_ip = None
    for entry in addr_info:
        sockaddr = entry[4]
        ip_str = sockaddr[0]
        try:
            ip_obj = ipaddress.ip_address(ip_str)
        except ValueError:
            return False, f"Invalid resolved IP address '{ip_str}'.", None

        # Block private, loopback, link-local (metadata), reserved, multicast
        if (
            ip_obj.is_private
            or ip_obj.is_loopback
            or ip_obj.is_link_local
            or ip_obj.is_reserved
            or ip_obj.is_multicast
        ):
            return False, f"Security Warning: Probing private, local, or cloud metadata IP addresses ({ip_str}) is prohibited.", None

        if not resolved_ip:
            resolved_ip = ip_str

    return True, "", resolved_ip
