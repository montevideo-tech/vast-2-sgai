const VAST = require("@dailymotion/vast-client");
const { logger } = require("./logger.js");
/**
 * Fetches video manifests from a VAST URL.
 *
 * @param {string} vastUrl - The URL of the VAST XML. It should be a valid URL string.
 * @param {string} manifestType - The type of manifest to filter. It can be either '.mpd' or '.m3u8'.
 * @returns {Promise<Array>} A promise that resolves to an array of objects containing file URLs and durations.
 */
async function getVideoManifests(vastUrl, manifestType) {
  const vastClient = new VAST.VASTClient();
  let parsedVast;
  try {
    parsedVast = await vastClient.get(vastUrl, { resolveAll: true });
  } catch (error) {
    logger.error(
      "Failed to fetch VAST XML",
      error
    );
    throw new Error(error.message);
  }

  const result = [];

  if (parsedVast.ads) {
    for (let i = 0; i < parsedVast.ads.length; i++) {
      const ad = parsedVast.ads[i];
      if (ad.creatives) {
        for (let j = 0; j < ad.creatives.length; j++) {
          const creative = ad.creatives[j];
          const duration = creative.duration;

          if (creative.mediaFiles) {
            for (let k = 0; k < creative.mediaFiles.length; k++) {
              const mediaFile = creative.mediaFiles[k];
              if (
                mediaFile.fileURL &&
                mediaFile.fileURL.includes(manifestType)
              ) {
                result.push({
                  fileURL: mediaFile.fileURL,
                  duration,
                  trackingEvents: creative.trackingEvents,
                });
              }
            }
          }
        }
      }
    }
  }

  return result;
}

module.exports = getVideoManifests;
