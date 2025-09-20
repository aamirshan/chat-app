const jwt = require('jsonwebtoken');
const User = require('../models/user');

const socketAuth = async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.user.id);

        if (!user) {
            return next(new Error('Authentication error'));
        }

        socket.user = user;
        next();
    } catch (err) {
        return next(new Error('Authentication error'));
    }
};

module.exports = socketAuth;
