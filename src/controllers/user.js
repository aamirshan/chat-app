const User = require('../models/user');

exports.getUsers = async (req, res) => {
  try {
    // req.user.id is from the auth middleware
    const users = await User.findAll(req.user.id);
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
