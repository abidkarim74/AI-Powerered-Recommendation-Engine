from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID

from datetime import datetime
"""
class Post(Base):
    __tablename__ = 'posts'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content: Mapped[str] = mapped_column(String(1000))
    image_url: Mapped[str] = mapped_column(String, nullable=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

"""
class PostBase(BaseModel):
    content: str = Field(max_length=1000, min_length=10)
    image_url: str | None = None


class PostCreate(PostBase):
    pass


class UserMini(BaseModel):
    id: UUID
    username: str
    fullname: str

    model_config = ConfigDict(from_attributes=True)


class PostResponse(BaseModel):
    id: UUID
    content: str
    image_url: str | None
    created_at: datetime
    user: UserMini

    model_config = ConfigDict(from_attributes=True)



"""
class Tag(Base):
    __tablename__ = 'tags'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content: Mapped[str] = mapped_column(String(40))
    preference_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('user_preferences.id', ondelete='CASCADE'), nullable=False, index=True)
"""

class TagBase(BaseModel):
    content: str = Field(max_length=40)

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)
    


class TagMini(BaseModel):
    content: str
    id: UUID

