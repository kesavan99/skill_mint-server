from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Model for login request payload"""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Model for login response"""
    status: str
