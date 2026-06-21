from app.database.db import Base
import uuid
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import String, Integer, DateTime, func
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    fullname: Mapped[str | None] = mapped_column(String(100))

    username: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(60), unique=True, index=True)

    age: Mapped[int] = mapped_column(Integer, default=18)
    password: Mapped[str] = mapped_column(String(254))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), server_onupdate=func.now())

