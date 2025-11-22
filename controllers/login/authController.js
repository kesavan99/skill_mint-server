const UserService = require('../../services/userService');
const DataParser = require('../../utils/dataParser');
const JWTUtils = require('../../utils/jwtUtils');
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
        
        // Generate JWT token
        const token = JWTUtils.generateToken({
          userId: result.data.id,
          email: result.data.email,
          loginMethod: result.data.loginMethod
        });
        
        // Set cookie
        res.cookie('authToken', token, {
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 3 * 60 * 60 * 1000 // 3 hours
        });
        
        return res.status(201).json({
          status: 'success',
          message: 'Account created successfully',
          data: result.data,
          token: token
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
        
        // Generate JWT token
        const token = JWTUtils.generateToken({
          userId: existingUser._id,
          email: existingUser.email,
          loginMethod: existingUser.loginMethod
        });
        
        // Set cookie
        res.cookie('authToken', token, {
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 3 * 60 * 60 * 1000 // 3 hours
        });
        
        return res.status(200).json({
          status: 'success',
          message: 'Login successful',
          data: {
            email: existingUser.email,
            name: existingUser.name,
            loginMethod: existingUser.loginMethod
          },
          token: token
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
      
      // Generate JWT token
      const token = JWTUtils.generateToken({
        userId: result.data.id,
        email: result.data.email,
        loginMethod: 'google'
      });
      
      // Set cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 3 * 60 * 60 * 1000 // 3 hours
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Google login successful',
        data: result.data,
        token: token
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
