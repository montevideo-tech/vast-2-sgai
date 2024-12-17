const { logger } = require("./logger.js");

function updateQueryParams(url, params) {
  logger.info(url);
  const urlObj = new URL(url);
  logger.info(urlObj);
  // Update or add the params
  for (const [key, value] of Object.entries(params)) {
    urlObj.searchParams.set(key, value);
  }

  // Update or add the params
  for (const [key, value] of Object.entries(params)) {
    urlObj.searchParams.set(key, value);
  }

  return urlObj.toString();
}

module.exports = updateQueryParams;
