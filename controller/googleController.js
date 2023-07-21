const bcrypt = require('bcrypt');
const User = require('../models/user');
const { OAuth2Client } = require('google-auth-library');
const dotenv = require('dotenv'); 
dotenv.config();

const googleOAuthClient = new OAuth2Client(process.env.Client_Id);

const registerUserWithGoogle = async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken,
      audience:process.env.Client_Id,
    });

    const { email, name } = ticket.getPayload();

    const existingUser = await User.findOne({ username: email });
    if (existingUser) {
      return res.status(409).send('User already registered with Google Sign-In');
    }

    const newUser = new User({ username: email });
    await newUser.save();

    res.status(201).json({ username: email });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred during registration');
  }
};

module.exports = {registerUserWithGoogle };
