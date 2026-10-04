import json
import logging
import os
import re
import requests

logger = logging.getLogger(__name__)

TRIAGE_SYSTEM_PROMPT = """You are an expert Site Reliability Engineer (SRE).
Analyze the provided incident details and error stack trace.
You MUST respond with a valid JSON object ONLY, containing exactly these keys:
- "root_cause": A concise diagnosis of what failed and why (max 2 sentences).
- "recommended_fix": Immediate, actionable remediation steps for the on-call engineer
(max 2 sentences).
- "confidence": A float between 0.0 and 1.0 indicating diagnostic confidence.

Do not include any Markdown fencing, backticks, or extra explanation outside the JSON
object.
"""


def heuristic_triage(raw_logs: str, error_type: str = "", title: str = "") -> dict:
    """
    Deterministic rule-based triage when LLM APIs are unconfigured,
    rate-limited, or timing out.

    Inspects error signatures and error types to generate actionable
    incident summaries.
    """
    logs_lower = (raw_logs or "").lower()
    title_lower = (title or "").lower()
    err_type = (error_type or "").upper()

    # 1. Database Connection & Lock Contention
    if (
        "connection refused" in logs_lower
        or "operationalerror" in logs_lower
        or "could not connect to server" in logs_lower
        or err_type == "DATABASE"
    ):
        return {
            "root_cause": (
                "Database connection failure or connection pool saturation "
                "preventing query execution."
            ),
            "recommended_fix": (
                "Verify PostgreSQL service status, check active connection "
                "limits (pg_stat_activity), and restart database poolers "
                "if saturated."
            ),
            "confidence": 0.85,
        }

    # 2. Network & Timeout Errors
    if (
        "timeout" in logs_lower
        or "504" in logs_lower
        or "timed out" in logs_lower
        or "gateway timeout" in title_lower
        or err_type == "API_TIMEOUT"
    ):
        return {
            "root_cause": (
                "Upstream service latency exceeded maximum allowable "
                "threshold or failed to respond."
            ),
            "recommended_fix": (
                "Check upstream dependency latency, review ingress gateway "
                "timeouts, and verify target endpoint availability."
            ),
            "confidence": 0.80,
        }

    # 3. Authentication & Security
    if (
        "401" in logs_lower
        or "403" in logs_lower
        or "unauthorized" in logs_lower
        or "token" in logs_lower
        or "permission denied" in logs_lower
        or err_type == "AUTH_SECURITY"
    ):
        return {
            "root_cause": (
                "Authentication or authorization handshake failed due to "
                "expired, invalid, or missing credentials."
            ),
            "recommended_fix": (
                "Inspect service authentication tokens, verify API keys, "
                "and confirm permission scopes on target endpoints."
            ),
            "confidence": 0.85,
        }

    # 4. Out of Memory & Server Crash
    if (
        "memoryerror" in logs_lower
        or "oom" in logs_lower
        or "sigkill" in logs_lower
        or "500 internal server error" in logs_lower
        or err_type == "SERVER_CRASH"
    ):
        return {
            "root_cause": "Process crashed due to a fatal unhandled exception or "
            "memory exhaustion (OOM).",
            "recommended_fix": "Check container memory consumption and cgroup limits, "
            "review error traceback, and restart affected worker pods.",
            "confidence": 0.75,
        }

    # 5. Performance Degradation
    if (
        "high latency" in logs_lower
        or "slow" in logs_lower
        or "cpu" in logs_lower
        or err_type == "PERFORMANCE"
    ):
        return {
            "root_cause": "System resource contention or thread starvation causing "
            "response latency degradation.",
            "recommended_fix": "Profile slow endpoints, check CPU/IO utilization, "
            "and temporarily scale compute replicas to relieve traffic load.",
            "confidence": 0.70,
        }

    # Default fallback
    return {
        "root_cause": f"Automated monitor flagged failure with error type: "
        "{error_type or 'UNKNOWN'}.",
        "recommended_fix": "Inspect raw stack trace logs, verify endpoint "
        "reachability, and check recent application deployments.",
        "confidence": 0.60,
    }


def _clean_json_response(raw_text: str) -> dict:
    """Safely extracts and parses JSON even if the LLM wraps it in markdown blocks."""
    cleaned = raw_text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s```$", "", cleaned)
    data = json.loads(cleaned.strip())

    return {
        "root_cause": str(data.get("root_cause", "")).strip(),
        "recommended_fix": str(data.get("recommended_fix", "")).strip(),
        "confidence": float(data.get("confidence", 0.75)),
    }


def _call_groq(prompt: str, api_key: str) -> dict:
    """Invokes Groq Cloud's fast JSON completion endpoint."""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": TRIAGE_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2,
    }
    response = requests.post(url, headers=headers, json=payload, timeout=8)
    response.raise_for_status()
    result = response.json()
    content = result["choices"][0]["message"]["content"]
    return _clean_json_response(content)


def _call_gemini(prompt: str, api_key: str) -> dict:
    """Invokes Google Gemini endpoint with structured JSON output."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{TRIAGE_SYSTEM_PROMPT}\n\nIncident Details:\n{prompt}"}
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.2,
        },
    }
    response = requests.post(url, headers=headers, json=payload, timeout=8)
    response.raise_for_status()
    result = response.json()
    candidates = result.get("candidates", [])
    if candidates:
        text = candidates[0]["content"]["parts"][0]["text"]
        return _clean_json_response(text)
    raise ValueError("Gemini returned empty candidates")


def analyze_incident(raw_logs: str, error_type: str = "", title: str = "") -> dict:
    """
            Main triage coordinator:
            1. Attempts Groq API if GROQ_API_KEY is configured.
            2. Attempts Gemini API if GEMINI_API_KEY is configured.
            3. Gracefully degrades to rule-based heuristic_triage if no keys exist or if
    network calls fail.
    """
    prompt = (
        f"Incident Title: {title}\n"
        f"Error Type: {error_type}\n"
        f"Raw Logs / Traceback:\n{raw_logs or 'No stack trace available.'}"
    )

    groq_key = os.environ.get("GROQ_API_KEY")
    if groq_key:
        try:
            return _call_groq(prompt, groq_key)
        except Exception as exc:
            logger.warning("Groq triage call failed (%s). Falling back.", exc)

    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        try:
            return _call_gemini(prompt, gemini_key)
        except Exception as exc:
            logger.warning("Gemini triage call failed (%s). Falling back.", exc)

    # Deterministic heuristic engine fallback
    return heuristic_triage(raw_logs, error_type, title)
