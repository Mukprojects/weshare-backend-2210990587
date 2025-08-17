const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const User = require('../models/User');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // Validation
      if (!email || !password || !name) {
        return res.status(400).json({
          error: 'Email, password, and name are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'Password must be at least 6 characters long'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          error: 'User with this email already exists'
        });
      }

      // Create new user
      const user = new User({
        email: email.toLowerCase(),
        password,
        name: name.trim()
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          token
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required'
        });
      }

      // Use passport local strategy
      passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ error: 'Login failed' });
        }

        if (!user) {
          return res.status(401).json({
            error: info?.message || 'Invalid credentials'
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            user: user.toJSON(),
            token
          }
        });

      })(req, res);

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select('-password');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { name } = req.body;
      const updates = {};

      if (name && name.trim()) {
        updates.name = name.trim();
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'No valid fields to update'
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: 'New password must be at least 6 characters long'
        });
      }

      const user = await User.findById(req.user._id);
      
      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }

  // Verify token
  async verifyToken(req, res) {
    res.json({
      success: true,
      message: 'Token is valid',
      data: { user: req.user }
    });
  }
}

module.exports = new AuthController();