from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
base_url = os.getenv("GEMINI_BASE_URL")
model = os.getenv("LLM_MODEL")

print(f"Key: {api_key[:5]}...")
print(f"Base: {base_url}")
print(f"Model: {model}")

client = OpenAI(
    api_key=api_key,
    base_url=base_url
)

try:
    print("Listing models...")
    models = client.models.list()
    for m in models.data:
        print(f"- {m.id}")
except Exception as e:
    print(f"Error listing models: {e}")
    
    # Try backup model name
    try:
        print("Trying gemini-1.5-flash-001...")
        response = client.chat.completions.create(
            model="gemini-1.5-flash-001",
            messages=[
                {"role": "user", "content": "Hello"}
            ]
        )
        print("Success with gemini-1.5-flash-001!")
    except Exception as e2:
        print(f"Error 2: {e2}")
