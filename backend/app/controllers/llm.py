from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.users import User
from app.schemas.llm import UserPrompt, AgentOption
from app.llm.intent_classifier import intent_classifier
from app.llm.llm_connection import llm_connection
from app.llm.normal_llm_caller import caller
from app.llm.sementic_retriever import semantic_retriever
from app.models.feeds import Post
from sqlalchemy import select

import logging
logger = logging.getLogger(__name__)


from fastapi.responses import StreamingResponse

class LLMController:
    async def chat(self, user_id: str, data: UserPrompt, db: AsyncSession):
        try:
            user = await db.get(User, user_id)

            if not user:
                raise HTTPException(status_code=404, detail='User not found!')

            result = await intent_classifier.determine_intent(data.prompt)

            print(result)

            if result['intent'] == AgentOption.NORMAL.value:
                return StreamingResponse(
                    caller.chat(data.prompt),
                    media_type="text/event-stream"
                )

            elif result['intent'] == AgentOption.SEARCH.value:
                rewritten_query = result['rewritten_query']

                db_result = await db.execute(select(Post))
                posts = db_result.scalars().all()

                candidates = await semantic_retriever.retrieve_candidates_async(
                    user_tags=rewritten_query.split(),
                    posts=[{"id": p.id, "content": p.content, "embedding": p.embedding} for p in posts],
                    top_k=5
                )

                return StreamingResponse(
                    caller.search_chat(data.prompt, candidates),
                    media_type="text/event-stream"
                )

            elif result['intent'] == AgentOption.OUT_OF_SCOPE.value:
                return StreamingResponse(
                    out_of_scope_response(),
                    media_type="text/event-stream"
                )

            else:
                raise HTTPException(status_code=400, detail='Unknown intent!')

        except HTTPException:
            raise
        except Exception as e:
            logger.exception(f"LLMController.chat failed: {e}")

            raise HTTPException(status_code=500, detail='Internal server error!')


def out_of_scope_response():
    async def _gen():
        yield "I'm only able to help with questions about the app and its content."
    return _gen()


llm_controller = LLMController()