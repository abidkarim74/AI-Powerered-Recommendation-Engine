import asyncio
import httpx
from dotenv import load_dotenv
from app.configs.configs import settings
import time

load_dotenv()

API_BASE_URL = settings.LLM_BASE_URL

total_time: float = 0

async def chat(prompt: str, system: str = "You are a helpful assistant."):

    client = httpx.AsyncClient(timeout=120.0)

    try:
        start = time.time()
        response = await client.post(
            f"{API_BASE_URL}/v1/chat/completions",
            json={
                "model": settings.LLM_MODEL,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": 512,
                "temperature": 0.7,
            },
        )

        response.raise_for_status()

        global total_time

        total_time = time.time() - start

        return response.json()["choices"][0]["message"]["content"]

    finally:
        await client.aclose()


async def main():
    reply = await chat("Just say one word, random. nothing else")
    print(reply)

    print(f"Total time for LLM Response: {total_time:.6f}")

if __name__ == "__main__":
    asyncio.run(main())