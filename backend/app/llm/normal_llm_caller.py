from app.llm.llm_connection import llm_connection
from app.utils.prompts import get_normal_response_system_prompt, get_normal_response_user_prompt, get_search_response_system_prompt, get_search_response_user_prompt


class NormalLLMCaller:
    def chat(self, user_message: str):
        system_prompt = get_normal_response_system_prompt()
        user_prompt = get_normal_response_user_prompt(user_message)

        return llm_connection.stream_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=512,
            temperature=0.8,
            top_p=0.9,
            top_k=40,
            repeat_penalty=1.1,
            seed=-1,
        )
    
    def search_chat(self, user_message: str, candidates: list[dict]):
        system_prompt = get_search_response_system_prompt()
        user_prompt = get_search_response_user_prompt(user_message, candidates)

        return llm_connection.stream_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=512,
            temperature=0.5,
            top_p=0.9,
            top_k=40,
            repeat_penalty=1.1,
            seed=-1,
        )
    
import asyncio

caller = NormalLLMCaller()

