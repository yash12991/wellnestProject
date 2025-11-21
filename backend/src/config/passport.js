const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../Models/User.models');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/v1/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔐 Google OAuth callback received for:', profile.emails[0].value);

        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('✅ Existing Google user found:', user.email);
          return done(null, user);
        }

        // Check if user exists with this email (link accounts)
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          console.log('🔗 Linking Google account to existing user:', user.email);
          user.googleId = profile.id;
          user.isVerified = true; // Auto-verify OAuth users
          await user.save();
          return done(null, user);
        }

        // Create new user with Google account
        console.log('✨ Creating new user with Google OAuth');
        user = await User.create({
          username: profile.displayName || profile.emails[0].value.split('@')[0],
          email: profile.emails[0].value,
          googleId: profile.id,
          isVerified: true, // Auto-verify OAuth users
          isOnboardingComplete: false, // They still need to complete onboarding
          profilePicture: profile.photos[0]?.value || '',
        });

        console.log('✅ New Google user created:', user.email);
        return done(null, user);
      } catch (error) {
        console.error('❌ Error in Google OAuth strategy:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
