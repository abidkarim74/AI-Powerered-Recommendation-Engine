from fastapi import APIRouter, status, Response, Cookie, Depends
from app.schemas.auth import UserResponse, UserCreate, LoginData, AuthResponse
from app.controllers.auth import auth_controller
from app.dependencies.auth import verify_authentication
from app.database.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession


auth_router = APIRouter(
    prefix='/api/auth',
    tags=['Authentication']
)


@auth_router.post('/signup', status_code=status.HTTP_201_CREATED, response_model=AuthResponse)
async def user_create(data: UserCreate, response: Response, db: AsyncSession = Depends(get_db)):
    return await auth_controller.signup(data, response, db)
    

@auth_router.post('/login', response_model=AuthResponse)
async def user_login(data: LoginData, response: Response, db: AsyncSession = Depends(get_db)):
    return await auth_controller.login(data, response, db)



@auth_router.post('/refresh-token', response_model=dict[str, str])
async def refresh_access_token(refresh_token: str = Cookie(None)):
    return await auth_controller.refresh_token(refresh_token)


@auth_router.get('/auth-user', response_model=dict[str, UserResponse])
async def auth_user(user_id: str = Depends(verify_authentication), db: AsyncSession = Depends(get_db)):
    return await auth_controller.authenticated_user(user_id, db)


@auth_router.post('/logout', response_model=dict[str, str])
async def logout_user(response: Response):
    return await auth_controller.logout(response)