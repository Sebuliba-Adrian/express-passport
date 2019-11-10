const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');
const User = require('../models/user-model');
passport.use(
  new GoogleStrategy({
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: '/auth/google/redirect'
  },
  (accessToken, refreshToken, profile, done) => {
      //passport call back funtion is what really recieves profile info after the code-profile exchange
      console.log('passport callback function fired');
      console.log(profile);
      new User({
        username: profile.displayName,
        googleId: profile.id
      }).save().then((newUser)=> {
        console.log('new user created'+ newUser);
      })
  })
);