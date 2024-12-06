require('dotenv').config({path: 'src/.env'});
const enableVastWhitelist = process.env.ENABLE_VAST_WHITELIST === 'true';
const enableOriginWhitelist = process.env.ENABLE_ORIGIN_WHITELIST === 'true';
const vastWhitelist = ( process.env.VAST_WHITELIST || '' ).split(',');
const originWhitelist = ( process.env.ORIGIN_WHITELIST || '' ).split(',');

function vastServerWhitelistMiddleware(req, res, next) {

    const { vasturl } = req.query;

    if(!enableVastWhitelist) {
        console.log('VAST WHITELIST NOT ENABLED')
        return next();
    }

    if (!vasturl) {
        return res.status(400).json({ message: "Missing vasturl query param" });
    }

    try {
        const hostname = new URL(vasturl).hostname;
        console.log('hostname: ' + hostname)
        const isAllowedVast = vastWhitelist.includes(hostname);
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

    if(!enableOriginWhitelist){
       return next();
    }

    if(!origin) {
        return res.status(400).json({ message: "Bad Request: Origin header is required" });
    }

    try {
        const hostname = new URL(origin).hostname;
        const isAllowedOrigin = originWhitelist.includes(hostname);

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