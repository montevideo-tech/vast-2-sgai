const vastMappingEnv = process.env.VAST_MAPPING_JSON || "";

let vastMapping;
try {
  vastMapping = JSON.parse(vastMappingEnv);
} catch {
  vastMapping = {};
}

module.exports = vastMapping;
