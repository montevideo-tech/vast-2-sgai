require("dotenv").config({ path: "src/.env" });
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET_KEY;
const BYPASS_VALIDATION = process.env.JWT_BYPASS_VALIDATION == "true";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "100y";

function signJWT(payload, options = {}) {
  const opt = { ...options, expiresIn: EXPIRES_IN };
  return jwt.sign(payload, SECRET_KEY, opt);
}

function getJWT(token) {
  if (BYPASS_VALIDATION) return jwt.decode(token);
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new Error("Invalid token: " + error);
  }
}

function middlewareJWTHeader(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token not found" });
  }
  try {
    req.jwtPayload = getJWT(token);
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
}

function middlewareJWTQuery(req, res, next) {
  const token = req.query.jwt;

  if (!token)
    return res.status(401).json({ error: "jwt query parameter not found" });
  try {
    req.jwtPayload = getJWT(token);
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }

  if (!req.jwtPayload.url)
    return res.status(401).json({ error: "url not found in jwt" });

  next();
}

module.exports = { signJWT, getJWT, middlewareJWTHeader, middlewareJWTQuery };
