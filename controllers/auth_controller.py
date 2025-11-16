from models.login_model import LoginRequest, LoginResponse


class AuthController:
    """Controller to handle authentication operations"""
    
    @staticmethod
    def login(login_data: LoginRequest) -> LoginResponse:
        """
        Handle login logic
        
        Args:
            login_data: LoginRequest containing email and password
            
        Returns:
            LoginResponse with status
        """
        # Add your authentication logic here
        # For now, returning success for all requests
        
        return LoginResponse(status="success")
