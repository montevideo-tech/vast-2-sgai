require('dotenv').config({path: 'src/.env'});
const vastWhitelist = process.env.VAST_WHITELIST || '';
const originWhitelist = process.env.ORIGIN_WHITELIST || '';

function vastServerWhitelistMiddleware(req, res, next) {

    const { vasturl } = req.query;

    if(vastWhitelist === '') {
        return next();
    }

    if (!vasturl) {
        return res.status(400).json({ message: "Missing vasturl query param" });
    }

    try {
        const hostname = new URL(vasturl).hostname;
        console.log('hostname: ' + hostname)
        const isAllowedVast = vastWhitelist.split(',').includes(hostname);
        console.log(vastWhitelist);
        console.log('VAST Allowed?: ' + isAllowedVast)

        if(isAllowedVast) {
            return next();
        } else {
           return res.status(403).json({ message: 'Forbidden: VAST URL not allowed'})
        }
    } catch (error) {
       return res.status(400).json({ message: "Bad Request: Invalid VAST URL" });
    }
}

function originWhitelistMiddleware(req, res, next) {

    const origin = req.headers.origin;
    console.log(originWhitelist)
    console.log(originWhitelist.length)

    if(originWhitelist === ''){
       return next();
    }

    if(!origin) {
        return res.status(400).json({ message: "Bad Request: Origin header is required" });
    }

    try {
        const hostname = new URL(origin).hostname;
        const isAllowedOrigin = originWhitelist.split(',').includes(hostname);

        if(isAllowedOrigin) {
            return next();
        } else {
            return res.status(403).json({ message: 'Forbidden: Origin host not allowed'})
        }
    } catch (error) {
        return res.status(400).json({ message: "Bad Request: Invalid Origin header" });
    }

}

module.exports = { originWhitelistMiddleware, vastServerWhitelistMiddleware };