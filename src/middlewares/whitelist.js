require("dotenv").config({ path: "src/.env" });

const {
  VAST_WHITELIST: vastWhitelist = "",
  ORIGIN_WHITELIST: originWhitelist = ""
} = process.env;

function vastServerWhitelistMiddleware(req, res, next) {
  const { vasturl } = req.query;

  if (vastWhitelist === "") {
    return next();
  }

  if (!vasturl) {
    return res.status(400).json({ message: "Missing vasturl query param" });
  }

  try {
    const hostname = new URL(vasturl).hostname;
    const isAllowedVast = vastWhitelist.split(",").includes(hostname);

    if (isAllowedVast) {
      return next();
    } else {
      return res
        .status(403)
        .json({ message: "Forbidden: VAST URL not allowed" });
    }
  } catch {
    return res.status(400).json({ message: "Bad Request: Invalid VAST URL" });
  }
}

function originWhitelistMiddleware(req, res, next) {
  const origin = req.headers.origin;

  if (originWhitelist === "") {
    return next();
  }

  if (!origin) {
    return res
      .status(400)
      .json({ message: "Bad Request: Origin header is required" });
  }

  try {
    const hostname = new URL(origin).hostname;
    const isAllowedOrigin = originWhitelist.split(",").includes(hostname);

    if (isAllowedOrigin) {
      return next();
    } else {
      return res
        .status(403)
        .json({ message: "Forbidden: Origin host not allowed" });
    }
  } catch {
    return res
      .status(400)
      .json({ message: "Bad Request: Invalid Origin header" });
  }
}

module.exports = { originWhitelistMiddleware, vastServerWhitelistMiddleware };
