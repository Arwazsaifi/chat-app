const express = require('express');
const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

router.get('/', isAuthenticated, (req, res) => {
  res.json({message:'You are logged in!'});
});

module.exports = router;
