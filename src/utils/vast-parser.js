const VAST = require('@dailymotion/vast-client');

/**
 * Fetches video manifests from a VAST URL.
 * 
 * @param {string} vastUrl - The URL of the VAST XML. It should be a valid URL string.
 * @param {string} manifestType - The type of manifest to filter. It can be either '.mpd' or '.m3u8'.
 * @returns {Promise<Array>} A promise that resolves to an array of objects containing file URLs and durations.
 */
async function getVideoManifests(vastUrl, manifestType) {
    const vastClient = new VAST.VASTClient();
    const parsedVast = await vastClient.get(vastUrl);

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
                            if (mediaFile.fileURL && mediaFile.fileURL.includes(manifestType)) {
                                result.push({ fileURL: mediaFile.fileURL, duration });
                            }
                        }
                    }
                }
            }
        }
    }
    return result;
}

module.exports = getVideoManifests