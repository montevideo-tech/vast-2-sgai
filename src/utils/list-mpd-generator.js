
const DASH_MIN_BUFFER_TIME = "PT1S";
const DASH_RESOLUTION_TIME_OFFSET = "10"; 

function getListMPD(ads){
  const publishTime = new Date().toISOString(); // Current publish time
    
  // Initialize MPD XML structure
  let mpdXml = `<?xml version="1.0" encoding="UTF-8"?>
  <MPD xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns="urn:mpeg:dash:schema:mpd:2011"
    xsi:schemaLocation="urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd"
    type="list" minBufferTime="${DASH_MIN_BUFFER_TIME}"
    profiles="urn:mpeg:dash:profile:list:2024"
    publishTime="${publishTime}">\n`;
  
  // Generate Period and ImportedMPD elements
  ads.forEach((ad, index) => {
    const earliestResolutionTimeOffset = index === 0 ? 0 : DASH_RESOLUTION_TIME_OFFSET;
    mpdXml += `  <Period id="${index + 1}">
      <ImportedMPD uri="${ad.fileURL}" earliestResolutionTimeOffset="${earliestResolutionTimeOffset}"/>
    </Period>\n`;
  });
  
  // Close MPD element
  mpdXml += "</MPD>";
  return mpdXml;
};

module.exports = getListMPD;