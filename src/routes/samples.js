// routes/subroutes.js
const express = require("express");
const VAST = require("@dailymotion/vast-client");
const { logger } = require("../utils/logger.js");

const router = express.Router();

// Basic Asset List
router.get("/asset-list-1", (req, res) => {
  const assetList = {
    ASSETS: [
      {
        URI: "https://flipfit-cdn.akamaized.net/flip_hls/661f570aab9d840019942b80-473e0b/video_h1.m3u8",
        DURATION: 45.0,
      },
    ],
  };
  res.log.info("Return sample: asset-list-1");
  res.json(assetList);
});

// Ad POD
router.get("/asset-list-2", (req, res) => {
  res.json({
    ASSETS: [
      {
        URI: "https://flipfit-cdn.akamaized.net/flip_hls/661f570aab9d840019942b80-473e0b/video_h1.m3u8",
        DURATION: 45.0,
      },
      {
        URI: "https://redirector.gvt1.com/api/manifest/hls_variant/id/f1be9c477e89fd68/itag/0/source/dclk_video_ads/acao/yes/cpn/McGcWKwT0_10xtfw/ctier/L/ei/IuBEZ6rhLtrn1sQP0IXQ8A8/hfr/all/ip/0.0.0.0/keepalive/yes/playlist_type/DVR/requiressl/yes/susc/dvc/xpc/Eghovf3BOnoBAQ%3D%3D/expire/1764103074/sparams/expire,ei,ip,requiressl,acao,ctier,source,playlist_type,hfr,id,itag,susc,xpc/sig/AJfQdSswRAIgc0tQOyv3LSTCNBEv8q_nWaSWwq-EdQ870E7JFyy_dVQCICCKy-TAM88ZpQOHiXKAcgfj1ezoru62WiR_A-1epmla/file/index.m3u8",
        DURATION: 10.0,
      },
    ],
  });
});

router.get("/sample-vast-1", async (req, res) => {
  const vastClient = new VAST.VASTClient();
  const parsedVast = await vastClient.get(
    "http://localhost:3000/samples/sample-vast-1/vast-sample.xml"
  );

  logger.info(parsedVast);
  logger.info(parsedVast.ads[0]);
  logger.info(parsedVast.ads[0].creatives[0]);
  logger.info(parsedVast.ads[0].creatives[0].mediaFiles[4]);

  const fileURL = parsedVast.ads[0].creatives[0].mediaFiles[4].fileURL;
  const duration = parsedVast.ads[0].creatives[0].duration;
  res.json({
    ASSETS: [
      {
        URI: fileURL,
        DURATION: duration,
      },
    ],
  });
});

router.get("/sample-ad-signaling", async (req, res) => {
  try {
    const vastUrl =
      "http://localhost:3000/api/asset-list?vasturl=http://localhost:3000/samples/sample-ad-signaling/vast-sample.xml";

    const response = await fetch(vastUrl);

    if (!response.ok) {
      const errorMessage = `Failed to fetch VAST: HTTP ${response.status} - ${response.statusText}`;
      logger.error(errorMessage);
      return res.status(response.status).json({ error: errorMessage });
    }

    const parsedVast = await response.json();

    return res.json(parsedVast);
  } catch (error) {
    logger.error("Error occurred while fetching VAST:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;
