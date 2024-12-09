const vastMapping = require('../config/vast-mapping')

function vastIdMiddleware(req, res, next) {
    const { vastid } = req.query;
    if(!vastid) {
        return res.status(400).json({ message: 'Missing vastid query param' });
    }

    const vastidurl = vastMapping[vastid];
    if(!vastidurl) {
        return res.status(404).json({ message: `No VAST URL found for id: ${vastid}` });
    }

    req.query.vastidurl = vastidurl;
    return next();
}

module.exports = {vastIdMiddleware}