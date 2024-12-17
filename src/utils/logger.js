require("dotenv").config();
const pino = require("pino");
const pinoHttp = require("pino-http");

const logger = pino({
  level: process.env.PINO_LOG_LEVEL || "info",
  ...(process.env.PINO_LOG_LEVEL === "debug" ? {
    transport: {
      target: "pino-pretty",
    },
  } : {})
});

const httpLogger = pinoHttp({
  logger,
  serializers: {
    req: pino.stdSerializers.wrapRequestSerializer((req) => {
      return {
        id: req.raw.id,
        method: req.raw.method,
        path: req.raw.url.split("?")[0], // Remove query params which might be sensitive
        // Allowlist useful headers
        headers: {
          host: req.raw.headers.host,
          "user-agent": req.raw.headers["user-agent"],
          referer: req.raw.headers.referer,
        },
      };
    }),
    res: pino.stdSerializers.wrapResponseSerializer((res) => {
      return {
        statusCode: res.raw.statusCode,
        // Allowlist useful headers
        headers: {
          "content-type": res.raw.headers["content-type"],
          "content-length": res.raw.headers["content-length"],
        },
      };
    }),
  },
});

module.exports = { httpLogger, logger };
