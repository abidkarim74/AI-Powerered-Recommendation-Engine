from app.utils.prompts import get_intent_classifier_system_prompt, get_intent_classifier_user_prompt
from app.llm.llm_connection import llm_connection
import asyncio
import json


class IntentClassifier:
    async def determine_intent(self, user_input: str):
        SYSTEM_PROMT = get_intent_classifier_system_prompt()
        USER_PROMPT = get_intent_classifier_user_prompt(user_input)

        response = await llm_connection.get_response(SYSTEM_PROMT, USER_PROMPT, json_output=True)

        return json.loads(response) if isinstance(response, str) else response

    
intent_classifier = IntentClassifier()

