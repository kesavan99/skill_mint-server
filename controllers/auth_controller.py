from models.login_model import LoginRequest, LoginResponse, SignupRequest, SignupResponse


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
    
    @staticmethod
    def signup(signup_data: SignupRequest) -> SignupResponse:
        """
        Handle signup logic
        
        Args:
            signup_data: SignupRequest containing name, email and password
            
        Returns:
            SignupResponse with status
        """
        # Add your signup logic here
        # For now, returning success for all requests
        
        return SignupResponse(status="success")
