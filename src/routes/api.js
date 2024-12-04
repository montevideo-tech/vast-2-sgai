// routes/api.js
const express = require('express');
const getVideoManifests = require('../utils/vast-parser.js');
const getListMPD = require('../utils/list-mpd-generator.js');

const router = express.Router();

// HLS Asset List
router.get('/asset-list', async (req, res) => {
  // TODO: Get the VAST URL from the request
  const ads = await getVideoManifests("http://localhost:3000/samples/sample-vast-1/vast-sample.xml", "m3u8");
  const assetList= { "ASSETS": []};
  ads.forEach(ad => {
    assetList.ASSETS.push({
      URI: ad.fileURL,
      DURATION: ad.duration
    });
  });
  res.json(assetList);
});

// MPEG-DASH MPD List
router.get('/list-mpd', async (req, res) => {
  // TODO: Get the VAST URL from the request
  const ads = await getVideoManifests("http://localhost:3000/samples/sample-vast-1/vast-sample.xml", "mpd");
  res.set('Content-Type', 'application/dash+xml');
  res.send(getListMPD(ads));
});

module.exports = router;