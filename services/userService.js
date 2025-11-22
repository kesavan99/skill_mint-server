const User = require('../models/schemas/userSchema');
const DataParser = require('../utils/dataParser');
const { ERROR_CODES, ERROR_MESSAGES } = require('../constants/errorCodes');

class UserService {
  static async createUser(apiData) {
    try {
      const cleanData = DataParser.parseUserData(apiData);
      
      const user = new User(cleanData);
      await user.save();
      
      return {
        success: true,
        data: {
          id: user._id,
          email: user.email,
          name: user.name,
          loginMethod: user.loginMethod,
          createdAt: user.createdAt
        }
      };
    } catch (error) {
      if (error.code === 11000) {
        const customError = new Error(ERROR_MESSAGES.ERC16);
        customError.code = ERROR_CODES.ERC16;
        throw customError;
      }
      const customError = new Error(ERROR_MESSAGES.ERC12);
      customError.code = ERROR_CODES.ERC12;
      customError.originalError = error;
      throw customError;
    }
  }

  static async createOrUpdateGoogleUser(googleData) {
    try {
      const { email, name, googleId, profilePicture } = googleData;
      
      // Check if user exists
      let user = await User.findOne({ 
        $or: [
          { email: email.toLowerCase() },
          { googleId: googleId }
        ]
      });

      if (user) {
        // Update existing user
        user.name = name || user.name;
        user.loginMethod = 'google';
        user.googleId = googleId;
        user.profilePicture = profilePicture || user.profilePicture;
        user.updatedAt = Date.now();
        await user.save();
      } else {
        // Create new user
        user = new User({
          email: email.toLowerCase(),
          name: name,
          loginMethod: 'google',
          googleId: googleId,
          profilePicture: profilePicture
        });
        await user.save();
      }

      return {
        success: true,
        data: {
          id: user._id,
          email: user.email,
          name: user.name,
          loginMethod: user.loginMethod,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt
        }
      };
    } catch (error) {
      const customError = new Error(ERROR_MESSAGES.ERC12);
      customError.code = ERROR_CODES.ERC12;
      customError.originalError = error;
      throw customError;
    }
  }

  static async findUserByEmail(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user;
    } catch (error) {
      const customError = new Error(ERROR_MESSAGES.ERC5);
      customError.code = ERROR_CODES.ERC5;
      customError.originalError = error;
      throw customError;
    }
  }

  static async updateUser(email, updateData) {
    try {
      const cleanData = DataParser.sanitizeInput(updateData);
      
      const user = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { $set: { ...cleanData, updatedAt: Date.now() } },
        { new: true, runValidators: true }
      );

      if (!user) {
        const customError = new Error(ERROR_MESSAGES.ERC15);
        customError.code = ERROR_CODES.ERC15;
        throw customError;
      }

      return user;
    } catch (error) {
      if (error.code && error.code.startsWith('ERC')) {
        throw error;
      }
      const customError = new Error(ERROR_MESSAGES.ERC13);
      customError.code = ERROR_CODES.ERC13;
      customError.originalError = error;
      throw customError;
    }
  }

  static async deleteUser(email) {
    try {
      const user = await User.findOneAndDelete({ email: email.toLowerCase() });
      if (!user) {
        const customError = new Error(ERROR_MESSAGES.ERC15);
        customError.code = ERROR_CODES.ERC15;
        throw customError;
      }
      return user;
    } catch (error) {
      if (error.code && error.code.startsWith('ERC')) {
        throw error;
      }
      const customError = new Error(ERROR_MESSAGES.ERC14);
      customError.code = ERROR_CODES.ERC14;
      customError.originalError = error;
      throw customError;
    }
  }

  static async getAllUsers(filters = {}) {
    try {
      const users = await User.find(filters).select('-password');
      return users;
    } catch (error) {
      const customError = new Error(ERROR_MESSAGES.ERC5);
      customError.code = ERROR_CODES.ERC5;
      customError.originalError = error;
      throw customError;
    }
  }
}

module.exports = UserService;
