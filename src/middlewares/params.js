const {middlewareJWTQuery} = require('../utils/jwt');
const {vastServerWhitelistMiddleware} = require('./whitelist');
const {vastIdMiddleware} = require('./vast-id');

function paramsMiddleware(req, res, next) {
    const { jwt, vasturl, vastid } = req.query;

    if (jwt) {
        return middlewareJWTQuery(req, res, next);
    } else if (vasturl) {
        return vastServerWhitelistMiddleware(req, res, next);
    } else if (vastid){
        return vastIdMiddleware(req, res, next);
    } else {
        return res.status(400).json({ message: 'No valid query param provided. Use jwt or vasturl' })
    }
}

module.exports = { paramsMiddleware };