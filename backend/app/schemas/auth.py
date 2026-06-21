from pydantic import BaseModel, field_validator, Field, ConfigDict
from uuid import UUID, uuid4
from enum import Enum
from datetime import datetime

    
class UserBase(BaseModel):
    username: str = Field(min_length=5, max_length=20)
    fullname: str = Field(max_length=20, min_length=3)
    email: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, value: str):
        if '@' not in value:
            raise ValueError('Email not valid!')
        
        if not value.endswith('@gmail.com'):
            raise ValueError('Please only you Google domain emails!')
        
        return value


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=72)


class UserUpdate(BaseModel):
    fullname: str | None = None
    age: int | None = None
    password: str | None = None


class UserResponse(UserBase):
    id: UUID
    age: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)



class TokenType(Enum):
    ACCESS = 'access'
    REFRESH = 'refresh'

class TokenPayload(BaseModel):
    id: UUID
    type: TokenType
    exp: str
    

class LoginData(BaseModel):
    password: str
    username: str


class AuthResponse(BaseModel):
    access_token: str
    user: UserResponse