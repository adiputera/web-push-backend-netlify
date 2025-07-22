const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, secret);
        return decoded.sub && `${process.env[decoded.sub]}`;
    } catch (error) {
        return false;
    }
}

module.exports = verifyToken;