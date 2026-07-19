import json

from backend.ai.gemini_client import ask_gemini


def score_verilog(verilog_code):

    prompt = f"""
You are a Senior RTL Design Engineer.

Evaluate the following Verilog code.

Return ONLY valid JSON.

Do not write explanations.
Do not use markdown.
Do not use ```json.

Return exactly this format:

{{
    "rtl_score": 0,
    "coding_quality": "",
    "synthesizable": true,
    "latch_risk": false,
    "optimization": "",
    "summary": ""
}}

Verilog Code:

{verilog_code}
"""

    response = ask_gemini(prompt)

    try:
        return json.loads(response)
    except Exception:
        return {
            "rtl_score": 0,
            "coding_quality": "Unknown",
            "synthesizable": False,
            "latch_risk": False,
            "optimization": "Unknown",
            "summary": "Failed to parse AI response."
        }