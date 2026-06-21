from app.configs.configs import settings
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator

class Base(DeclarativeBase):
    pass


class DatabaseConnection:
    def __init__ (self):
        self.engine = create_async_engine(
            settings.DATABASE_URL,
            echo=False,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,  
            pool_timeout=30, 
        )
        
        self.session_factory = async_sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False
        ) 
    
    async def close(self):
        await self.engine.dispose()


db_connection = DatabaseConnection()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with db_connection.session_factory() as session:
        try:
            yield session
            await session.commit()

        except Exception:
            await session.rollback()
            raise