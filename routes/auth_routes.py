from fastapi import APIRouter
from models.login_model import LoginRequest, LoginResponse
from controllers.auth_controller import AuthController

router = APIRouter(prefix="/skill-mint", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """
    Login endpoint
    
    Accepts JSON payload with email and password
    Returns success status
    """
    return AuthController.login(login_data)
