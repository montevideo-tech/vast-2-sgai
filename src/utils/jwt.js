require('dotenv').config();
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET_KEY

function signJWT(payload, options = {}){
    return jwt.sign(payload, SECRET_KEY, options);
}

function verifyJWT(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        throw new Error('Invalid token: ' + error);
    }
}

function middlewareJWT(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
        
    if(!token) {
        return res.status(401).json({ error: 'Token not found in headers' });
    }

    try {
        req.jwtPayload = verifyJWT(token);
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }

}

module.exports = { signJWT, verifyJWT, middlewareJWT };
