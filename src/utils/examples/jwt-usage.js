const { signJWT, verifyJWT, middlewareJWT } = require('../jwt');

const payload = {
    url: 'https://www.example.com'
}

const token = signJWT(payload, {expiresIn: '24h'});
console.log('Signed JWT: ', token);

try {
    const decoded = verifyJWT(token);
    console.log('Decoded JWT payload:', decoded);
} catch (error) {
    console.error('Error verifying token: ', error.message);
}

const express = require('express');
const app = express();

//curl -H "Authorization: Bearer <TOKEN_LOGGED_BY_PREV_STEPS>" localhost:3001/jwt-test
app.get('/jwt-test', middlewareJWT, (req, res) => {
    res.json({ payload: req.jwtPayload });
});

app.listen(3001, () => console.log('JWT Test server running on port 3001'))