from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.utils.tokens import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')


CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='You are not authorized!',
    headers={'WWW-Authenticate': 'Bearer'}
)

def verify_authentication(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token, 'access')

    if not payload:
        raise CREDENTIALS_EXCEPTION
    
    user_id: str = payload.get('id')

    if not user_id:
        CREDENTIALS_EXCEPTION

    return user_id
