import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import { User } from '../Models/User.models.js';

const router = express.Router();

// @route   GET /v1/api/auth/google
// @desc    Initiate Google OAuth flow
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// @route   GET /v1/api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`,
    session: false, // We'll use JWT instead of sessions
  }),
  async (req, res) => {
    try {
      const user = req.user;

      // Generate JWT tokens
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      console.log('✅ Google OAuth successful for:', user.email);

      // Redirect to frontend with tokens and user data
      const redirectUrl = new URL(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-callback`);
      redirectUrl.searchParams.set('accessToken', accessToken);
      redirectUrl.searchParams.set('refreshToken', refreshToken);
      redirectUrl.searchParams.set('user', JSON.stringify({
        _id: user._id,
        username: user.username,
        email: user.email,
        isOnboardingComplete: user.isOnboardingComplete,
        profilePicture: user.profilePicture,
      }));

      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('❌ Error in Google OAuth callback:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
    }
  }
);

// @route   POST /v1/api/auth/refresh-token
// @desc    Refresh access token using refresh token
// @access  Public
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Find user
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate new access token
    const newAccessToken = user.generateAccessToken();
    
    console.log('✅ Token refreshed for user:', user.email);

    res.json({
      success: true,
      accessToken: newAccessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isOnboardingComplete: user.isOnboardingComplete,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('❌ Token refresh error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
});

// @route   POST /v1/api/auth/logout
// @desc    Logout user (clear tokens on client side)
// @access  Public
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
