from jose import jwt, JWTError
from app.schemas.auth import TokenPayload
import os
from app.configs.configs import settings
from uuid import uuid4
from datetime import datetime, timedelta, timezone


def create_access_token(payload: dict):
    try:
        token_data = payload.copy()
        expires_delta = timedelta(minutes=settings.ACCESS_EXPIRATION)

        expires_at = datetime.now(timezone.utc) + expires_delta
        token_data['exp'] = int(expires_at.timestamp())

        access_token = jwt.encode(token_data, settings.ACCESS_SECRET, settings.ALGORYTHM)

        return access_token
 
    except Exception as e:
        print(e)
        return None
  

def create_refresh_token(payload: dict) -> str:
    try:
        token_data = payload.copy()
        exp_delta = timedelta(days=int(settings.REFRESH_EXPIRATION))

        token_exp = datetime.now(timezone.utc) + exp_delta
        token_data['exp'] = int(token_exp.timestamp())

        refresh_token = jwt.encode(token_data, settings.REFRESH_SECRET, settings.ALGORYTHM)

        return refresh_token

    except Exception as e:
        print(e)
        return None


def verify_token(token: str, type: str):
    try:
        payload = None

        if type == 'access':
            secret = settings.ACCESS_SECRET
        elif type == 'refresh':
            secret = settings.REFRESH_SECRET
        else:
            return None
        
        payload = jwt.decode(token, secret, settings.ALGORYTHM)

        if payload.get('type') != type:
            return None    
        
        return payload

    except JWTError as e:
        print(e)
        return None
    
    except Exception as e:
        print(e)
        return None


if __name__ == '__main__':
    u = uuid4()

    token = create_access_token({'id': str(u), 'type': 'access'})

    print(token)

    # print(verify_token(token, 'access'))

    