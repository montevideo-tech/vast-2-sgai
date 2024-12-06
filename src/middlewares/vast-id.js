const vastMapping = require('../config/vast-mapping')

function vastIdMiddleware(req, res, next) {
    const { vastid } = req.query;
    if(!vastid) {
        return res.status(400).json({ message: 'Missing vastid query param' });
    }

    const vasturl = vastMapping[vastid];
    if(!vasturl) {
        return res.status(404).json({ message: `No VAST URL found for id: ${vastid}` });
    }

    req.query.vasturl = vasturl;
    return next();
}

module.exports = {vastIdMiddleware}