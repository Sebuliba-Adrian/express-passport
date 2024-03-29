const express = require("express");
const authRoutes = require("./routes/auth-routes");
const profileRoutes = require("./routes/profile-routes");
const passportStrategy = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const cookieSession = require('cookie-session');
const passport = require('passport');

const app = express();

// set view engine
app.set("view engine", "ejs");
app.use(cookieSession({
  maxAge: 24*60*60*1000,
  keys: [keys.session.cookieKey]
}))

//initialize passport
app.use(passport.initialize());
app.use(passport.session());
//connect to mongodb
// mongoose.connect(keys.mongodb.dbURI, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
//   console.log("DB Connected!");
// });
mongoose.connect(keys.mongodb.dbURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: true
});
mongoose.connection.once("open", () => {
  console.log("DB Connected!");
});
// set up routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

// create home route
app.get("/", (req, res) => {
  res.render("home");
});

app.listen(3000, () => {
  console.log("app now listening for requests on port 3000");
});
