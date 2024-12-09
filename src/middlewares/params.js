const {middlewareJWTQuery} = require('../utils/jwt');
const {vastServerWhitelistMiddleware} = require('./whitelist');
const {vastIdMiddleware} = require('./vast-id');

function paramsMiddleware(req, res, next) {
    const { jwt, vasturl, vastid } = req.query;

    const params = [jwt, vasturl, vastid].filter(param => param !== undefined);
    if(params.length > 1) {
        return res.status(400).json({ message: 'Provide only one param at a time: jwt, vasturl or vastid' })
    }

    if (jwt) {
        return middlewareJWTQuery(req, res, next);
    } else if (vasturl) {
        return vastServerWhitelistMiddleware(req, res, next);
    } else if (vastid){
        return vastIdMiddleware(req, res, next);
    } else {
        return res.status(400).json({ message: 'No valid query param provided. Use jwt, vasturl or vastid' })
    }
}

module.exports = { paramsMiddleware };