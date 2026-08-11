from backend.ai.groq_client import ask_groq

def chat_with_rtl(rtl, question):

    prompt = f"""
You are an expert RTL Design Assistant.

The user uploaded this Verilog RTL:

{rtl}

Question:
{question}

Rules:
- Answer only the question.
- Keep the answer under 150 words unless asked otherwise.
- Use plain English.
- Do NOT use Markdown.
- Do NOT use LaTeX ($...$).
- Do NOT use tables.
- Use simple paragraphs and bullet points only.
"""

    return ask_groq(prompt)