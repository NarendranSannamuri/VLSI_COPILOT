def build_prompt(parsed, analysis, warnings, metrics):

    prompt = f"""
You are a Senior RTL Design Engineer.

Analyze the following Verilog module.

Module Name:
{parsed['module_name']}

Inputs:
{parsed['inputs']}

Outputs:
{parsed['outputs']}

Assignments:
{parsed['assignments']}

RTL Analysis:
{analysis}

Warnings:
{warnings}

Metrics:
{metrics}

Generate:

1. Short RTL Summary
2. Possible Design Issues
3. Suggestions for Improvement
4. Interview Questions based on this design

Keep the explanation professional and concise.
"""

    return prompt