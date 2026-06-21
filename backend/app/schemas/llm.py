from pydantic import BaseModel
from uuid import UUID
from enum import Enum


class PostMini(BaseModel):
    id: UUID
    content: str


class AgentOption(Enum):
    NORMAL = 'normal'
    SEARCH = "search"
    OUT_OF_SCOPE = 'out_of_scope'


class UserPrompt(BaseModel):
    prompt: str
