from backend.ai.groq_client import ask_groq, parse_json_response


def compare_rtl(original, optimized):
    prompt = f"""
You are a Senior RTL Design Engineer.

Compare these two RTL codes.

Original RTL:
{original}

Optimized RTL:
{optimized}

Return ONLY JSON.

{{
    "improvements":[
        "...",
        "...",
        "..."
    ]
}}
"""

    response = ask_groq(prompt)

    return parse_json_response(
        response,
        {"improvements": []},
    )
