from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Model for login request payload"""
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    """Model for signup request payload"""
    name: str
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Model for login response"""
    status: str


class SignupResponse(BaseModel):
    """Model for signup response"""
    status: str
