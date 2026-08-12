from backend.ai.groq_client import ask_groq, parse_json_response


def optimize_verilog(verilog_code):
    prompt = f"""
You are a Senior RTL Design Engineer.

Optimize the following Verilog RTL.

Goals:
- Keep functionality identical.
- Improve readability.
- Improve coding style.
- Improve synthesizability.
- Reduce unnecessary logic.

Return ONLY valid JSON.

{{
    "optimized_code":"",
    "summary":""
}}

RTL:

{verilog_code}
"""

    response = ask_groq(prompt)

    return parse_json_response(
        response,
        {
            "optimized_code": verilog_code,
            "summary": "Optimization unavailable.",
        },
    )
