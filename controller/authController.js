const bcrypt = require('bcrypt');
const User = require('../models/user');

const registerUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.json({message:'User registered successfully!'});
  } catch (err) {
    console.error(err);
    res.status(500).json('Error registering user.');
  }
};

module.exports ={registerUser};
