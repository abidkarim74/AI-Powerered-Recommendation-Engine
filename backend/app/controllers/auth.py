from app.schemas.auth import UserCreate, LoginData
from fastapi import HTTPException, status, Response
from app.utils.hashing import hashing
from app.utils.tokens import create_access_token, create_refresh_token, verify_token
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.users import User
from sqlalchemy import select, or_


class AuthControllers:
    async def signup(self, data: UserCreate, response: Response, db: AsyncSession):
        try:
            statement = select(User.id).where(or_(
                User.username==data.username,
                User.email==data.email
            ))
            result = await db.execute(statement)

            user = result.scalar_one_or_none()

            if user:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Username or email already exists!')
                        
            hashed_pasword = hashing.hash(data.password)

            new_user = User(
                username=data.username, 
                email=data.email, 
                fullname=data.fullname, 
                password=hashed_pasword
            )
            db.add(new_user)
            await db.flush()
            await db.refresh(new_user)
            await db.commit()

            access_token = create_access_token({'id': str(new_user.id), 'type': 'access'})

            refresh_token = create_refresh_token({'id': str(new_user.id), 'type': 'refresh'})

            if not access_token or not refresh_token:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='none',
                max_age=60*60*24*7
            )

            return {'access_token': access_token, 'user': new_user}

        except Exception as e:
            error_dict = e.__dict__
            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))
        

    async def login(self, data: LoginData, response: Response, db: AsyncSession):
        try:
            statement = select(User).where(User.username==data.username)

            result = await db.execute(statement)

            user = result.scalar_one_or_none()

            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Username or password incorrect!')

            verify = hashing.verify(data.password, user.password)

            if not verify:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Password or Username incorrect!')
            
            access_token = create_access_token({'id': str(user.id), 'type': 'access'})

            refresh_token = create_refresh_token({'id': str(user.id), 'type': 'refresh'})

            if not access_token or not refresh_token:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                secure=True,
                httponly=True,
                samesite='none',
                max_age=60*60*24*7
            )
            
            return {'access_token': access_token, 'user': user}
            
        except Exception as e:
            print(e)
            error_dict = e.__dict__
            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))

    
    async def refresh_token(self, refresh_token: str):
        try:
            payload = verify_token(refresh_token, 'refresh')

            if not payload:
                raise HTTPException(status_code=401, detail='Unauthorized requst!')
            
            if not payload.get('id'):
                raise HTTPException(status_code=403, detail='Bad request!')

            new_access_token = create_access_token({'id':str(payload.get('id')), 'type': 'access'})

            if not new_access_token:
                raise HTTPException(status_code=403, detail='Bad request!')

            return {'data': new_access_token}

        except Exception as e:
            error_dict = e.__dict__

            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail',  'Internal server error!'))
        
    
    async def authenticated_user(self, user_id: str, db: AsyncSession):
        try:            
            user = await db.get(User, user_id)

            if user is None:
                raise HTTPException(status_code=404, detail='User not found!')
            
            return {'data': user}
        
        except Exception as e:
            error_dict = e.__dict__

            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))
        
    
    async def logout(self, response: Response):
        response.delete_cookie(key='refresh_token', httponly=True,
            samesite='none',
            secure=True
        )

        return {'message': 'Logged out successfully!'}


auth_controller = AuthControllers()