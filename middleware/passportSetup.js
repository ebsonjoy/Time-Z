const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const googleAuthUsers = require("../models/googleAuthUsers");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await googleAuthUsers.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await googleAuthUsers.findOne({ googleId: profile.id });

    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = new googleAuthUsers({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value
      // Add other user fields as needed
    });

    await newUser.save();
    done(null, newUser);
  } catch (err) {
    done(err, null);
  }
}));

const authController = {
  googleAuth: passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),

  googleAuthCallback: (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect('/userLogin');
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        req.session.userID = user._id; // Assuming your user model uses "_id" as the ID field
        return res.redirect('/');
      });
    })(req, res, next);
  },
};

module.exports = authController;
