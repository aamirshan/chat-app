const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const userController = require('../controllers/user');

// @route   GET api/users
// @desc    Get all users
// @access  Private
router.get('/', auth, userController.getUsers);

module.exports = router;
