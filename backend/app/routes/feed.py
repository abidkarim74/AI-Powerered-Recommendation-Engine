from fastapi import APIRouter, status, Depends, Query
from app.schemas.feed import PostCreate, PostResponse, TagCreate, TagResponse
from app.database.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.auth import verify_authentication
from app.controllers.feed import post_controller, tag_controller


posts_router = APIRouter(prefix='/api/posts', tags=['Posts'])


@posts_router.post('/', response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def post_create(data: PostCreate, user_id: str = Depends(verify_authentication), db: AsyncSession = Depends(get_db)):
    print(f"User id: {user_id}")
    return await post_controller.create(data, user_id, db)



@posts_router.get("/", response_model=list[PostResponse])
async def post_list(limit: int = Query(20, ge=1, le=100), user_id: str = Depends(verify_authentication), db: AsyncSession = Depends(get_db)):
    return await post_controller.list(user_id=user_id, db=db, limit=limit)


@posts_router.get("/auth", response_model=list[PostResponse])
async def auth_posts(limit: int = Query(20, ge=1, le=100), user_id: str = Depends(verify_authentication), db: AsyncSession = Depends(get_db)):
    return await post_controller.auth_posts(user_id=user_id, db=db, limit=limit)


@posts_router.get("/{post_id}", response_model=PostResponse)
async def post_detail(post_id: str, user_id: str = Depends(verify_authentication), db: AsyncSession = Depends(get_db)):
    return await post_controller.get(post_id=post_id, db=db)


tag_router = APIRouter(prefix='/api/tags', tags=['Tags'])


@tag_router.post('/', response_model=TagResponse)
async def tag_create(data: TagCreate, user_id: str = Depends(verify_authentication), db: AsyncSession = Depends(get_db)):
    return await tag_controller.create(data, user_id, db)


@tag_router.get('/')
async def tag_list(user_id: str = Depends(verify_authentication), db: AsyncSession = Depends(get_db)):
    return await tag_controller.list(user_id, db)


@tag_router.delete('/{tag_id}', response_model=dict[str, str])
async def tag_delete(tag_id: str, user_id: str = Depends(verify_authentication), db: AsyncSession = Depends(get_db)):
    return await tag_controller.delete(user_id, tag_id, db)


