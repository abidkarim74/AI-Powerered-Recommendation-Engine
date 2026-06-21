from fastapi import APIRouter, Depends
from app.dependencies.auth import verify_authentication
from app.database.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.controllers.llm import llm_controller
from app.schemas.llm import UserPrompt

llm_router = APIRouter(prefix='/api/llm', tags=['LLM'])


@llm_router.post('/chat')
async def llm_chat(data: UserPrompt, user_id: str = Depends(verify_authentication), db: AsyncSession = Depends(get_db)):
    return await llm_controller.chat(user_id, data, db)
