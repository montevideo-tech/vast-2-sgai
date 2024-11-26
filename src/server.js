const express = require('express');
const path = require('path');
const cors = require('cors'); 
const pino = require('pino');
const pinoHttp = require('pino-http');

const logger = pino({
  level: 'debug',
  transport: {
    target: 'pino-pretty'
  }
});
const httpLogger = pinoHttp({ logger });

const app = express();
const PORT = 3000;

app.use(cors());

const samples = require('./routes/samples.js')
//const assetList = require('./routes/asset-list.js')

app.use('/api/samples/', httpLogger, samples);
//app.use('/api/asset-list/', httpLogger, assetList);

// Static samples
app.use(express.static(path.join(__dirname, '../public')));

// Start the server
app.listen(PORT, () => {
  logger.info(`VAST-2-SGAI is running on http://localhost:${PORT}`);
});

module.exports = app;