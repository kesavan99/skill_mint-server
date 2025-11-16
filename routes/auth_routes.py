from fastapi import APIRouter
from models.login_model import LoginRequest, LoginResponse, SignupRequest, SignupResponse
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


@router.post("/signup", response_model=SignupResponse)
async def signup(signup_data: SignupRequest):
    """
    Signup endpoint
    
    Accepts JSON payload with name, email and password
    Returns success status
    """
    return AuthController.signup(signup_data)
