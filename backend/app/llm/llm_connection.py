from app.configs.configs import settings
import httpx
import json


class LLMConnection:
    def __init__(self):
        self.base_url = settings.LLM_BASE_URL
        self.model_name = settings.LLM_MODEL
        self.client = httpx.AsyncClient(timeout=40000)
        
    async def get_response(self, system_prompt: str, user_prompt: str, max_tokens: int = 512, temperature: float = 0.7, top_p: float = 0.9, top_k: float = 40,  repeat_penalty: float = 1.1,  seed: int = -1, stream: bool = False,  json_output: bool = False):
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature, 
            "top_p": top_p,
            "seed": seed,
            "stream": stream,
        }

        payload["top_k"] = top_k
        payload["repeat_penalty"] = repeat_penalty

        if json_output:
            payload["response_format"] = {"type": "json_object"}

        if not stream:
            return await self._normal_response(payload, is_json=json_output)
        else:
            pass
            #  return self._streaming_response(payload)
    

    async def _normal_response(self, payload: dict, is_json: bool = False):
        try:
            # Make sure to print(e.response.text) if it fails again to see the exact server complaint!
            response = await self.client.post(f"{self.base_url}/v1/chat/completions", json=payload)
            response.raise_for_status()
            
            content = response.json()['choices'][0]['message']['content']

            # 3. Only parse as JSON if we actually requested JSON
            if is_json:
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    raise RuntimeError(f"LLM did not return valid JSON. Raw output: {content}")
            
            return content

        except httpx.ConnectError:
            raise RuntimeError("LLM server is not running!")
        
        except httpx.ReadTimeout:
            raise RuntimeError("LLM server timed out!")
        
        except httpx.HTTPStatusError as e:
            # This captures the exact complaint from the server for easier debugging
            error_body = e.response.text if hasattr(e, 'response') else "No details"
            raise RuntimeError(f"LLM server error ({e.response.status_code}): {error_body}")
        
        except KeyError:
            raise RuntimeError("Unexpected LLM response format!")

    async def _streaming_response(self, payload: dict, parse_json: bool = False):
        try:
            payload["stream"] = True
            full_content = []

            async with self.client.stream("POST", f"{self.base_url}/v1/chat/completions", json=payload) as response:
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue

                    raw = line[len("data: "):]

                    if raw.strip() == "[DONE]":
                        break

                    chunk = json.loads(raw)
                    delta = chunk["choices"][0]["delta"].get("content", "")

                    if delta:
                        full_content.append(delta)
                        yield delta

            if parse_json:
                data = json.loads("".join(full_content))
                yield data

        except httpx.ConnectError:
            raise RuntimeError("LLM server is not running!")

        except httpx.ReadTimeout:
            raise RuntimeError("LLM server timed out!")

        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"LLM server error: {e}")

        except (KeyError, IndexError):
            raise RuntimeError("Unexpected LLM response format!")

        except json.JSONDecodeError:
            raise RuntimeError("LLM returned invalid JSON!")
        
    def stream_response(self, system_prompt: str, user_prompt: str, max_tokens: int = 512, temperature: float = 0.7, top_p: float = 0.9, top_k: float = 40, repeat_penalty: float = 1.1, seed: int = -1, parse_json: bool = False):
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
            "seed": seed,
            "stream": True,
            "top_k": top_k,
            "repeat_penalty": repeat_penalty,
        }

        return self._streaming_response(payload, parse_json=parse_json) 

    async def close(self):
        await self.client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self.close()


llm_connection = LLMConnection()


