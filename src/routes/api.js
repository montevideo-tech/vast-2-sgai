// routes/api.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const getVideoManifests = require("../utils/vast-parser.js");
const getListMPD = require("../utils/list-mpd-generator.js");
const { signJWT } = require("../utils/jwt.js");
const updateQueryParams = require("../utils/replace-queryparams.js");

const { originWhitelistMiddleware } = require("../middlewares/whitelist.js");
const { paramsMiddleware } = require("../middlewares/params.js");

const { AdCreativeSignalingMapper } = require("../trackingEvents/tracking-events.js");

const API_DISABLE_SIGN = process.env.API_DISABLE_SIGN == "true";

const router = express.Router();

async function getAds(req, manifestType) {
  //remove all the reserved params from the query params
  // eslint-disable-next-line no-unused-vars
  const { jwt, vasturl, vastidurl, vastid, ...queryParams } = req.query;

  let jwturl = "";
  if (req.jwtPayload) {
    jwturl = req.jwtPayload.url;
  }

  //get the url from decoded jwt, plain vasturl or vastid mapping
  const url = jwturl || vasturl || vastidurl;

  const finalUrl = updateQueryParams(url, queryParams);
  req.log.debug(`initial VAST URL : ${url}`);
  req.log.debug(`final VAST URL: ${finalUrl}`);
  return await getVideoManifests(finalUrl, manifestType);
}

function mapAdCreativeSignaling(ad, trackingEvents) {
  const mapper = new AdCreativeSignalingMapper(ad, trackingEvents);
  const mappedTrackingEvents = mapper.map();

  return mappedTrackingEvents;
}

// HLS Asset List
router.get(
  "/asset-list",
  originWhitelistMiddleware,
  paramsMiddleware,
  async (req, res) => {
    const ads = await getAds(req, "m3u8");
    const assetList = { ASSETS: [] };

    ads.forEach((ad) => {
      const trackingEvents = mapAdCreativeSignaling(ad, ad.trackingEvents);
      assetList.ASSETS.push({
        URI: ad.fileURL,
        DURATION: ad.duration,
        "X-AD-CREATIVE-SIGNALING": {
          version: 2,
          type: "slot",
          payload: [
            {
              type: "linear",
              start: 0.0,
              duration: ad.duration,
              identifiers: [
                {
                  scheme: "urn:com:example:ads:id",
                  value: "972c79e1-2363-403e-9287-a0fa4323c389",
                },
              ],
              tracking: trackingEvents,
            },
          ],
        },
      });
    });

    res.json(assetList);
  }
);

// MPEG-DASH MPD List
router.get(
  "/list-mpd",
  originWhitelistMiddleware,
  paramsMiddleware,
  async (req, res) => {
    const ads = await getAds(req, "mpd");
    res.set("Content-Type", "application/dash+xml");
    res.send(getListMPD(ads));
  }
);

// Sign JWT
router.all("/sign", bodyParser.json(), (req, res) => {
  if (API_DISABLE_SIGN) res.status(401).json({ error: "API disabled" });
  const url = req.body.url || req.query.url;
  if (!url)
    res.status(400).json({
      error:
        "You must send the 'url' as a query parameter when using GET or include it in the JSON body when using POST.",
    });
  res.send(signJWT({ url }));
});

module.exports = router;
