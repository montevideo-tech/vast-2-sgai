const { logger } = require("../utils/logger.js");

const IMPRESSION = "impression";
const PROGRESS = "progress";

class TrackingEvent {
  constructor(type, duration, urls) {
    // console.log(">>>TRACKING EVT: ", type)
    this.type = type;
    //this.duration = duration;
    this.urls = urls;
    //this.start = start;

    if (this.type.startsWith(PROGRESS)) {
      const offsetValue = this.type.split("-")[1];
      if (offsetValue !== null) {
        this.offset =
          typeof offsetValue === "string" && offsetValue.includes("%")
            ? (duration * parseFloat(offsetValue.replace("%", ""))) / 100
            : parseFloat(offsetValue);

        this.type = PROGRESS;

        if (
          isNaN(this.offset) ||
          this.offset < 0 ||
          this.offset > this.duration
        ) {
          throw new Error(`Invalid start value: ${offset}`);
        }
      }
    } else {
      switch (type) {
      case "start":
        this.offset = 0;
        break;

      case "firstQuartile":
        this.offset = duration * 0.25;
        break;

      case "midpoint":
        this.offset = duration * 0.5;
        break;

      case "thirdQuartile":
        this.offset = duration * 0.75;
        break;

      case "complete":
        this.offset = duration;
        break;
      }
    }
  }
}

class AdCreativeSignalingMapper {
  constructor(ad) {
    this.ad = ad;
    console.log(">>>> Ad Tracking", this.ad.trackingEvents);
  }

  map() {
    const newTrackingEvents = this.ad.trackingEvents;

    if (this.ad?.impressions.length > 0)
      newTrackingEvents[IMPRESSION] = this.ad.impressions.map(
        (impression) => impression.url
      );

    const trackingEvents = Object.entries(this.ad.trackingEvents)
      .map(([eventType, urls]) => {
        try {
          const event = new TrackingEvent(eventType, this.ad.duration, urls);
          //console.log(">>> track evt: ", event)
          return event;
        } catch (error) {
          logger.warn(
            `Skipping invalid event: ${eventType}, Error: ${error.message}`
          );

          return null;
        }
      })
      .filter(Boolean);

    return trackingEvents;
  }
}

module.exports = {
  AdCreativeSignalingMapper,
  TrackingEvent,
};
