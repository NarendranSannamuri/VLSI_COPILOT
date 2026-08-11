import json
import os
import re

from dotenv import load_dotenv
from groq import Groq

load_dotenv()


def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        return Groq(api_key=api_key)
    except Exception:
        return None


def ask_groq(prompt):
    client = get_groq_client()
    if not client:
        return "AI service unavailable. Deterministic RTL analysis is still available."

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=0.3,
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"AI service unavailable. Deterministic RTL analysis is still available. (Error: {str(e)})"


def parse_json_response(response, fallback=None):
    if isinstance(response, (dict, list)):
        return response

    if not isinstance(response, str):
        return fallback

    text = response.strip()
    if not text or "AI service unavailable" in text:
        return fallback

    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text).strip()

    for marker in ("{", "["):
        start = text.find(marker)
        if start == -1:
            continue

        depth = 0
        in_string = False
        escaped = False
        for idx in range(start, len(text)):
            char = text[idx]
            if in_string:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == '"':
                    in_string = False
                continue

            if char == '"':
                in_string = True
            elif char == marker:
                depth += 1
            elif char == ("}" if marker == "{" else "]"):
                depth -= 1
                if depth == 0:
                    candidate = text[start:idx + 1]
                    try:
                        return json.loads(candidate)
                    except json.JSONDecodeError:
                        break

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return fallback