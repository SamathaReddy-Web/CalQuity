import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
print("GROQ KEY LOADED:", bool(GROQ_API_KEY))

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.1-8b-instant"

HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json",
}

def call_groq(messages):
    if not GROQ_API_KEY:
        return "Groq API key not configured."

    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.4,
        "max_tokens": 512,
        "stream": False,
    }

    try:
        r = requests.post(GROQ_URL, headers=HEADERS, json=payload, timeout=30)

        if r.status_code != 200:
            return f"Groq error {r.status_code}: {r.text}"

        data = r.json()
        return data["choices"][0]["message"]["content"]

    except Exception as e:
        return f"Groq exception: {e}"

def llm_only_answer(query: str) -> str:
    return call_groq([
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": query},
    ])

def llm_with_context(query: str, context: str) -> str:
    return call_groq([
        {
            "role": "system",
            "content": "Answer using the context. Summarize naturally. Do not copy verbatim."
        },
        {
            "role": "user",
            "content": f"Context:\n{context}\n\nQuestion:\n{query}"
        },
    ])
