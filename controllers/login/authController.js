const UserService = require('../../services/userService');
const DataParser = require('../../utils/dataParser');
const { ERROR_CODES } = require('../../constants/errorCodes');

class AuthController {
  static async login(req, res) {
    try {
      const rawData = req.body;
      
      const isSignup = rawData.newOne === true;
      
      const cleanData = DataParser.parseUserData(rawData);
      
      if (!cleanData.email || !cleanData.password) {
        return res.status(400).json({
          status: 'error',
          code: ERROR_CODES.ERC1
        });
      }
      
      const existingUser = await UserService.findUserByEmail(cleanData.email);
      
      if (isSignup) {
        if (existingUser) {
          return res.status(409).json({
            status: 'error',
            code: ERROR_CODES.ERC2
          });
        }
        
        const result = await UserService.createUser(cleanData);
        
        return res.status(201).json({
          status: 'success',
          message: 'Account created successfully',
          data: result.data
        });
      } else {
        if (!existingUser) {
          return res.status(404).json({
            status: 'error',
            code: ERROR_CODES.ERC3
          });
        }
        
        if (existingUser.password !== cleanData.password) {
          return res.status(401).json({
            status: 'error',
            code: ERROR_CODES.ERC4
          });
        }
        
        return res.status(200).json({
          status: 'success',
          message: 'Login successful',
          data: {
            email: existingUser.email,
            name: existingUser.name
          }
        });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      // If error has custom error code, use it
      if (error.code && error.code.startsWith('ERC')) {
        return res.status(500).json({
          status: 'error',
          code: error.code
        });
      }
      
      // Default internal server error
      return res.status(500).json({
        status: 'error',
        code: ERROR_CODES.ERC5
      });
    }
  }

  static async googleLogin(req, res) {
    try {
      const { email, name, googleId, profilePicture } = req.body;
      
      if (!email || !googleId) {
        return res.status(400).json({
          status: 'error',
          code: ERROR_CODES.ERC1,
          message: 'Email and Google ID are required'
        });
      }
      
      const result = await UserService.createOrUpdateGoogleUser({
        email,
        name,
        googleId,
        profilePicture
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Google login successful',
        data: result.data
      });
      
    } catch (error) {
      console.error('Google login error:', error);
      
      if (error.code && error.code.startsWith('ERC')) {
        return res.status(500).json({
          status: 'error',
          code: error.code
        });
      }
      
      return res.status(500).json({
        status: 'error',
        code: ERROR_CODES.ERC5,
        message: 'Google login failed'
      });
    }
  }
}

module.exports = AuthController;
