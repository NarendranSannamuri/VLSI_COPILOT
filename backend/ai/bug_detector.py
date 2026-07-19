import json

from backend.ai.gemini_client import ask_gemini


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

Return ONLY valid JSON.

Do not explain anything.

Return exactly this format:

{{
    "severity": "",
    "bug_type": "",
    "line": "",
    "reason": "",
    "recommendation": ""
}}

If there are no bugs, return:

{{
    "severity": "None",
    "bug_type": "No RTL Bugs",
    "line": "-",
    "reason": "No RTL design issues detected.",
    "recommendation": "Design is ready for synthesis."
}}

Verilog Code:

{verilog_code}
"""

    response = ask_gemini(prompt)

    # Remove markdown if Gemini returns it
    response = response.replace("```json", "")
    response = response.replace("```", "")
    response = response.strip()

    try:
        return json.loads(response)

    except Exception:

        return {
            "severity": "Unknown",
            "bug_type": "AI Response Error",
            "line": "-",
            "reason": "Unable to parse Gemini response.",
            "recommendation": "Retry analysis."
        }