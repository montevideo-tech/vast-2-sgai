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

const API_DISABLE_SIGN = process.env.API_DISABLE_SIGN == "true";

const router = express.Router();

async function getAds(req, manifestType) {
  //remove all the reserved params from the query params
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

// HLS Asset List
router.get(
  "/asset-list",
  originWhitelistMiddleware,
  paramsMiddleware,
  async (req, res) => {
    const ads = await getAds(req, "m3u8");
    const assetList = { ASSETS: [] };
    ads.forEach((ad) => {
      assetList.ASSETS.push({
        URI: ad.fileURL,
        DURATION: ad.duration,
      });
      res.json(assetList);
    });
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
