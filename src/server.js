require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

const samples = require("./routes/samples.js");
const api = require("./routes/api.js");
const { httpLogger, logger } = require("./utils/logger.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use("/api/", httpLogger, api);
app.use("/api/samples/", httpLogger, samples);

// Static samples
app.use(express.static(path.join(__dirname, "../public")));

// Start the server
app.listen(PORT, () => {
  logger.info(`VAST-2-SGAI is running on http://localhost:${PORT}`);
});

module.exports = app;
