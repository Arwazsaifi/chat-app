const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const googleController=require('../controller/googleController');
const passport = require('../config/passport');

router.post('/register', authController.registerUser);

router.post('/register-google',googleController.registerUserWithGoogle);

router.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

// router.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/');
// });

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      res.status(500).send('Error logging out.');
    } else {
      res.redirect('/');
    }
  });
});


module.exports = router;
