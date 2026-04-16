const router = require("express").Router();
const passport = require('passport');

// auth login
router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

// auth status — JSON probe for current session state
router.get("/status", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return res.json({
      authenticated: true,
      username: req.user.username ?? null,
    });
  }
  return res.json({ authenticated: false, username: null });
});

// auth logout
router.get("/logout", (req, res) => {
  // handle with passport
  req.logout();
  res.redirect('/');
  //return res.send("logging out");
});

//#1 auth with google+
router.get("/google", passport.authenticate("google",{
    scope: ['profile'] //expected to return profile info
}));

//#2 callback for google to redirect to on accepting consent screen, comes back with code for profile exchange
//Middleware here calls google again to exchange code for profile info
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  //res.send(req.user)
  res.redirect('/profile/');
})

module.exports = router;
