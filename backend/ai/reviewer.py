from backend.ai.groq_client import ask_groq, parse_json_response


def review_verilog(verilog_code):
    prompt = f"""
You are a Senior VLSI RTL Design Engineer.

Review the following Verilog RTL.

Return ONLY valid JSON.

{{
    "summary": "...",
    "strengths": [
        "...",
        "..."
    ],
    "issues": [
        "...",
        "..."
    ],
    "recommendations": [
        "...",
        "..."
    ]
}}

Rules:

- Return JSON only.
- No markdown.
- No explanation outside JSON.
- If there are no issues, return:
  "issues": ["No issues detected"]

Verilog RTL:

{verilog_code}
"""

    response = ask_groq(prompt)

    return parse_json_response(
        response,
        {
            "summary": "AI review unavailable.",
            "strengths": [],
            "issues": ["Unable to parse AI response."],
            "recommendations": ["Retry analysis."],
        },
    )
