const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user, done)=> {
  done(null, user.id); //stuff it to the cookie
})

passport.deserializeUser((id, done)=>{
  User.findById(id).then((user)=> {
    done(null, user);
  });
});
passport.use(
  new GoogleStrategy({
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: '/auth/google/redirect'
  },
  (accessToken, refreshToken, profile, done) => {
      //passport call back funtion is what really recieves profile info after the code-profile exchange
        // checkout if user already exists in our db
        User.findOne({googleId: profile.id}).then((currentUser)=>{
          if(currentUser) {
            // already have the user
             console.log("User is:"+ currentUser); 
             done(null, currentUser);
          } else {
            //if not create user in our db
            new User({
              username: profile.displayName,
              googleId: profile.id
            }).save()
              .then(newUser => {
                console.log("new user created" + newUser);
                done(null, newUser);
              });
          }
        })    
  })
);