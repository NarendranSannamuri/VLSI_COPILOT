from backend.ai.groq_client import ask_groq, parse_json_response


def detect_bugs(verilog_code):
    prompt = f"""
You are a Senior RTL Verification Engineer.

Analyze the following Verilog code for RTL design issues.

Check for:
1. Latch inference
2. Blocking vs Non-blocking assignment misuse
3. Missing default case
4. Multiple drivers
5. Combinational loops
6. Undriven signals
7. Unused signals
8. Synthesis issues

Return ONLY valid JSON in this exact shape:

{{
  "summary": "short overall summary",
  "checks": [
    {{
      "id": "latches",
      "title": "No Latches",
      "status": "pass",
      "severity": "ok",
      "detail": "No latch inference detected.",
      "recommendation": ""
    }},
    {{
      "id": "blocking",
      "title": "Blocking Assignment",
      "status": "warn",
      "severity": "medium",
      "detail": "Possible blocking assignment in sequential logic.",
      "recommendation": "Use non-blocking (<=) in sequential always blocks."
    }}
  ]
}}

Rules:
- status must be one of: pass, warn, fail
- severity must be one of: ok, low, medium, high
- Return 4 to 8 check cards covering the most relevant findings.
- If clean, mostly pass cards with helpful notes.

Verilog Code:

{verilog_code}
"""

    response = ask_groq(prompt)

    fallback = {
        "summary": "Unable to parse AI bug analysis.",
        "checks": [
            {
                "id": "parse_error",
                "title": "AI Response Unavailable",
                "status": "warn",
                "severity": "medium",
                "detail": "Unable to parse AI response.",
                "recommendation": "Retry analysis.",
            }
        ],
    }

    result = parse_json_response(response, fallback)

    # Backward-compatible single-object responses
    if isinstance(result, dict) and "checks" not in result and "bug_type" in result:
        severity = (result.get("severity") or "medium").lower()
        status = "pass" if severity in ("none", "ok", "low") else "warn"
        if severity == "high":
            status = "fail"
        return {
            "summary": result.get("reason") or result.get("bug_type") or "Bug scan complete.",
            "checks": [
                {
                    "id": "legacy",
                    "title": result.get("bug_type") or "RTL Check",
                    "status": status if severity != "none" else "pass",
                    "severity": "ok" if severity in ("none", "ok") else severity,
                    "detail": result.get("reason") or "",
                    "recommendation": result.get("recommendation") or "",
                }
            ],
        }

    if not isinstance(result, dict) or "checks" not in result:
        return fallback

    return result
