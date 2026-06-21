from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from app.dependencies.auth import verify_authentication
from starlette.middleware.base import BaseHTTPMiddleware
from app.routes.auth import auth_router
from app.database.db import db_connection
import time
from sqlalchemy import text
from contextlib import asynccontextmanager
from app.routes.feed import posts_router, tag_router
from app.llm.recommendation_engine import engine
from app.database.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.llm import PostMini
from app.routes.llm import llm_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with db_connection.session_factory() as session:
            await session.execute(text("SELECT 1"))

        print("Database connected successfully!")

    except Exception as e:
        print(f"Database connection failed: {e}")
        raise

    yield

    await db_connection.close()

    print("Database disconnected")


app = FastAPI(debug=False, title="Social API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/', response_model=list[PostMini])
async def home(token: str = Depends(verify_authentication), db: AsyncSession = Depends(get_db)):
    return await engine.recommendations(token,db, 40)


app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(tag_router)
app.include_router(llm_router)


