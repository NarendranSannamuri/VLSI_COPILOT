from backend.ai.gemini_client import ask_gemini

def review_verilog(verilog_code):
    prompt = f"""
You are a Senior VLSI RTL Design Engineer.

Review the following Verilog code.

Give:

1. Short summary
2. Coding quality
3. Possible issues
4. Optimization suggestions

Verilog Code:

{verilog_code}
"""

    return ask_gemini(prompt)